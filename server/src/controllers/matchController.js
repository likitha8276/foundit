const Match = require('../models/Match');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const { emitToUser } = require('../services/socketService');

/**
 * Get all matches relevant to the authenticated user
 */
const getMyMatches = async (req, res, next) => {
  try {
    const userItems = await Item.find({ userId: req.user._id }).select('_id status');
    const userItemIds = userItems.map((item) => item._id);

    const matches = await Match.find({
      $or: [{ lostItemId: { $in: userItemIds } }, { foundItemId: { $in: userItemIds } }]
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'lostItemId',
        select: '-textEmbedding -imageEmbedding',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'foundItemId',
        select: '-textEmbedding -imageEmbedding',
        populate: { path: 'userId', select: 'name email' }
      });

    // Sensitive data filter: Reveal finder's contact details ONLY to the owner of the matching lost item
    const formatted = matches.map((match) => {
      const mObj = match.toObject();
      const isLostOwner =
        mObj.lostItemId &&
        String(mObj.lostItemId.userId?._id || mObj.lostItemId.userId) === String(req.user._id);

      if (mObj.foundItemId) {
        // If user is NOT the verified lost owner with a match >= 0.75 or confirmed, hide contact
        if (!isLostOwner || (mObj.finalScore < 0.75 && mObj.state !== 'confirmed')) {
          delete mObj.foundItemId.contact;
        }
      }
      return mObj;
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      matches: formatted
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Lost owner initiates claim: "This is mine"
 */
const claimMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('lostItemId')
      .populate('foundItemId');

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    if (String(match.lostItemId.userId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner of the lost item can initiate a claim.'
      });
    }

    match.state = 'claimed';
    await match.save();

    await Item.findByIdAndUpdate(match.lostItemId._id, { state: 'claimed' });
    await Item.findByIdAndUpdate(match.foundItemId._id, { state: 'claimed' });

    // Notify the finder
    const finderId = match.foundItemId.userId;
    const notif = await Notification.create({
      userId: finderId,
      type: 'claim_requested',
      message: `${req.user.name} has claimed the found item "${match.foundItemId.name}" as theirs. Please confirm or reject.`,
      matchId: match._id
    });

    emitToUser(finderId.toString(), 'claim_update', notif);

    res.status(200).json({
      success: true,
      message: 'Claim requested successfully. Waiting for finder confirmation.',
      match
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Finder confirms or verifies claim
 */
const confirmMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('lostItemId')
      .populate('foundItemId');

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    if (String(match.foundItemId.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the finder or an admin can confirm a claim.'
      });
    }

    match.state = 'confirmed';
    await match.save();

    // Mark both items as Returned
    await Item.findByIdAndUpdate(match.lostItemId._id, { state: 'returned' });
    await Item.findByIdAndUpdate(match.foundItemId._id, { state: 'returned' });

    // Notify lost item owner that their item has been verified and returned!
    const lostOwnerId = match.lostItemId.userId;
    const notif = await Notification.create({
      userId: lostOwnerId,
      type: 'claim_confirmed',
      message: `Your claim for "${match.lostItemId.name}" has been confirmed! Contact info: ${match.foundItemId.contact?.name || 'Finder'} (${match.foundItemId.contact?.phone || 'No phone provided'})`,
      matchId: match._id
    });

    emitToUser(lostOwnerId.toString(), 'claim_update', notif);

    res.status(200).json({
      success: true,
      message: 'Claim confirmed! Items marked as Returned.',
      match
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Finder rejects claim
 */
const rejectMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('lostItemId')
      .populate('foundItemId');

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    if (String(match.foundItemId.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the finder or an admin can reject a claim.'
      });
    }

    match.state = 'rejected';
    await match.save();

    // Reset items to searching
    await Item.findByIdAndUpdate(match.lostItemId._id, { state: 'searching' });
    await Item.findByIdAndUpdate(match.foundItemId._id, { state: 'searching' });

    const lostOwnerId = match.lostItemId.userId;
    const notif = await Notification.create({
      userId: lostOwnerId,
      type: 'general',
      message: `The claim for "${match.lostItemId.name}" was declined by the finder. The item has been placed back in Searching status.`,
      matchId: match._id
    });

    emitToUser(lostOwnerId.toString(), 'claim_update', notif);

    res.status(200).json({
      success: true,
      message: 'Claim declined. Item returned to searching pool.',
      match
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyMatches,
  claimMatch,
  confirmMatch,
  rejectMatch
};
