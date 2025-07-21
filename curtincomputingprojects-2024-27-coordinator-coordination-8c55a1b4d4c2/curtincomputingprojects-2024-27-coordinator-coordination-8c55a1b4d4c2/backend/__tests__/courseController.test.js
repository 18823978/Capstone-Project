const { validationResult } = require('express-validator');
const models = require('../models');
const { errorHelpers } = require('../utils/errorResponse');
const config = require('../config/config');
const courseController = require('../controllers/courseController');

// Mock dependencies
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

jest.mock('../models', () => {
  const mockModels = {
    Course: {
      findByPk: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn()
    },
    User: {
      findByPk: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn()
    },
    CoordinatorCourse: {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      destroy: jest.fn()
    },
    Sequelize: {
      Op: {
        or: Symbol('or'),
        like: Symbol('like')
      }
    }
  };

  mockModels.Course.associate = jest.fn();
  mockModels.User.associate = jest.fn();
  mockModels.CoordinatorCourse.associate = jest.fn();

  return mockModels;
});

describe('Course Controller', () => {
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

  describe('getCourses', () => {
    it('should get all courses', async () => {
      // Mock Course.findAll
      const mockCourses = [
        { id: 1, course_code: 'CS101', course_name: 'Introduction to Computer Science' },
        { id: 2, course_code: 'CS102', course_name: 'Data Structures' }
      ];
      models.Course.findAll.mockResolvedValue(mockCourses);

      await courseController.getCourses(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          courses: mockCourses
        }
      });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      models.Course.findAll.mockRejectedValue(mockError);
      await courseController.getCourses(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getCourseById', () => {
    it('should get course by id', async () => {
      // Mock Course.findByPk
      const mockCourse = {
        id: 1,
        course_code: 'CS101',
        course_name: 'Introduction to Computer Science'
      };
      models.Course.findByPk.mockResolvedValue(mockCourse);

      mockReq.params.id = 1;

      await courseController.getCourseById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          course: mockCourse
        }
      });
    });

    it('should return 404 if course not found', async () => {
      // Mock Course.findByPk to return null
      models.Course.findByPk.mockResolvedValue(null);

      mockReq.params.id = 999;

      await courseController.getCourseById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Course not found'
      });
    });
  });

  describe('createCourse', () => {
    it('should create a new course', async () => {
      // Mock Course.create
      const mockCourse = {
        id: 1,
        course_code: 'CS101',
        course_name: 'Introduction to Computer Science'
      };
      models.Course.create.mockResolvedValue(mockCourse);

      mockReq.body = {
        course_code: 'CS101',
        course_name: 'Introduction to Computer Science'
      };

      await courseController.createCourse(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Course created successfully',
        data: {
          course: mockCourse
        }
      });
    });
  });

  describe('updateCourse', () => {
    it('should update course details', async () => {
      // Mock Course.findByPk and update
      const mockCourse = {
        id: 1,
        course_code: 'CS101',
        course_name: 'Introduction to Computer Science',
        update: jest.fn().mockResolvedValue({
          id: 1,
          course_code: 'CS101',
          course_name: 'Updated Course Name'
        })
      };
      models.Course.findByPk.mockResolvedValue(mockCourse);

      mockReq.params.id = 1;
      mockReq.body = {
        course_name: 'Updated Course Name'
      };

      await courseController.updateCourse(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Course updated successfully',
        data: {
          course: mockCourse
        }
      });
    });

    it('should return 404 if course not found', async () => {
      // Mock Course.findByPk to return null
      models.Course.findByPk.mockResolvedValue(null);

      mockReq.params.id = 999;
      mockReq.body = {
        course_name: 'Updated Course Name'
      };

      await courseController.updateCourse(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Course not found'
      });
    });
  });

  describe('deleteCourse', () => {
    it('should delete course', async () => {
      // Mock Course.findByPk and destroy
      const mockCourse = {
        id: 1,
        course_code: 'CS101',
        course_name: 'Introduction to Computer Science',
        destroy: jest.fn().mockResolvedValue(true)
      };
      models.Course.findByPk.mockResolvedValue(mockCourse);

      mockReq.params.id = 1;

      await courseController.deleteCourse(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Course deleted successfully'
      });
    });

    it('should return 404 if course not found', async () => {
      // Mock Course.findByPk to return null
      models.Course.findByPk.mockResolvedValue(null);

      mockReq.params.id = 999;

      await courseController.deleteCourse(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Course not found'
      });
    });
  });

  describe('searchCourses', () => {
    it('should search courses by query', async () => {
      // Mock Course.findAll
      const mockCourses = [
        { id: 1, course_code: 'CS101', course_name: 'Introduction to Computer Science' }
      ];
      models.Course.findAll.mockResolvedValue(mockCourses);

      mockReq.query = {
        query: 'CS101'
      };

      await courseController.searchCourses(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockCourses.length,
        data: {
          courses: mockCourses
        }
      });
    });
  });

  describe('getCoursesByCoordinator', () => {
    it('should get courses by coordinator', async () => {
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
      models.User.findByPk.mockResolvedValue(mockCoordinator);
      models.Course.findAll.mockResolvedValue(mockCourses);
      mockReq.params.id = 1;
      await courseController.getCoursesByCoordinator(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          courses: mockCourses
        }
      });
    });
  });
}); 