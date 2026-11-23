const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const env = require('../config/env');
const { connectDB, disconnectDB, logger } = require('../config/db');
const User = require('../models/User');
const Item = require('../models/Item');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// Precomputed 768-dim normalized embedding generator for demo items
function createMockVector(dim, seed) {
  const vec = [];
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    const val = Math.sin(seed * (i + 1)) * Math.cos(seed * (i + 2));
    vec.push(val);
    norm += val * val;
  }
  const mag = Math.sqrt(norm);
  return vec.map((v) => v / (mag || 1));
}

// Generate high similarity vector
function createSimilarVector(baseVec, similarity = 0.88) {
  const noise = createMockVector(baseVec.length, 999);
  const alpha = similarity;
  const beta = Math.sqrt(Math.max(0, 1 - alpha * alpha));
  const res = baseVec.map((v, i) => alpha * v + beta * noise[i]);
  let norm = 0;
  for (let v of res) norm += v * v;
  const mag = Math.sqrt(norm);
  return res.map((v) => v / (mag || 1));
}

async function populateDemoData() {
  logger.info('Clearing old collections...');
  await Promise.all([
    User.deleteMany({}),
    Item.deleteMany({}),
    Match.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({})
  ]);

  logger.info('Creating demo users...');
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('AdminPass123!', salt);
  const userPass = await bcrypt.hash('UserPass123!', salt);

  const admin = await User.create({
    name: 'System Administrator',
    email: 'admin@lostfound.local',
    passwordHash: adminPass,
    phone: '+91 98765 01000',
    role: 'admin',
    isActive: true
  });

  const user1 = await User.create({
    name: 'Priya Sharma',
    email: 'user1@lostfound.local',
    passwordHash: userPass,
    phone: '+91 98451 01010',
    role: 'user',
    isActive: true
  });

  const user2 = await User.create({
    name: 'Ganga Raman',
    email: 'user2@lostfound.local',
    passwordHash: userPass,
    phone: '+91 75639 28847',
    role: 'user',
    isActive: true
  });

  const user3 = await User.create({
    name: 'Rohan Verma',
    email: 'user3@lostfound.local',
    passwordHash: userPass,
    phone: '+91 98123 01030',
    role: 'user',
    isActive: false // Disabled user for testing
  });

  logger.info('Creating 20 demo items with realistic lost/found pairs...');

    // Base vectors
    const walletVec = createMockVector(768, 101);
    const walletImgVec = createMockVector(512, 102);

    const bagVec = createMockVector(768, 201);
    const bagImgVec = createMockVector(512, 202);

    const bottleVec = createMockVector(768, 301);
    const bottleImgVec = createMockVector(512, 302);

    const phoneVec = createMockVector(768, 401);
    const phoneImgVec = createMockVector(512, 402);

    // 1. Lost black leather wallet (User 1)
    const lostWallet = await Item.create({
      userId: user1._id,
      name: 'Black Leather Wallet',
      category: 'wallet',
      description: 'Lost men black bifold leather wallet with campus student ID card and bus pass.',
      cleanedText: 'black leather wallet lost men black bifold leather wallet with campus student id card and bus pass.',
      date: new Date(Date.now() - 2 * 86400000),
      status: 'lost',
      location: {
        type: 'Point',
        coordinates: [80.5002, 16.4971],
        name: 'Central Library, 2nd Floor',
        radiusMeters: 100
      },
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
      textEmbedding: walletVec,
      imageEmbedding: walletImgVec,
      state: 'matched',
      moderation: 'approved',
      contact: { name: user1.name, phone: user1.phone }
    });

    // 2. Found black wallet matching lostWallet (User 2 - Ganga)
    const foundWallet = await Item.create({
      userId: user2._id,
      name: 'Found Black Wallet',
      category: 'wallet',
      description: 'Found a black leather bifold wallet on library 2nd floor desk near study cubicles.',
      cleanedText: 'found black wallet found a black leather bifold wallet on library 2nd floor desk near study cubicles.',
      date: new Date(Date.now() - 1 * 86400000),
      status: 'found',
      location: {
        type: 'Point',
        coordinates: [80.5005, 16.4973],
        name: 'Library 2nd Floor Cubicles',
        radiusMeters: 60
      },
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
      textEmbedding: createSimilarVector(walletVec, 0.91),
      imageEmbedding: createSimilarVector(walletImgVec, 0.86),
      state: 'matched',
      moderation: 'approved',
      contact: { name: user2.name, phone: user2.phone }
    });

    // Match 1
    const match1 = await Match.create({
      lostItemId: lostWallet._id,
      foundItemId: foundWallet._id,
      textScore: 0.91,
      imageScore: 0.86,
      finalScore: 0.885,
      state: 'suggested'
    });

    // Notification for User 1
    await Notification.create({
      userId: user1._id,
      type: 'match_found',
      message: `A likely match was found for your lost item "Black Leather Wallet" with similarity score 89%!`,
      matchId: match1._id
    });

    // Notification for User 2
    await Notification.create({
      userId: user2._id,
      type: 'match_found',
      message: `Your found item "Found Black Wallet" matched a reported lost item with similarity score 89%!`,
      matchId: match1._id
    });

    // 3. School bag (Matching Paper Fig. 6)
    const lostBag = await Item.create({
      userId: user1._id,
      name: 'School Bag',
      category: 'bag',
      description: 'Blue and black storage school bag backpack with zipper compartments.',
      cleanedText: 'school bag blue and black storage school bag backpack with zipper compartments.',
      date: new Date(Date.now() - 5 * 86400000),
      status: 'lost',
      location: {
        type: 'Point',
        coordinates: [80.4998, 16.4965],
        name: 'Sports Complex Lockers',
        radiusMeters: 150
      },
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      textEmbedding: bagVec,
      imageEmbedding: bagImgVec,
      state: 'matched',
      moderation: 'approved',
      contact: { name: user1.name, phone: user1.phone }
    });

    const foundBag = await Item.create({
      userId: user2._id,
      name: 'Blue School Bag',
      category: 'bag',
      description: 'Blue storage backpack left near gym lockers.',
      cleanedText: 'blue school bag blue storage backpack left near gym lockers.',
      date: new Date(Date.now() - 4 * 86400000),
      status: 'found',
      location: {
        type: 'Point',
        coordinates: [80.5001, 16.4968],
        name: 'Gym Lockers Hallway',
        radiusMeters: 80
      },
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      textEmbedding: createSimilarVector(bagVec, 0.88),
      imageEmbedding: createSimilarVector(bagImgVec, 0.84),
      state: 'matched',
      moderation: 'approved',
      contact: { name: 'Ganga', phone: '7563928847' }
    });

    const match2 = await Match.create({
      lostItemId: lostBag._id,
      foundItemId: foundBag._id,
      textScore: 0.88,
      imageScore: 0.84,
      finalScore: 0.86,
      state: 'suggested'
    });

    await Notification.create({
      userId: user1._id,
      type: 'match_found',
      message: `A match has been found for "School Bag"! Finder's Name: Ganga, Phone: 7563928847`,
      matchId: match2._id
    });

    // 4. Bottle (Matching Paper Fig. 6)
    const lostBottle = await Item.create({
      userId: user1._id,
      name: 'Water Bottle',
      category: 'bottle',
      description: 'Blue and black sipper bottle.',
      cleanedText: 'water bottle blue and black sipper bottle.',
      date: new Date(Date.now() - 7 * 86400000),
      status: 'lost',
      location: {
        type: 'Point',
        coordinates: [80.5012, 16.4981],
        name: 'Food Court & Dining Hall',
        radiusMeters: 120
      },
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
      textEmbedding: bottleVec,
      imageEmbedding: bottleImgVec,
      state: 'matched',
      moderation: 'approved',
      contact: { name: user1.name, phone: user1.phone }
    });

    const foundBottle = await Item.create({
      userId: user2._id,
      name: 'Bottle',
      category: 'bottle',
      description: 'Blue, black sipper bottle found in sports hall.',
      cleanedText: 'bottle blue, black sipper bottle found in sports hall.',
      date: new Date(Date.now() - 6 * 86400000),
      status: 'found',
      location: {
        type: 'Point',
        coordinates: [80.5010, 16.4979],
        name: 'Sports Hall Seating Area',
        radiusMeters: 60
      },
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
      textEmbedding: createSimilarVector(bottleVec, 0.93),
      imageEmbedding: createSimilarVector(bottleImgVec, 0.89),
      state: 'matched',
      moderation: 'approved',
      contact: { name: 'Illy', phone: '9884529946' }
    });

    await Match.create({
      lostItemId: lostBottle._id,
      foundItemId: foundBottle._id,
      textScore: 0.93,
      imageScore: 0.89,
      finalScore: 0.91,
      state: 'suggested'
    });

    // 5. Basketball (Matching Paper Fig. 6: ball, toys, basketball brown colour, status Finding)
    await Item.create({
      userId: user1._id,
      name: 'Ball',
      category: 'other',
      description: 'Basketball brown colour with black grip lines.',
      cleanedText: 'ball basketball brown colour with black grip lines.',
      date: new Date(Date.now() - 10 * 86400000),
      status: 'lost',
      location: {
        type: 'Point',
        coordinates: [80.4995, 16.4962],
        name: 'Outdoor Basketball Courts',
        radiusMeters: 100
      },
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80',
      textEmbedding: createMockVector(768, 501),
      imageEmbedding: createMockVector(512, 502),
      state: 'searching',
      moderation: 'approved',
      contact: { name: user1.name, phone: user1.phone }
    });

    // Additional realistic demo items to reach 20
    const extraItems = [
      { name: 'iPhone 14 Black', category: 'phone', desc: 'Black iPhone 14 in transparent silicone case.', status: 'lost', user: user1, loc: 'Main Auditorium', lng: 80.5008, lat: 16.4975, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80' },
      { name: 'Keys with Honda Fob', category: 'keys', desc: 'Car key with black Honda remote and blue lanyard.', status: 'found', user: user2, loc: 'North Parking Lot', lng: 80.4988, lat: 16.4985, img: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80' },
      { name: 'Denim Jacket', category: 'clothing', desc: 'Blue vintage denim jacket size M left on cafeteria chair.', status: 'found', user: user2, loc: 'Student Cafeteria', lng: 80.5015, lat: 16.4978, img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80' },
      { name: 'Student ID Card', category: 'documents', desc: 'University student ID card belonging to engineering student.', status: 'found', user: user2, loc: 'Administration Block', lng: 80.5003, lat: 16.4969, img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80' },
      { name: 'Sony WH-1000XM4 Headphones', category: 'electronics', desc: 'Black over-ear wireless headphones in black travel case.', status: 'lost', user: user1, loc: 'Study Pod 4, Library', lng: 80.5004, lat: 16.4972, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
      { name: 'Silver Thermos Flask', category: 'bottle', desc: 'Stainless steel 750ml flask with dent on bottom edge.', status: 'lost', user: user1, loc: 'Lecture Hall 102', lng: 80.4996, lat: 16.4978, img: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80' },
      { name: 'HP Spectre Laptop Charger', category: 'electronics', desc: '65W USB-C black power adapter charger.', status: 'found', user: user2, loc: 'Computer Lab 3', lng: 80.5011, lat: 16.4967, img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80' },
      { name: 'Gym Duffel Bag', category: 'bag', desc: 'Red and grey Nike gym duffel bag containing shoes.', status: 'lost', user: user2, loc: 'Gymnasium Entrance', lng: 80.4999, lat: 16.4964, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80' },
      { name: 'Wireless Mouse', category: 'electronics', desc: 'Logitech MX Master 3S dark grey ergonomic mouse.', status: 'found', user: user1, loc: 'Innovation Lab Desk 12', lng: 80.5007, lat: 16.4974, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80' },
      { name: 'House Keyring', category: 'keys', desc: 'Brass keys with Eiffel Tower brass keychain.', status: 'lost', user: user1, loc: 'Bicycle Stands West', lng: 80.4989, lat: 16.4971, img: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80' },
      { name: 'Scientific Calculator', category: 'electronics', desc: 'Casio fx-991EX Classwiz scientific calculator with cover.', status: 'found', user: user2, loc: 'Mathematics Wing 304', lng: 80.5005, lat: 16.4974, img: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80' },
      { name: 'Leather Passport Holder', category: 'documents', desc: 'Brown leather passport holder with boarding passes.', status: 'lost', user: user2, loc: 'Campus Transit Stop', lng: 80.4984, lat: 16.4968, img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80' },
      { name: 'Ray-Ban Sunglasses', category: 'other', desc: 'Classic black Wayfarer sunglasses in brown leather case.', status: 'found', user: user1, loc: 'Courtyard Benches', lng: 80.5012, lat: 16.4982, img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80' },
      { name: 'Umbrella', category: 'other', desc: 'Compact automatic foldable black umbrella with wooden handle.', status: 'lost', user: user1, loc: 'Main Gate Security', lng: 80.4981, lat: 16.4960, img: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600&auto=format&fit=crop&q=80' }
    ];

    for (let i = 0; i < extraItems.length; i++) {
      const it = extraItems[i];
      await Item.create({
        userId: it.user._id,
        name: it.name,
        category: it.category,
        description: it.desc,
        cleanedText: `${it.name.toLowerCase()} ${it.desc.toLowerCase()}`,
        date: new Date(Date.now() - (i + 1) * 86400000),
        status: it.status,
        location: {
          type: 'Point',
          coordinates: [it.lng, it.lat],
          name: it.loc,
          radiusMeters: 100
        },
        imageUrl: it.img,
        textEmbedding: createMockVector(768, 600 + i),
        imageEmbedding: createMockVector(512, 700 + i),
        state: 'searching',
        moderation: 'approved',
        contact: { name: it.user.name, phone: it.user.phone }
      });
    }

    // Add Audit Log entry
    await AuditLog.create({
      adminId: admin._id,
      action: 'SYSTEM_INITIALIZATION',
      targetType: 'system',
      targetId: 'INIT-001',
      details: { note: 'Database successfully seeded with demo users and 20 benchmark items.' }
    });

    logger.info('Database seeding completed successfully!');
    logger.info('Admin Credentials: admin@lostfound.local / AdminPass123!');
    logger.info('User 1 Credentials: user1@lostfound.local / UserPass123!');
    logger.info('User 2 Credentials: user2@lostfound.local / UserPass123!');
}

async function seed() {
  try {
    await connectDB();
    await populateDemoData();
    await disconnectDB();
  } catch (err) {
    logger.error('Database seeding failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0));
}

module.exports = { seed, populateDemoData };
