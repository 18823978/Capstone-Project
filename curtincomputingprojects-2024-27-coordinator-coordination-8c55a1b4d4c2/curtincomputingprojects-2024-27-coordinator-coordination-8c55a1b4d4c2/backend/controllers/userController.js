/**
 * Uses "express-validator 7.0.1", MIT License
 * https://express-validator.github.io/
 */
const { validationResult } = require('express-validator');
const { User } = require('../models');
const { LeaveRequest } = require('../models/LeaveRequest');
const { errorHelpers } = require('../utils/errorResponse');
const config = require('../config/config');
const models = require('../models');
const { sendNotificationEmail } = require('../services/emailService');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    // Get query parameters
    const { role_id, limit = 10, page = 1 } = req.query;
    
    // Build filter object
    const filter = {};
    if (role_id) {
      filter.role_id = role_id;
    }
    
    // Calculate pagination values
    const offset = (page - 1) * limit;
    
    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: filter,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: {
        exclude: ['password']
      },
      order: [['last_name', 'ASC'], ['first_name', 'ASC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      },
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin or Self
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { staff_id: req.params.id },
      attributes: {
        exclude: ['password']
      }
    });
    
    if (!user) {
      return next(errorHelpers.notFound('User', req.params.id));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new user (admin only)
 * @route   POST /api/users
 * @access  Private/Admin
 */
exports.createUser = async (req, res, next) => {
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
      role_id,
      staff_id,
      phone,
      office_location,
      office_hours
    } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(errorHelpers.conflict('User with this email already exists'));
    }
    
    // Create new user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      role_id: role_id || config.roles.COORDINATOR,
      staff_id: staff_id || null,
      phone: phone || null,
      office_location: office_location || null,
      office_hours: office_hours || null
    });
    
    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role_id: user.role_id,
          staff_id: user.staff_id,
          phone: user.phone,
          office_location: user.office_location,
          office_hours: user.office_hours
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/users/:id
 * @access  Private/Admin or Self
 */
exports.updateUser = async (req, res, next) => {
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
    
    // Find the user
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return next(errorHelpers.notFound('User', req.params.id));
    }
    
    // Check if the user is trying to update role and is not an admin
    if (req.body.role_id && req.user.role_id !== config.roles.ADMIN) {
      return next(errorHelpers.forbidden('Only admins can update user roles'));
    }

    // Store old values for comparison
    const oldStatus = user.status;
    const oldRoleId = user.role_id;
    
    // Update the user
    const updatedUser = await user.update(req.body);

    // Send notification emails for status or role changes
    if (req.body.status && req.body.status !== oldStatus) {
      const subject = 'Account Status Update';
      const message = `
        Dear ${user.first_name} ${user.last_name},

        Your account status has been updated to: ${req.body.status}

        ${req.body.status === 'active' 
          ? 'Your account is now active and you can access the system.'
          : 'Your account has been deactivated. Please contact the administrator for more information.'}

        Best regards,
        EECMS Team
      `;
      await sendNotificationEmail(user.email, subject, message);
    }

    if (req.body.role_id && req.body.role_id !== oldRoleId) {
      const subject = 'Role Update Notification';
      const message = `
        Dear ${user.first_name} ${user.last_name},

        Your role in the system has been updated to: ${req.body.role_id === config.roles.ADMIN ? 'Administrator' : 'Coordinator'}

        This change may affect your access to certain features in the system.

        Best regards,
        EECMS Team
      `;
      await sendNotificationEmail(user.email, subject, message);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          email: updatedUser.email,
          role_id: updatedUser.role_id,
          staff_id: updatedUser.staff_id,
          phone: updatedUser.phone,
          office_location: updatedUser.office_location,
          office_hours: updatedUser.office_hours
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return next(errorHelpers.notFound('User', req.params.id));
    }
    
    // Instead of deleting the user, deactivate them
    await user.update({ status: 'inactive' });

    // Send deactivation notification
    const subject = 'Account Deactivation Notice';
    const message = `
      Dear ${user.first_name} ${user.last_name},

      Your account has been deactivated in the EECMS Coordinator Coordination System.

      If you believe this is an error or need to reactivate your account, please contact the system administrator.

      Best regards,
      EECMS Team
    `;
    await sendNotificationEmail(user.email, subject, message);
    
    res.status(200).json({
      status: 'success',
      message: 'User deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all coordinators
 * @route   GET /api/users/coordinators
 * @access  Private
 */
exports.getAllCoordinators = async (req, res, next) => {
  try {
    const coordinators = await User.findAll({
      where: { 
        role_id: config.roles.COORDINATOR,
        status: 'active'
      },
      attributes: {
        exclude: ['password']
      },
      order: [['last_name', 'ASC'], ['first_name', 'ASC']]
    });
    
    res.status(200).json({
      status: 'success',
      results: coordinators.length,
      data: {
        coordinators
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get coordinator details with courses
 * @route   GET /api/users/coordinators/:id
 * @access  Private
 */
exports.getCoordinatorWithCourses = async (req, res, next) => {
  try {
    const coordinator = await User.findOne({
      where: { 
        id: req.params.id,
        role_id: config.roles.COORDINATOR,
        status: 'active'
      },
      attributes: {
        exclude: ['password']
      }
    });
    
    if (!coordinator) {
      return next(errorHelpers.notFound('Coordinator', req.params.id));
    }

    // 获取该coordinator负责的所有课程
    const courses = await models.Course.findAll({
      where: { 
        coordinator_id: coordinator.staff_id,
        status: 'active'
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        coordinator,
        courses
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update coordinator role to admin
 * @route   PUT /api/users/promote/:id
 * @access  Private/Admin
 */
exports.promoteToAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { 
        id: req.params.id,
        role_id: config.roles.COORDINATOR,
        status: 'active'
      }
    });
    
    if (!user) {
      return next(errorHelpers.notFound('Coordinator', req.params.id));
    }
    
    // Update the user role to admin
    await user.update({ role_id: config.roles.ADMIN });
    
    res.status(200).json({
      status: 'success',
      message: 'User promoted to admin successfully',
      data: {
        user: {
          id: user.id,
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
};

/**
 * @desc    Update user role (admin only)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    // Validate role
    if (!Object.values(config.roles).includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role'
      });
    }
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return next(errorHelpers.notFound('User', req.params.id));
    }
    
    // Update the user role
    await user.update({ role_id: role });
    
    res.status(200).json({
      status: 'success',
      message: `User role updated to ${role} successfully`,
      data: {
        user: {
          id: user.id,
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
};