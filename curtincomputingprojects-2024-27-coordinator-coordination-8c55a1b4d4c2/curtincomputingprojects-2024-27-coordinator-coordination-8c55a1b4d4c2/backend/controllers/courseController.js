/**
 * Uses "express-validator 7.0.1", MIT License
 * https://express-validator.github.io/
 */
const { validationResult } = require('express-validator');
const models = require('../models');
const { errorHelpers } = require('../utils/errorResponse');
const config = require('../config/config');

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Private
 */
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await models.Course.findAll({
      include: [{
        model: models.User,
        as: 'coordinator',
        attributes: ['staff_id', 'first_name', 'last_name', 'email']
      }]
    });
    res.status(200).json({
      status: 'success',
      data: {
        courses
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get course by ID
 * @route   GET /api/courses/:id
 * @access  Private
 */
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await models.Course.findByPk(req.params.id, {
      include: [{
        model: models.User,
        as: 'coordinator',
        attributes: ['staff_id', 'first_name', 'last_name', 'email']
      }]
    });
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('Error in getCourseById:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Database error. Please try again later or contact support.'
    });
  }
};

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private/Admin
 */
exports.createCourse = async (req, res, next) => {
  try {
    const course = await models.Course.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Course created successfully',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('Error in createCourse:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Database error. Please try again later or contact support.'
    });
  }
};

/**
 * @desc    Update course details
 * @route   PUT /api/courses/:id
 * @access  Private/Admin
 */
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await models.Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }
    await course.update(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Course updated successfully',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('Error in updateCourse:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Database error. Please try again later or contact support.'
    });
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private/Admin
 */
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await models.Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }
    await course.destroy();
    res.status(200).json({
      status: 'success',
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Database error. Please try again later or contact support.'
    });
  }
};

/**
 * @desc    Search courses by code or name
 * @route   GET /api/courses/search
 * @access  Private
 */
exports.searchCourses = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }
    
    console.log('Search query:', query);
    console.log('Page:', page);
    console.log('Limit:', limit);
    
    const offset = (page - 1) * limit;
    
    const { Op } = models.Sequelize;
    const searchCondition = {
      [Op.or]: [
        { course_code: { [Op.like]: `%${query}%` } },
        { course_name: { [Op.like]: `%${query}%` } },
        { major: { [Op.like]: `%${query}%` } },
        { '$coordinator.phone$': { [Op.like]: `%${query}%` } }
      ]
    };
    
    console.log('Search condition:', JSON.stringify(searchCondition, null, 2));
    
    const { count, rows: courses } = await models.Course.findAndCountAll({
      where: searchCondition,
      include: [{
        model: models.User,
        as: 'coordinator',
        attributes: ['staff_id', 'first_name', 'last_name', 'email', 'phone']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['course_code', 'ASC']]
    });
    
    console.log('Found courses:', count);
    console.log('Returned courses:', courses.length);
    
    res.status(200).json({
      status: 'success',
      results: courses.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: {
        courses
      }
    });
  } catch (error) {
    console.error('Error in searchCourses:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Database error. Please try again later or contact support.'
    });
  }
};

/**
 * @desc    Get courses by coordinator
 * @route   GET /api/courses/coordinator/:id
 * @access  Private
 */
exports.getCoursesByCoordinator = async (req, res, next) => {
  try {
    const user = await models.User.findOne({ where: { staff_id: req.params.id } });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Coordinator not found'
      });
    }
    const courses = await models.Course.findAll({
      where: { 
        coordinator_id: user.staff_id
      },
      include: [{
        model: models.User,
        as: 'coordinator',
        attributes: ['staff_id', 'first_name', 'last_name', 'email']
      }]
    });
    res.status(200).json({
      status: 'success',
      data: {
        courses
      }
    });
  } catch (error) {
    console.error('Error in getCoursesByCoordinator:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Database error. Please try again later or contact support.'
    });
  }
};