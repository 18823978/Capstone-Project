/**
 * Uses "jsonwebtoken 9.0.0", MIT License
 * https://github.com/auth0/node-jsonwebtoken
 */
const jwt = require('jsonwebtoken');
/**
 * Uses "express-validator 7.0.1", MIT License
 * https://express-validator.github.io/
 */
const { validationResult } = require('express-validator');
const models = require('../models');
const config = require('../config/config');
const { sendNotificationEmail } = require('../services/emailService');
const { errorHelpers } = require('../utils/errorResponse');
const { logger } = require('../services/loggerService');

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      staff_id: user.staff_id,
      email: user.email,
      role_id: user.role_id
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn
    }
  );
};

const authController = {
  /**
   * @desc    Register a new user
   * @route   POST /api/auth/register
   * @access  Public
   */
  register: async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: errors.array()
        });
      }
      
      const { 
        first_name, 
        last_name, 
        email, 
        password,
        role_id = config.roles.COORDINATOR,
        staff_id,
        phone
      } = req.body;
      
      // Check if user already exists
      const existingUser = await models.User.findOne({ 
        where: { 
          email 
        },
        include: [{
          model: models.Role,
          as: 'role'
        }]
      });

      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'User with this email already exists'
        });
      }
      
      // Create new user
      const user = await models.User.create({
        first_name,
        last_name,
        email,
        password,
        role_id,
        staff_id,
        phone: phone || null,
        status: 'active'
      });
      
      // Send welcome email
      const subject = 'Welcome to EECMS Coordinator Coordination System';
      const message = `
        Dear ${first_name} ${last_name},

        Welcome to the EECMS Coordinator Coordination System!

        Your account has been successfully created with the following details:
        - Staff ID: ${staff_id}
        - Email: ${email}
        - Role: ${role_id === config.roles.ADMIN ? 'Administrator' : 'Coordinator'}

        You can now log in to the system using your email and password.

        If you have any questions or need assistance, please contact the system administrator.

        Best regards,
        EECMS Team
      `;

      await sendNotificationEmail(email, subject, message);
      
      // Generate token
      const token = generateToken(user);
      
      // Return success response with token
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        token,
        data: {
          user: {
            id: user.id,
            staff_id: user.staff_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role_id: user.role_id
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * @desc    Login user
   * @route   POST /api/auth/login
   * @access  Public
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Log login attempt
      logger.info('Login attempt', {
        email,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      // Find user
      const user = await models.User.findOne({ where: { email } });
      if (!user) {
        logger.warn('Login failed: User not found', { email });
        return next(errorHelpers.unauthorized('Invalid credentials'));
      }

      // Verify password
      const isMatch = await user.isPasswordMatch(password);
      if (!isMatch) {
        logger.warn('Login failed: Invalid password', { email });
        return next(errorHelpers.unauthorized('Invalid credentials'));
      }

      // Check user status
      if (user.status !== 'active') {
        logger.warn('Login failed: Inactive account', { 
          email,
          status: user.status 
        });
        return next(errorHelpers.unauthorized('Account is inactive'));
      }

      // Generate token
      const token = generateToken(user);

      // Log successful login
      logger.info('Login successful', {
        userId: user.id,
        email: user.email,
        role: user.role_id
      });

      res.status(200).json({
        status: 'success',
        token,
        data: {
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role_id: user.role_id,
            staff_id: user.staff_id
          }
        }
      });
    } catch (error) {
      logger.error('Login error', {
        error: error.message,
        stack: error.stack
      });
      next(error);
    }
  },
  
  /**
   * @desc    Get current user profile
   * @route   GET /api/auth/me
   * @access  Private
   */
  getMe: async (req, res, next) => {
    try {
      const user = await models.User.findByPk(req.user.id, {
        include: [{
          model: models.Role,
          as: 'role'
        }]
      });
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Get courses and their components for the coordinator
      const courses = await models.Course.findAll({
        where: { 
          coordinator_id: user.staff_id
        },
        include: [{
          model: models.Component,
          as: 'components',
          attributes: ['id', 'component_name', 'schedule']
        }]
      });

      // Process course and schedule information
      const courseDetails = courses.map(course => ({
        id: course.id,
        course_code: course.course_code,
        course_name: course.course_name,
        major: course.major,
        components: course.components.map(component => ({
          id: component.id,
          name: component.component_name,
          schedule: (() => {
            if (!component.schedule) return null;
            try {
              return JSON.parse(component.schedule);
            } catch (e) {
              return component.schedule; // fallback to raw string
            }
          })()
        }))
      }));
      
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            staff_id: user.staff_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role_id: user.role_id,
            phone: user.phone,
            status: user.status
          },
          courses: courseDetails
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * @desc    Update user password
   * @route   PUT /api/auth/update-password
   * @access  Private
   */
  updatePassword: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: errors.array()
        });
      }
      
      const { current_password, new_password } = req.body;
      
      const user = await models.User.findByPk(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }
      
      // Check if current password matches
      const isMatch = await user.isPasswordMatch(current_password);
      if (!isMatch) {
        return res.status(401).json({
          status: 'error',
          message: 'Current password is incorrect'
        });
      }
      
      // Update password
      user.password = new_password;
      await user.save();
      
      res.status(200).json({
        status: 'success',
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * @desc    Logout user (client-side)
   * @route   POST /api/auth/logout
   * @access  Private
   */
  logout: async (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  }
};

module.exports = authController;