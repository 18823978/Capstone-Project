const { validationResult } = require('express-validator');
const User = require('../models/User');
const { LeaveRequest } = require('../models/LeaveRequest');
const { errorHelpers } = require('../utils/errorResponse');
const config = require('../config/config');
const userController = require('../controllers/userController');
const models = require('../models');

// Mock dependencies
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

jest.mock('../models/User', () => {
  return {
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
});

jest.mock('../models/LeaveRequest', () => {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  };
});

jest.mock('../models', () => ({
  User: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Course: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

describe('User Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock request, response and next function
    mockReq = {
      params: {},
      query: {},
      body: {},
      user: { id: 1, role: config.roles.ADMIN }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();

    // Mock validation result
    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
  });

  describe('getAllUsers', () => {
    it('should get all users with pagination', async () => {
      const mockUsers = [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' }
      ];
      models.User.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockUsers
      });
      mockReq.query = {
        limit: 10,
        page: 1
      };
      await userController.getAllUsers(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        },
        data: {
          users: mockUsers
        }
      });
    });
    it('should filter users by role', async () => {
      const mockUsers = [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', role_id: config.roles.COORDINATOR }
      ];
      models.User.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockUsers
      });
      mockReq.query = {
        role_id: config.roles.COORDINATOR,
        limit: 10,
        page: 1
      };
      await userController.getAllUsers(mockReq, mockRes, mockNext);
      expect(models.User.findAndCountAll).toHaveBeenCalledWith({
        where: { role_id: config.roles.COORDINATOR },
        limit: 10,
        offset: 0,
        attributes: { exclude: ['password'] },
        order: [['last_name', 'ASC'], ['first_name', 'ASC']]
      });
    });
  });

  describe('getUserById', () => {
    it('should get user by id', async () => {
      const mockUser = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      };
      models.User.findOne.mockResolvedValue(mockUser);
      mockReq.params.id = 1;
      await userController.getUserById(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          user: mockUser
        }
      });
    });
    it('should return error if user not found', async () => {
      models.User.findOne.mockResolvedValue(null);
      mockReq.params.id = 999;
      await userController.getUserById(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        role_id: config.roles.COORDINATOR,
        staff_id: '12345',
        phone: null,
        office_location: null,
        office_hours: null
      };
      models.User.findOne.mockResolvedValue(null);
      models.User.create.mockResolvedValue(mockUser);
      mockReq.body = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role_id: config.roles.COORDINATOR,
        staff_id: '12345'
      };
      await userController.createUser(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'User created successfully',
        data: {
          user: {
            id: mockUser.id,
            first_name: mockUser.first_name,
            last_name: mockUser.last_name,
            email: mockUser.email,
            role_id: mockUser.role_id,
            staff_id: mockUser.staff_id,
            phone: mockUser.phone,
            office_location: mockUser.office_location,
            office_hours: mockUser.office_hours
          }
        }
      });
    });
    it('should return error if user already exists', async () => {
      models.User.findOne.mockResolvedValue({
        id: 1,
        email: 'john@example.com'
      });
      mockReq.body = {
        email: 'john@example.com',
        password: 'password123'
      };
      await userController.createUser(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      const mockUser = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        role_id: config.roles.COORDINATOR,
        staff_id: '12345',
        phone: null,
        office_location: null,
        office_hours: null,
        update: jest.fn().mockResolvedValue({
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          role_id: config.roles.COORDINATOR,
          staff_id: '12345',
          phone: null,
          office_location: null,
          office_hours: null
        })
      };
      models.User.findByPk.mockResolvedValue(mockUser);
      mockReq.params.id = 1;
      mockReq.body = {
        first_name: 'John',
        last_name: 'Doe'
      };
      mockReq.user = { role: 'admin' };
      await userController.updateUser(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'User updated successfully',
        data: {
          user: {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            role_id: config.roles.COORDINATOR,
            staff_id: '12345',
            phone: null,
            office_location: null,
            office_hours: null
          }
        }
      });
    });
    it('should return error if user not found', async () => {
      models.User.findByPk.mockResolvedValue(null);
      mockReq.params.id = 999;
      mockReq.body = {
        first_name: 'John'
      };
      await userController.updateUser(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should deactivate user', async () => {
      const mockUser = {
        id: 1,
        update: jest.fn().mockResolvedValue(true)
      };
      models.User.findByPk.mockResolvedValue(mockUser);
      mockReq.params.id = 1;
      await userController.deleteUser(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'User deactivated successfully'
      });
    });
    it('should return error if user not found', async () => {
      models.User.findByPk.mockResolvedValue(null);
      mockReq.params.id = 999;
      await userController.deleteUser(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('getCoordinatorWithCourses', () => {
    it('should get coordinator with courses', async () => {
      const mockCoordinator = {
        id: 1,
        staff_id: '10000099',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        role_id: config.roles.COORDINATOR
      };
      const mockCourses = [
        {
          id: 1,
          course_code: 'CS101',
          course_name: 'Introduction to Computer Science',
          coordinator_id: '10000099'
        }
      ];
      models.User.findOne.mockResolvedValue(mockCoordinator);
      models.Course.findAll.mockResolvedValue(mockCourses);
      mockReq.params.id = 1;
      await userController.getCoordinatorWithCourses(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          coordinator: mockCoordinator,
          courses: mockCourses
        }
      });
    });
    it('should return 404 if coordinator not found', async () => {
      models.User.findOne.mockResolvedValue(null);
      mockReq.params.id = 999;
      await userController.getCoordinatorWithCourses(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: expect.stringContaining('Coordinator not found')
        })
      );
    });
  });
}); 