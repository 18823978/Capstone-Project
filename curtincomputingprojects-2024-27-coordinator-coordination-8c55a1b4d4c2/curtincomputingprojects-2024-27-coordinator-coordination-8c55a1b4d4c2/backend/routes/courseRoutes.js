/**
 * Uses "Express.js 4.18.2", MIT License
 * https://expressjs.com/
 */
const express = require('express');
const courseController = require('../controllers/courseController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleCheck');
const validators = require('../utils/validator');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

/**
 * @route   GET /api/courses
 * @desc    Get all courses
 * @access  Private
 */
router.get('/', courseController.getCourses);

/**
 * @route   GET /api/courses/search
 * @desc    Search courses by code or name
 * @access  Private
 */
router.get('/search', courseController.searchCourses);

/**
 * @route   GET /api/courses/coordinator/:id
 * @desc    Get courses by coordinator
 * @access  Private
 */
router.get('/coordinator/:id', courseController.getCoursesByCoordinator);

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Private/Admin
 */
router.post(
  '/',
  isAdmin,
  validators.course.create,
  courseController.createCourse
);

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID
 * @access  Private
 */
router.get('/:id', courseController.getCourseById);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course
 * @access  Private/Admin
 */
router.put(
  '/:id',
  isAdmin,
  validators.course.update,
  courseController.updateCourse
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete course
 * @access  Private/Admin
 */
router.delete('/:id', isAdmin, courseController.deleteCourse);

module.exports = router;