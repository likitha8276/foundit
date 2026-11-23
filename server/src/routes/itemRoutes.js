const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiters');
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem
} = require('../controllers/itemController');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  uploadLimiter,
  upload.single('image'),
  [
    body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Item name is required (2-120 chars)'),
    body('category')
      .isIn(['wallet', 'phone', 'bag', 'bottle', 'keys', 'electronics', 'clothing', 'documents', 'other'])
      .withMessage('Valid category is required'),
    body('description').trim().isLength({ min: 5 }).withMessage('Description must be at least 5 characters'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('status').isIn(['lost', 'found']).withMessage('Status must be lost or found')
  ],
  createItem
);

router.get('/', getItems);
router.get('/:id', getItemById);
router.put('/:id', authMiddleware, updateItem);
router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;
