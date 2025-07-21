/**
 * Uses "express-validator 7.0.1", MIT License
 * https://express-validator.github.io/
 */
const { validationResult } = require('express-validator');
const models = require('../models');
const { errorHelpers } = require('../utils/errorResponse');
const connectInterfaceService = require('../services/connectInterfaceService');

/**
 * @desc    Search connect interfaces
 * @route   GET /api/connect-interfaces/search
 * @access  Private
 */
exports.searchInterfaces = async (req, res, next) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;
    const result = await connectInterfaceService.searchInterfaces(keyword, parseInt(page), parseInt(limit));
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all connect interfaces
 * @route   GET /api/connect-interfaces
 * @access  Private
 */
exports.getInterfaces = async (req, res, next) => {
  try {
    const interfaces = await models.ConnectInterface.findAll({
      where: { status: 'active' },
      include: [
        {
          model: models.User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({
      status: 'success',
      results: interfaces.length,
      data: {
        interfaces
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get connect interface by ID
 * @route   GET /api/connect-interfaces/:id
 * @access  Private
 */
exports.getInterfaceById = async (req, res, next) => {
  try {
    const connectInterface = await models.ConnectInterface.findByPk(req.params.id, {
      include: [
        {
          model: models.User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    if (!connectInterface) {
      return res.status(404).json({
        status: 'error',
        message: 'Interface not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        interface: connectInterface
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new connect interface
 * @route   POST /api/connect-interfaces
 * @access  Private/Admin
 */
exports.createInterface = async (req, res) => {
  try {
    const interfaceData = req.body;
    const result = await connectInterfaceService.createInterface(interfaceData);
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * @desc    Update connect interface
 * @route   PUT /api/connect-interfaces/:id
 * @access  Private/Admin
 */
exports.updateInterface = async (req, res) => {
  try {
    const { id } = req.params;
    const interfaceData = req.body;
    const result = await connectInterfaceService.updateInterface(id, interfaceData);
    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Interface not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * @desc    Delete connect interface
 * @route   DELETE /api/connect-interfaces/:id
 * @access  Private/Admin
 */
exports.deleteInterface = async (req, res, next) => {
  try {
    const interfaceRecord = await models.ConnectInterface.findByPk(req.params.id);
    
    if (!interfaceRecord) {
      return res.status(404).json({
        status: 'error',
        message: 'Interface not found'
      });
    }
    
    await interfaceRecord.update({ status: 'inactive' });
    
    res.status(200).json({
      status: 'success',
      message: 'Interface deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}; 