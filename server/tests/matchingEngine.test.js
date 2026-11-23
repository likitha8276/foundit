const {
  cosineSimilarity,
  scoreItemPair,
  rankCandidates
} = require('../src/services/matchingEngine');

describe('Pure Matching Engine Suite', () => {
  describe('cosineSimilarity', () => {
    test('computes 1.0 for identical vectors', () => {
      const v = [0.6, 0.8];
      expect(cosineSimilarity(v, v)).toBeCloseTo(1.0, 4);
    });

    test('computes 0.0 for orthogonal vectors', () => {
      const v1 = [1, 0];
      const v2 = [0, 1];
      expect(cosineSimilarity(v1, v2)).toBeCloseTo(0.0, 4);
    });

    test('handles empty or mismatched vectors gracefully', () => {
      expect(cosineSimilarity([], [])).toBe(0);
      expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
      expect(cosineSimilarity(null, [1])).toBe(0);
    });
  });

  describe('scoreItemPair', () => {
    test('hybrid item computes weighted average of text and image scores', () => {
      const itemA = {
        textEmbedding: [1, 0],
        imageEmbedding: [0.6, 0.8]
      };
      const itemB = {
        textEmbedding: [1, 0], // text sim = 1.0
        imageEmbedding: [0.6, 0.8] // image sim = 1.0
      };

      const score = scoreItemPair(itemA, itemB, { weightText: 0.5, weightImage: 0.5 });
      expect(score.textScore).toBe(1.0);
      expect(score.imageScore).toBe(1.0);
      expect(score.finalScore).toBe(1.0);
    });

    test('text-only query uses textScore exclusively', () => {
      const itemA = { textEmbedding: [1, 0] };
      const itemB = { textEmbedding: [0.7071, 0.7071] };

      const score = scoreItemPair(itemA, itemB);
      expect(score.textScore).toBeCloseTo(0.7071, 3);
      expect(score.imageScore).toBe(0);
      expect(score.finalScore).toBeCloseTo(0.7071, 3);
    });

    test('image-only query uses imageScore exclusively', () => {
      const itemA = { imageEmbedding: [0, 1] };
      const itemB = { imageEmbedding: [0, 1] };

      const score = scoreItemPair(itemA, itemB);
      expect(score.textScore).toBe(0);
      expect(score.imageScore).toBe(1.0);
      expect(score.finalScore).toBe(1.0);
    });
  });

  describe('rankCandidates', () => {
    const queryLost = {
      _id: 'lost-1',
      status: 'lost',
      category: 'wallet',
      textEmbedding: [1, 0],
      imageEmbedding: [1, 0]
    };

    const candidates = [
      {
        _id: 'found-perfect',
        status: 'found',
        category: 'wallet',
        textEmbedding: [1, 0],
        imageEmbedding: [1, 0]
      },
      {
        _id: 'found-moderate',
        status: 'found',
        category: 'wallet',
        textEmbedding: [0.7, 0.714],
        imageEmbedding: [0.6, 0.8]
      },
      {
        _id: 'found-wrong-category',
        status: 'found',
        category: 'bottle',
        textEmbedding: [0.2, 0.97],
        imageEmbedding: [0.1, 0.99]
      },
      {
        _id: 'lost-another',
        status: 'lost', // should be excluded because same status
        category: 'wallet',
        textEmbedding: [1, 0],
        imageEmbedding: [1, 0]
      }
    ];

    test('prioritizes opposite status and identifies top match >= 0.75', () => {
      const result = rankCandidates(queryLost, candidates, { matchThreshold: 0.75, possibleThreshold: 0.60 });

      expect(result.hasMatch).toBe(true);
      expect(result.bestMatch.candidate._id).toBe('found-perfect');
      expect(result.bestMatch.finalScore).toBeCloseTo(1.0, 3);
      expect(result.rankedMatches.length).toBe(3); // excludes 'lost-another'
    });
  });
});
