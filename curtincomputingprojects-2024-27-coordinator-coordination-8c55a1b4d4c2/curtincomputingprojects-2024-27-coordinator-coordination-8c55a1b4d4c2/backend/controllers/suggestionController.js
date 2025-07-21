const { validationResult } = require('express-validator');
const { Suggestion } = require('../models');
const { errorHelpers } = require('../utils/errorResponse');
const config = require('../config/config');

/**
 * @desc    Submit suggestion
 * @route   POST /api/suggestions
 * @access  Private
 */
exports.submitSuggestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { suggestion_text } = req.body;
    
    const suggestion = await Suggestion.create({
      coordinator_id: req.user.staff_id,
      suggestion_text
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Suggestion submitted successfully',
      data: {
        suggestion
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all suggestions
 * @route   GET /api/suggestions
 * @access  Private/Admin
 */
exports.getAllSuggestions = async (req, res, next) => {
  try {
    const suggestions = await Suggestion.findAll({
      include: [
        {
          model: Suggestion.sequelize.models.User,
          as: 'coordinator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['submitted_at', 'DESC']]
    });
    
    res.status(200).json({
      status: 'success',
      results: suggestions.length,
      data: {
        suggestions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single suggestion
 * @route   GET /api/suggestions/:id
 * @access  Private/Admin
 */
exports.getSuggestionById = async (req, res, next) => {
  try {
    const suggestion = await Suggestion.findByPk(req.params.id, {
      include: [
        {
          model: Suggestion.sequelize.models.User,
          as: 'coordinator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    if (!suggestion) {
      return next(errorHelpers.notFound('Suggestion', req.params.id));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        suggestion
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve suggestion
 * @route   PATCH /api/suggestions/:id/approve
 * @access  Private/Admin
 */
exports.approveSuggestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const suggestion = await Suggestion.findByPk(id, {
      include: [
        {
          model: Suggestion.sequelize.models.User,
          as: 'coordinator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    if (!suggestion) {
      return next(errorHelpers.notFound('Suggestion', id));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Suggestion approved successfully',
      data: {
        suggestion
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject suggestion
 * @route   PATCH /api/suggestions/:id/reject
 * @access  Private/Admin
 */
exports.rejectSuggestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const suggestion = await Suggestion.findByPk(id, {
      include: [
        {
          model: Suggestion.sequelize.models.User,
          as: 'coordinator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    if (!suggestion) {
      return next(errorHelpers.notFound('Suggestion', id));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Suggestion rejected successfully',
      data: {
        suggestion
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get coordinator's own suggestions
 * @route   GET /api/suggestions/coordinator/:coordinatorId
 * @access  Private
 */
exports.getCoordinatorSuggestions = async (req, res, next) => {
  try {
    const { coordinatorId } = req.params;
    
    // Verify if current user or admin
    if (req.user.staff_id !== coordinatorId && req.user.role_id !== config.roles.ADMIN) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view other coordinators\' suggestions'
      });
    }
    
    const suggestions = await Suggestion.findAll({
      where: { coordinator_id: coordinatorId },
      include: [
        {
          model: Suggestion.sequelize.models.User,
          as: 'coordinator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['submitted_at', 'DESC']]
    });
    
    res.status(200).json({
      status: 'success',
      results: suggestions.length,
      data: {
        suggestions
      }
    });
  } catch (error) {
    next(error);
  }
}; 