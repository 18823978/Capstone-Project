const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const leaveStatementController = require('../controllers/leaveStatementController');
console.log('leaveStatementController:', leaveStatementController);
const { checkAuth } = require('../middleware/auth');

// Submit leave statement
router.post(
  '/',
  checkAuth,
  [
    check('leave_request_id', 'Leave request ID is required').notEmpty(),
    check('statement_text', 'Statement text is required').notEmpty()
  ],
  leaveStatementController.submitLeaveStatement
);

// Get leave statements by leave request
router.get(
  '/leave-request/:leaveRequestId',
  checkAuth,
  leaveStatementController.getLeaveStatementsByRequest
);

// Get leave statement by ID
router.get(
  '/:id',
  checkAuth,
  leaveStatementController.getLeaveStatementById
);

module.exports = router; 