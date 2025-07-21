/**
 * Uses "Express.js 4.18.2", MIT License
 * https://expressjs.com/
 */
const express = require('express');
const { check } = require('express-validator');
const connectInterfaceController = require('../controllers/connectInterfaceController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleCheck');
const { checkAuth } = require('../middleware/auth');
const { body, query, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

/**
 * @route   GET /api/connect-interfaces/search
 * @desc    Search connect interfaces
 * @access  Private
 */
router.get(
  '/search',
  [
    query('keyword').notEmpty().withMessage('Search keyword cannot be empty'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Items per page must be a positive integer')
  ],
  validateRequest,
  connectInterfaceController.searchInterfaces
);

/**
 * @route   GET /api/connect-interfaces
 * @desc    Get all connect interfaces
 * @access  Private
 */
router.get('/', connectInterfaceController.getInterfaces);

/**
 * @route   GET /api/connect-interfaces/:id
 * @desc    Get connect interface by ID
 * @access  Private
 */
router.get('/:id', connectInterfaceController.getInterfaceById);

/**
 * @route   POST /api/connect-interfaces
 * @desc    Create a new connect interface
 * @access  Private/Admin
 */
router.post(
  '/',
  checkAuth,
  [
    body('name').notEmpty().withMessage('Interface name cannot be empty'),
    body('description').notEmpty().withMessage('Interface description cannot be empty'),
    body('method').isIn(['GET', 'POST', 'PUT', 'DELETE']).withMessage('Request method must be GET, POST, PUT, or DELETE'),
    body('endpoint').notEmpty().withMessage('Interface URL cannot be empty'),
    body('parameters').optional().isObject().withMessage('Request parameters must be a JSON object'),
    body('response_schema').optional().isObject().withMessage('Response parameters must be a JSON object'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
  ],
  validateRequest,
  connectInterfaceController.createInterface
);

/**
 * @route   PUT /api/connect-interfaces/:id
 * @desc    Update connect interface
 * @access  Private/Admin
 */
router.put(
  '/:id',
  checkAuth,
  [
    param('id').isInt().withMessage('Interface ID must be an integer'),
    body('name').optional().notEmpty().withMessage('Interface name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Interface description cannot be empty'),
    body('method').optional().isIn(['GET', 'POST', 'PUT', 'DELETE']).withMessage('Request method must be GET, POST, PUT, or DELETE'),
    body('endpoint').optional().notEmpty().withMessage('Interface URL cannot be empty'),
    body('parameters').optional().isObject().withMessage('Request parameters must be a JSON object'),
    body('response_schema').optional().isObject().withMessage('Response parameters must be a JSON object'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
  ],
  validateRequest,
  connectInterfaceController.updateInterface
);

/**
 * @route   DELETE /api/connect-interfaces/:id
 * @desc    Delete connect interface
 * @access  Private/Admin
 */
router.delete('/:id', isAdmin, connectInterfaceController.deleteInterface);

module.exports = router; 