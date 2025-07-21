/**
 * Uses "express-validator 7.0.1", MIT License
 * https://express-validator.github.io/
 */
const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleCheck');
const User = require('../models/User');
const { errorHelpers } = require('../utils/errorResponse');
const config = require('../config/config');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

/**
 * @desc    Get all coordinators
 * @route   GET /api/users/coordinators
 * @access  Private
 */
router.get('/coordinators', userController.getAllCoordinators);

/**
 * @desc    Get coordinator details with courses
 * @route   GET /api/users/coordinators/:id
 * @access  Private
 */
router.get('/coordinators/:id', userController.getCoordinatorWithCourses);

/**
 * @desc    Update coordinator role to admin
 * @route   PUT /api/users/promote/:id
 * @access  Private/Admin
 */
router.put('/promote/:id', isAdmin, userController.promoteToAdmin);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/', isAdmin, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private/Admin or Self
 */
router.get('/:id', userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Private/Admin
 */
router.post(
  '/',
  isAdmin,
  [
    check('first_name', 'First name is required').not().isEmpty(),
    check('last_name', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role must be either coordinator or admin').isIn(['coordinator', 'admin'])
  ],
  userController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user details
 * @access  Private/Admin or Self
 */
router.put(
  '/:id',
  [
    check('first_name', 'First name is required').optional().not().isEmpty(),
    check('last_name', 'Last name is required').optional().not().isEmpty(),
    check('email', 'Please include a valid email').optional().isEmail(),
    check('role_id', 'Role must be either coordinator or admin').optional().isIn([1, 2])
  ],
  userController.updateUser
);

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
router.delete('/:id', isAdmin, userController.deleteUser);

/**
 * @desc    Update user role (admin only)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
router.put('/:id/role', isAdmin, userController.updateUserRole);

module.exports = router;