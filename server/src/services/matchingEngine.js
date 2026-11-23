const env = require('../config/env');

/**
 * Calculates cosine similarity between two numeric vectors.
 * Returns float between -1.0 and 1.0 (clamped between 0.0 and 1.0 for loss/found relevance).
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Computes Haversine surface distance in meters between two lat/lng coordinates.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Computes multimodal match score between an item pair, incorporating
 * AI semantics (MPNet/CLIP), GPS distance proximity, and reported time window.
 */
function scoreItemPair(itemA, itemB, options = {}) {
  const weightText = options.weightText ?? env.WEIGHT_TEXT ?? 0.5;
  const weightImage = options.weightImage ?? env.WEIGHT_IMAGE ?? 0.5;

  let textScore = 0;
  let imageScore = 0;
  let hasTextMatch = false;
  let hasImageMatch = false;

  // 1. Text Similarity (MPNet 768-dim)
  if (
    itemA.textEmbedding &&
    itemB.textEmbedding &&
    itemA.textEmbedding.length > 0 &&
    itemB.textEmbedding.length > 0
  ) {
    textScore = cosineSimilarity(itemA.textEmbedding, itemB.textEmbedding);
    hasTextMatch = true;
  }

  // 2. Image Similarity (CLIP 512-dim)
  if (
    itemA.imageEmbedding &&
    itemB.imageEmbedding &&
    itemA.imageEmbedding.length > 0 &&
    itemB.imageEmbedding.length > 0
  ) {
    imageScore = cosineSimilarity(itemA.imageEmbedding, itemB.imageEmbedding);
    hasImageMatch = true;
  }

  let semanticScore = 0;
  if (hasTextMatch && hasImageMatch) {
    const totalWeight = weightText + weightImage;
    semanticScore = (weightText * textScore + weightImage * imageScore) / totalWeight;
  } else if (hasTextMatch) {
    semanticScore = textScore;
  } else if (hasImageMatch) {
    semanticScore = imageScore;
  } else if (itemA.clipTextEmbedding && itemB.imageEmbedding) {
    semanticScore = cosineSimilarity(itemA.clipTextEmbedding, itemB.imageEmbedding);
  } else if (itemB.clipTextEmbedding && itemA.imageEmbedding) {
    semanticScore = cosineSimilarity(itemB.clipTextEmbedding, itemA.imageEmbedding);
  }

  // 3. Geolocation Proximity Score (Haversine)
  let geoScore = 1.0;
  let distanceMeters = null;
  let hasGeo = false;

  const coordsA = itemA.location?.coordinates;
  const coordsB = itemB.location?.coordinates;

  if (
    Array.isArray(coordsA) &&
    Array.isArray(coordsB) &&
    coordsA.length >= 2 &&
    coordsB.length >= 2 &&
    (Math.abs(coordsA[0]) > 0.0001 || Math.abs(coordsA[1]) > 0.0001) &&
    (Math.abs(coordsB[0]) > 0.0001 || Math.abs(coordsB[1]) > 0.0001)
  ) {
    // GeoJSON is [longitude, latitude]
    distanceMeters = haversineDistance(coordsA[1], coordsA[0], coordsB[1], coordsB[0]);
    hasGeo = true;
    const maxRadius = Math.max(itemA.location?.radiusMeters || 500, itemB.location?.radiusMeters || 500, 1000);

    if (distanceMeters <= maxRadius) {
      geoScore = Math.max(0.5, 1.0 - (distanceMeters / (maxRadius * 1.5)));
    } else {
      // Degrades gently beyond max radius
      geoScore = Math.max(0.1, 1.0 - (distanceMeters / 5000));
    }
  }

  // 4. Time Window Score
  let timeScore = 1.0;
  if (itemA.date && itemB.date) {
    const diffHours = Math.abs(new Date(itemA.date) - new Date(itemB.date)) / (1000 * 60 * 60);
    if (diffHours <= 48) {
      timeScore = 1.0;
    } else if (diffHours <= 168) {
      timeScore = 0.85; // within 1 week
    } else {
      timeScore = 0.65;
    }
  }

  // Combined Match Score
  let finalScore = semanticScore;
  if (hasGeo) {
    finalScore = 0.60 * semanticScore + 0.30 * geoScore + 0.10 * timeScore;
  }

  let confidenceLabel = 'Weak match';
  if (finalScore >= 0.78) {
    confidenceLabel = 'Strong match';
  } else if (finalScore >= 0.58) {
    confidenceLabel = 'Possible match';
  }

  return {
    textScore: Math.round(textScore * 10000) / 10000,
    imageScore: Math.round(imageScore * 10000) / 10000,
    geoScore: Math.round(geoScore * 10000) / 10000,
    timeScore: Math.round(timeScore * 10000) / 10000,
    distanceMeters,
    finalScore: Math.round(finalScore * 10000) / 10000,
    percentage: Math.round(finalScore * 100),
    confidenceLabel
  };
}

/**
 * Evaluates candidate items against a query item.
 * Filters by opposite status, prioritizes same category, and ranks top-K.
 */
function rankCandidates(queryItem, candidates, options = {}) {
  const matchThreshold = options.matchThreshold ?? env.MATCH_THRESHOLD ?? 0.75;
  const possibleThreshold = options.possibleThreshold ?? env.POSSIBLE_MATCH_THRESHOLD ?? 0.60;
  const topK = options.topK ?? 5;

  const oppositeStatus = queryItem.status === 'lost' ? 'found' : 'lost';

  // Filter candidates: opposite status and not self
  const validCandidates = candidates.filter(
    (c) =>
      c.status === oppositeStatus &&
      String(c._id || c.id) !== String(queryItem._id || queryItem.id) &&
      c.state !== 'returned'
  );

  // Group by category preference (same category first)
  const sameCategory = validCandidates.filter((c) => c.category === queryItem.category);
  const otherCategory = validCandidates.filter((c) => c.category !== queryItem.category);

  // Score all candidates
  const scoredSame = sameCategory.map((cand) => {
    const scores = scoreItemPair(queryItem, cand, options);
    return {
      candidate: cand,
      ...scores,
      isSameCategory: true
    };
  });

  const scoredOther = otherCategory.map((cand) => {
    const scores = scoreItemPair(queryItem, cand, options);
    return {
      candidate: cand,
      ...scores,
      isSameCategory: false
    };
  });

  // Sort: same category above threshold first, then by finalScore descending
  const allScored = [...scoredSame, ...scoredOther].sort((a, b) => b.finalScore - a.finalScore);

  const topCandidates = allScored.slice(0, topK);
  const bestMatch = topCandidates.length > 0 ? topCandidates[0] : null;
  const isMatch = bestMatch && bestMatch.finalScore >= matchThreshold;
  const isPossibleMatch = bestMatch && bestMatch.finalScore >= possibleThreshold;

  return {
    queryItemId: queryItem._id || queryItem.id,
    bestMatch,
    isMatch: Boolean(isMatch),
    isPossibleMatch: Boolean(isPossibleMatch),
    topCandidates
  };
}

module.exports = {
  cosineSimilarity,
  haversineDistance,
  scoreItemPair,
  rankCandidates
};
