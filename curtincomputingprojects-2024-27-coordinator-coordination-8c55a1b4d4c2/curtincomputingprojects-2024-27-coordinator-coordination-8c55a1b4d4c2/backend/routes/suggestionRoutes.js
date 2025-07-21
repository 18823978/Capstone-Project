const express = require('express');
const { check } = require('express-validator');
const suggestionController = require('../controllers/suggestionController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleCheck');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

/**
 * @route   POST /api/suggestions
 * @desc    Submit suggestion
 * @access  Private
 */
router.post(
  '/',
  [
    check('suggestion_text')
      .notEmpty()
      .withMessage('Suggestion text cannot be empty')
      .isLength({ max: 1000 })
      .withMessage('Suggestion text cannot exceed 1000 characters')
  ],
  suggestionController.submitSuggestion
);

/**
 * @route   GET /api/suggestions/coordinator/:coordinatorId
 * @desc    Get coordinator's own suggestions
 * @access  Private
 */
router.get('/coordinator/:coordinatorId', suggestionController.getCoordinatorSuggestions);

/**
 * @route   GET /api/suggestions
 * @desc    Get all suggestions
 * @access  Private/Admin
 */
router.get('/', isAdmin, suggestionController.getAllSuggestions);

/**
 * @route   GET /api/suggestions/:id
 * @desc    Get single suggestion
 * @access  Private/Admin
 */
router.get('/:id', isAdmin, suggestionController.getSuggestionById);

/**
 * @route   PATCH /api/suggestions/:id/approve
 * @desc    Approve suggestion
 * @access  Private/Admin
 */
router.patch(
  '/:id/approve',
  isAdmin,
  [
    check('admin_comments')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Comments cannot exceed 500 characters')
  ],
  suggestionController.approveSuggestion
);

/**
 * @route   PATCH /api/suggestions/:id/reject
 * @desc    Reject suggestion
 * @access  Private/Admin
 */
router.patch(
  '/:id/reject',
  isAdmin,
  [
    check('admin_comments')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Comments cannot exceed 500 characters')
  ],
  suggestionController.rejectSuggestion
);

module.exports = router; 