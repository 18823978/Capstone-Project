const { check, body, param, query } = require('express-validator');
const config = require('../config/config');

/**
 * Common validation rules
 */
const validators = {
  // User related validations
  user: {
    create: [
      check('first_name')
        .trim()
        .not().isEmpty()
        .withMessage('First name is required')
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
      
      check('last_name')
        .trim()
        .not().isEmpty()
        .withMessage('Last name is required')
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
      
      check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .isLength({ max: 100 })
        .withMessage('Email cannot exceed 100 characters'),
      
      check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
      
      check('role')
        .isIn([config.roles.COORDINATOR, config.roles.ADMIN])
        .withMessage('Invalid role'),
      
      check('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
      
      check('office_location')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Office location cannot exceed 100 characters'),
      
      check('office_hours')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Office hours cannot exceed 200 characters')
    ],
    
    update: [
      check('first_name')
        .optional()
        .trim()
        .not().isEmpty()
        .withMessage('First name cannot be empty')
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
      
      check('last_name')
        .optional()
        .trim()
        .not().isEmpty()
        .withMessage('Last name cannot be empty')
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
      
      check('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
      
      check('office_location')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Office location cannot exceed 100 characters'),
      
      check('office_hours')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Office hours cannot exceed 200 characters')
    ],
    
    changePassword: [
      check('current_password')
        .not().isEmpty()
        .withMessage('Current password is required'),
      
      check('new_password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    ],
    
    login: [
      check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Please provide a valid email address'),
      
      check('password')
        .not().isEmpty()
        .withMessage('Password is required')
    ]
  },
  
  // Course related validations
  course: {
    create: [
      check('course_code')
        .trim()
        .not().isEmpty()
        .withMessage('Course code is required')
        .isLength({ max: 20 })
        .withMessage('Course code cannot exceed 20 characters'),
      
      check('course_name')
        .trim()
        .not().isEmpty()
        .withMessage('Course name is required')
        .isLength({ max: 100 })
        .withMessage('Course name cannot exceed 100 characters'),
      
      check('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
      
      check('semester')
        .trim()
        .not().isEmpty()
        .withMessage('Semester is required')
        .matches(/^\d{4}-(S|T)[1-4]$/)
        .withMessage('Semester must be in format YYYY-S1, YYYY-S2, etc.'),
      
      check('start_date')
        .optional()
        .isDate()
        .withMessage('Start date must be a valid date'),
      
      check('end_date')
        .optional()
        .isDate()
        .withMessage('End date must be a valid date'),
      
      check('credit_hours')
        .optional()
        .isInt({ min: 1, max: 6 })
        .withMessage('Credit hours must be between 1 and 6')
    ],
    
    update: [
      check('course_name')
        .optional()
        .trim()
        .not().isEmpty()
        .withMessage('Course name cannot be empty')
        .isLength({ max: 100 })
        .withMessage('Course name cannot exceed 100 characters'),
      
      check('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
      
      check('start_date')
        .optional()
        .isDate()
        .withMessage('Start date must be a valid date'),
      
      check('end_date')
        .optional()
        .isDate()
        .withMessage('End date must be a valid date')
    ]
  },
  
  // Leave request related validations
  leaveRequest: {
    create: [
      check('deputy_id')
        .isInt()
        .withMessage('Deputy ID must be an integer'),
      
      check('start_date')
        .isDate()
        .withMessage('Start date must be a valid date'),
      
      check('end_date')
        .isDate()
        .withMessage('End date must be a valid date')
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
    
    updateStatus: [
      check('status')
        .isIn(['approved', 'rejected', 'cancelled'])
        .withMessage('Status must be approved, rejected, or cancelled'),
      
      check('admin_comments')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Comments cannot exceed 500 characters')
    ],
    
    updateDeputyStatus: [
      check('deputy_status')
        .isIn(['accepted', 'rejected'])
        .withMessage('Deputy status must be accepted or rejected'),
      
      check('deputy_comments')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Comments cannot exceed 500 characters')
    ]
  }
};

module.exports = validators;