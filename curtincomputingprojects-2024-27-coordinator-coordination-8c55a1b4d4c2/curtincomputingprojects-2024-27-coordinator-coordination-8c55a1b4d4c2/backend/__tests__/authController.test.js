const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const models = require('../models');
const authController = require('../controllers/authController');
const config = require('../config/config');

// Mock dependencies
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('../models', () => {
  const mockModels = {
    User: {
      findByPk: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn()
    }
  };

  mockModels.User.associate = jest.fn();

  return mockModels;
});

describe('Auth Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock request, response and next function
    mockReq = {
      body: {},
      user: { id: 1 }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Mock validation result
      validationResult.mockReturnValue({
        isEmpty: () => true
      });

      // Mock User.findOne to return null (user doesn't exist)
      models.User.findOne.mockResolvedValue(null);

      // Mock User.create to return a new user
      const mockUser = {
        id: 1,
        staff_id: '12345',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        role_id: config.roles.COORDINATOR
      };
      models.User.create.mockResolvedValue(mockUser);

      // Mock jwt.sign
      jwt.sign.mockReturnValue('mock-token');

      // Set request body
      mockReq.body = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role_id: config.roles.COORDINATOR,
        staff_id: '12345'
      };

      await authController.register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'User registered successfully',
        token: 'mock-token',
        data: {
          user: {
            id: mockUser.id,
            staff_id: mockUser.staff_id,
            first_name: mockUser.first_name,
            last_name: mockUser.last_name,
            email: mockUser.email,
            role_id: mockUser.role_id
          }
        }
      });
    });

    it('should return error if user already exists', async () => {
      // Mock validation result
      validationResult.mockReturnValue({
        isEmpty: () => true
      });

      // Mock User.findOne to return existing user
      models.User.findOne.mockResolvedValue({
        id: 1,
        email: 'john@example.com'
      });

      mockReq.body = {
        email: 'john@example.com',
        password: 'password123'
      };

      await authController.register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User with this email already exists'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Mock validation result
      validationResult.mockReturnValue({
        isEmpty: () => true
      });

      // Mock User.findOne to return a user
      const mockUser = {
        id: 1,
        staff_id: '12345',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        role_id: config.roles.COORDINATOR,
        status: 'active',
        role: { name: 'Coordinator' },
        isPasswordMatch: jest.fn().mockResolvedValue(true)
      };
      models.User.findOne.mockResolvedValue(mockUser);

      // Mock jwt.sign
      jwt.sign.mockReturnValue('mock-token');

      mockReq.body = {
        email: 'john@example.com',
        password: 'password123'
      };

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Login successful',
        token: 'mock-token',
        data: {
          user: {
            id: mockUser.id,
            staff_id: mockUser.staff_id,
            first_name: mockUser.first_name,
            last_name: mockUser.last_name,
            email: mockUser.email,
            role_id: mockUser.role_id
          }
        }
      });
    });

    it('should return error for invalid credentials', async () => {
      // Mock validation result
      validationResult.mockReturnValue({
        isEmpty: () => true
      });

      // Mock User.findOne to return null (user doesn't exist)
      models.User.findOne.mockResolvedValue(null);

      mockReq.body = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid credentials'
      });
    });
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      // Mock User.findByPk to return a user
      const mockUser = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        role_id: config.roles.COORDINATOR,
        staff_id: '12345',
        status: 'active'
      };
      models.User.findByPk.mockResolvedValue(mockUser);

      await authController.getMe(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          user: {
            id: mockUser.id,
            staff_id: mockUser.staff_id,
            first_name: mockUser.first_name,
            last_name: mockUser.last_name,
            email: mockUser.email,
            role_id: mockUser.role_id,
            status: mockUser.status
          }
        }
      });
    });

    it('should return error if user not found', async () => {
      // Mock User.findByPk to return null
      models.User.findByPk.mockResolvedValue(null);

      await authController.getMe(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found'
      });
    });
  });
}); 