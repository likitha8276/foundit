const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getMyMatches,
  claimMatch,
  confirmMatch,
  rejectMatch
} = require('../controllers/matchController');

const router = express.Router();

router.use(authMiddleware);

router.get('/my', getMyMatches);
router.post('/:id/claim', claimMatch);
router.post('/:id/confirm', confirmMatch);
router.post('/:id/reject', rejectMatch);

module.exports = router;
