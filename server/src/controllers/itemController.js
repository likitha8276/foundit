const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');
const Item = require('../models/Item');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const mlClient = require('../services/mlClient');
const { rankCandidates } = require('../services/matchingEngine');
const { emitToUser } = require('../services/socketService');
const { logger } = require('../config/db');

// Helper to sanitize/clean text input
function cleanText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s\-\.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Upload a new Lost or Found Item
 */
const createItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { name, category, description, date, status, finderName, finderPhone, latitude, longitude, locationName, radiusMeters } = req.body;
    const cleanedText = cleanText(`${name}. ${category}. ${description}`);

    let imageUrl = null;
    let filePath = null;
    if (req.file) {
      imageUrl = `/uploads/${path.basename(req.file.path)}`;
      filePath = req.file.path;
    }

    // Call ML service for embeddings
    let textEmbedding = [];
    let imageEmbedding = [];

    try {
      if (cleanedText && filePath) {
        const embeddings = await mlClient.getMultimodalEmbedding(cleanedText, filePath);
        textEmbedding = embeddings.textEmbedding || [];
        imageEmbedding = embeddings.imageEmbedding || [];
      } else if (cleanedText) {
        textEmbedding = await mlClient.getTextEmbedding(cleanedText);
      } else if (filePath) {
        imageEmbedding = await mlClient.getImageEmbedding(filePath);
      }
    } catch (mlErr) {
      logger.warn(`ML Service unavailable during item creation (${mlErr.message}). Continuing with empty embeddings.`);
    }

    // Contact info: default to user's profile info if not explicitly supplied
    const contact = {
      name: finderName || req.user.name,
      phone: finderPhone || req.user.phone || ''
    };

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const location = {
      type: 'Point',
      coordinates: (!isNaN(lng) && !isNaN(lat)) ? [lng, lat] : [0, 0],
      name: locationName || '',
      radiusMeters: parseFloat(radiusMeters) || 500
    };

    const newItem = await Item.create({
      userId: req.user._id,
      name,
      category,
      description,
      cleanedText,
      date: new Date(date),
      location,
      status,
      imageUrl,
      textEmbedding: textEmbedding.length > 0 ? textEmbedding : undefined,
      imageEmbedding: imageEmbedding.length > 0 ? imageEmbedding : undefined,
      state: 'searching',
      moderation: 'approved', // Auto-approved for demo flow, can be moderated by admin
      contact
    });

    // Run matching engine immediately against candidate items of opposite status
    const oppositeStatus = status === 'lost' ? 'found' : 'lost';
    const candidateItems = await Item.find({
      status: oppositeStatus,
      state: { $in: ['searching', 'matched'] },
      moderation: 'approved'
    }).select('+textEmbedding +imageEmbedding');

    let matchResult = null;
    let createdMatch = null;

    if (candidateItems.length > 0 && (textEmbedding.length > 0 || imageEmbedding.length > 0)) {
      matchResult = rankCandidates(
        {
          _id: newItem._id,
          status: newItem.status,
          category: newItem.category,
          textEmbedding,
          imageEmbedding
        },
        candidateItems
      );

      if (matchResult && matchResult.hasMatch && matchResult.bestMatch) {
        const bestCandidate = matchResult.bestMatch.candidate;
        const lostItemId = status === 'lost' ? newItem._id : bestCandidate._id;
        const foundItemId = status === 'found' ? newItem._id : bestCandidate._id;

        createdMatch = await Match.create({
          lostItemId,
          foundItemId,
          textScore: matchResult.bestMatch.textScore,
          imageScore: matchResult.bestMatch.imageScore,
          finalScore: matchResult.bestMatch.finalScore,
          state: 'suggested'
        });

        // Update item states
        newItem.state = 'matched';
        await newItem.save();
        await Item.findByIdAndUpdate(bestCandidate._id, { state: 'matched' });

        // Identify lost owner and finder
        const lostOwnerId = status === 'lost' ? req.user._id : bestCandidate.userId;
        const finderUserId = status === 'found' ? req.user._id : bestCandidate.userId;

        // Create Notifications
        const notifLost = await Notification.create({
          userId: lostOwnerId,
          type: 'match_found',
          message: `A likely match was found for your lost item "${newItem.name}" with similarity score ${Math.round(matchResult.bestMatch.finalScore * 100)}%!`,
          matchId: createdMatch._id
        });

        const notifFound = await Notification.create({
          userId: finderUserId,
          type: 'match_found',
          message: `Your found item "${bestCandidate.name}" matched a reported lost item with similarity ${Math.round(matchResult.bestMatch.finalScore * 100)}%!`,
          matchId: createdMatch._id
        });

        // Emit real-time Socket.IO notifications
        emitToUser(lostOwnerId.toString(), 'match_found', notifLost);
        emitToUser(finderUserId.toString(), 'match_found', notifFound);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Item reported successfully.',
      item: newItem.toJSON(),
      hasMatch: !!(matchResult && matchResult.hasMatch),
      match: createdMatch,
      topCandidates: matchResult ? matchResult.rankedMatches.slice(0, 3) : []
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

/**
 * Get public or filtered items list
 */
const getItems = async (req, res, next) => {
  try {
    const { status, category, search, mine, state } = req.query;
    const filter = { moderation: 'approved' };

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (state) filter.state = state;

    if (mine === 'true' && req.user) {
      filter.userId = req.user._id;
      // Allow user to see their own pending items
      delete filter.moderation;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (req.query.lat && req.query.lng) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const maxDistance = parseFloat(req.query.radius) || 5000;
      if (!isNaN(lat) && !isNaN(lng)) {
        filter['location.coordinates'] = {
          $ne: [0, 0]
        };
      }
    }

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    // Never expose finder contact details or embeddings in public searches
    const sanitizedItems = items.map((item) => {
      const obj = item.toJSON();
      if (!req.user || String(item.userId?._id || item.userId) !== String(req.user._id)) {
        // Blur contact for privacy
        delete obj.contact;
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      count: sanitizedItems.length,
      items: sanitizedItems
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single item by ID
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('userId', 'name email phone');
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    const obj = item.toJSON();
    // Protect contact info: only owner or verified match recipient can see contact info
    const isOwner = req.user && String(item.userId._id || item.userId) === String(req.user._id);
    if (!isOwner) {
      delete obj.contact;
    }

    res.status(200).json({
      success: true,
      item: obj
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update an item
 */
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    if (String(item.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this item.' });
    }

    const { name, category, description, state } = req.body;
    if (name) item.name = name;
    if (category) item.category = category;
    if (description) item.description = description;
    if (state) item.state = state;

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item updated successfully.',
      item: item.toJSON()
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete an item
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    if (String(item.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this item.' });
    }

    // Delete image if on disk
    if (item.imageUrl) {
      const diskPath = path.resolve(__dirname, '../../', item.imageUrl.replace(/^\//, ''));
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (e) {
          logger.warn(`Could not delete file ${diskPath}: ${e.message}`);
        }
      }
    }

    // Delete associated matches
    await Match.deleteMany({
      $or: [{ lostItemId: item._id }, { foundItemId: item._id }]
    });

    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Item successfully deleted.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem
};
