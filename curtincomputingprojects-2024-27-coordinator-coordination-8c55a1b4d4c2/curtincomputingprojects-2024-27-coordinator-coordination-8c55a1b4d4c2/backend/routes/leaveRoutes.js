const express = require('express');
const { check } = require('express-validator');
const leaveController = require('../controllers/leaveController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleCheck');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

/**
 * @route   GET /api/leaves/pending
 * @desc    Get all pending leave requests
 * @access  Private/Admin
 */
router.get('/pending', isAdmin, leaveController.getPendingLeaveRequests);

/**
 * @route   PATCH /api/leaves/:id/approve
 * @desc    Approve leave request
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
  leaveController.approveLeaveRequest
);

/**
 * @route   PATCH /api/leaves/:id/reject
 * @desc    Reject leave request
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
  leaveController.rejectLeaveRequest
);

/**
 * @route   POST /api/leaves
 * @desc    Submit leave request
 * @access  Private
 */
router.post(
  '/',
  [
    check('deputy_id')
      .notEmpty()
      .withMessage('Deputy ID cannot be empty')
      .isLength({ min: 8, max: 8 })
      .withMessage('Deputy ID must be 8 characters'),
    check('start_date')
      .notEmpty()
      .withMessage('Start date cannot be empty')
      .isDate()
      .withMessage('Invalid start date format'),
    check('end_date')
      .notEmpty()
      .withMessage('End date cannot be empty')
      .isDate()
      .withMessage('Invalid end date format')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.start_date)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    check('reason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters')
  ],
  leaveController.submitLeaveRequest
);

/**
 * @route   GET /api/leaves/coordinator/:coordinatorId
 * @desc    Get coordinator's leave history
 * @access  Private
 */
router.get('/coordinator/:coordinatorId', leaveController.getCoordinatorLeaveHistory);

module.exports = router; 