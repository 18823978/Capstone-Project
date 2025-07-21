const { validationResult } = require('express-validator');
const db = require('../models');
const { errorHelpers } = require('../utils/errorResponse');

/**
 * @desc    Submit leave statement
 * @route   POST /api/leave-statements
 * @access  Private
 */
const submitLeaveStatement = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { leave_request_id, statement_text } = req.body;
    
    const leaveStatement = await db.LeaveStatement.create({
      leave_request_id,
      author_id: req.user.staff_id,
      statement_text
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Leave statement submitted successfully',
      data: {
        leaveStatement
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get leave statements by leave request
 * @route   GET /api/leave-statements/leave-request/:leaveRequestId
 * @access  Private
 */
const getLeaveStatementsByRequest = async (req, res, next) => {
  try {
    const { leaveRequestId } = req.params;
    
    const leaveStatements = await db.LeaveStatement.findAll({
      where: { leave_request_id: leaveRequestId },
      include: [
        {
          model: db.User,
          as: 'author',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({
      status: 'success',
      results: leaveStatements.length,
      data: {
        leaveStatements
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get leave statement by ID
 * @route   GET /api/leave-statements/:id
 * @access  Private
 */
const getLeaveStatementById = async (req, res, next) => {
  try {
    const leaveStatement = await db.LeaveStatement.findByPk(req.params.id, {
      include: [
        {
          model: db.User,
          as: 'author',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: db.LeaveRequest,
          as: 'leave_request'
        }
      ]
    });
    
    if (!leaveStatement) {
      return next(errorHelpers.notFound('Leave statement', req.params.id));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        leaveStatement
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitLeaveStatement,
  getLeaveStatementsByRequest,
  getLeaveStatementById
}; 