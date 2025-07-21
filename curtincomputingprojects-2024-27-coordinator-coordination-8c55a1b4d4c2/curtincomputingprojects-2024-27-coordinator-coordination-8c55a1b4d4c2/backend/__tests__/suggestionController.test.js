const { validationResult } = require('express-validator');
const { Suggestion } = require('../models/Suggestion');
const suggestionController = require('../controllers/suggestionController');
const { errorHelpers } = require('../utils/errorResponse');

// Mock dependencies
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

jest.mock('../models/Suggestion', () => {
  const mockSuggestion = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    sequelize: {
      models: {
        User: {}
      }
    }
  };
  return {
    Suggestion: mockSuggestion
  };
});

describe('Suggestion Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
      user: {
        id: 1,
        staff_id: '12345678',
        role_id: 1
      }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('submitSuggestion', () => {
    it('should submit a new suggestion', async () => {
      const mockSuggestion = {
        id: 1,
        coordinator_id: '12345678',
        suggestion_text: 'Test suggestion',
        submitted_at: new Date()
      };

      mockReq.body = {
        suggestion_text: 'Test suggestion'
      };

      validationResult.mockReturnValue({ isEmpty: () => true });
      Suggestion.create.mockResolvedValue(mockSuggestion);

      await suggestionController.submitSuggestion(mockReq, mockRes, mockNext);

      expect(Suggestion.create).toHaveBeenCalledWith({
        coordinator_id: '12345678',
        suggestion_text: 'Test suggestion'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Suggestion submitted successfully',
        data: {
          suggestion: mockSuggestion
        }
      });
    });

    it('should handle validation errors', async () => {
      const validationErrors = [
        { param: 'suggestion_text', msg: 'Suggestion text cannot be empty' }
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors
      });

      await suggestionController.submitSuggestion(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation error',
        errors: validationErrors
      });
    });
  });

  describe('getAllSuggestions', () => {
    it('should return all suggestions', async () => {
      const mockSuggestions = [
        {
          id: 1,
          coordinator_id: '12345678',
          suggestion_text: 'Test suggestion 1',
          submitted_at: new Date()
        },
        {
          id: 2,
          coordinator_id: '87654321',
          suggestion_text: 'Test suggestion 2',
          submitted_at: new Date()
        }
      ];

      Suggestion.findAll.mockResolvedValue(mockSuggestions);

      await suggestionController.getAllSuggestions(mockReq, mockRes, mockNext);

      expect(Suggestion.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: Suggestion.sequelize.models.User,
            as: 'coordinator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ],
        order: [['submitted_at', 'DESC']]
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: {
          suggestions: mockSuggestions
        }
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      Suggestion.findAll.mockRejectedValue(error);

      await suggestionController.getAllSuggestions(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getSuggestionById', () => {
    it('should return a single suggestion', async () => {
      const mockSuggestion = {
        id: 1,
        coordinator_id: '12345678',
        suggestion_text: 'Test suggestion',
        submitted_at: new Date()
      };

      mockReq.params.id = '1';
      Suggestion.findByPk.mockResolvedValue(mockSuggestion);

      await suggestionController.getSuggestionById(mockReq, mockRes, mockNext);

      expect(Suggestion.findByPk).toHaveBeenCalledWith('1', {
        include: [
          {
            model: Suggestion.sequelize.models.User,
            as: 'coordinator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          suggestion: mockSuggestion
        }
      });
    });

    it('should return 404 if suggestion not found', async () => {
      mockReq.params.id = '999';
      Suggestion.findByPk.mockResolvedValue(null);

      await suggestionController.getSuggestionById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        errorHelpers.notFound('Suggestion', '999')
      );
    });
  });

  describe('approveSuggestion', () => {
    it('should approve a suggestion', async () => {
      const mockSuggestion = {
        id: 1,
        coordinator_id: '12345678',
        suggestion_text: 'Test suggestion',
        status: 'pending',
        update: jest.fn().mockResolvedValue(true)
      };

      mockReq.params.id = '1';
      mockReq.body.admin_comments = 'Approved for implementation';
      mockReq.user.id = 1;

      validationResult.mockReturnValue({ isEmpty: () => true });
      Suggestion.findByPk.mockResolvedValue(mockSuggestion);

      await suggestionController.approveSuggestion(mockReq, mockRes, mockNext);

      expect(Suggestion.findByPk).toHaveBeenCalledWith('1', {
        include: [
          {
            model: Suggestion.sequelize.models.User,
            as: 'coordinator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });
      expect(mockSuggestion.update).toHaveBeenCalledWith({
        status: 'approved',
        admin_comments: 'Approved for implementation',
        approved_by: 1,
        approved_at: expect.any(Date)
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Suggestion approved successfully',
        data: {
          suggestion: mockSuggestion
        }
      });
    });

    it('should return 404 if suggestion not found', async () => {
      mockReq.params.id = '999';
      validationResult.mockReturnValue({ isEmpty: () => true });
      Suggestion.findByPk.mockResolvedValue(null);

      await suggestionController.approveSuggestion(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        errorHelpers.notFound('Suggestion', '999')
      );
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockReq.params.id = '1';
      validationResult.mockReturnValue({ isEmpty: () => true });
      Suggestion.findByPk.mockRejectedValue(error);

      await suggestionController.approveSuggestion(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('rejectSuggestion', () => {
    it('should successfully reject a pending suggestion', async () => {
      const mockSuggestion = {
        id: 1,
        coordinator_id: '12345678',
        suggestion_text: 'Test suggestion',
        status: 'pending',
        update: jest.fn().mockResolvedValue(true)
      };

      mockReq.params.id = '1';
      mockReq.body.admin_comments = 'Not feasible at this time';
      mockReq.user.id = 1;

      validationResult.mockReturnValue({ isEmpty: () => true });
      Suggestion.findByPk.mockResolvedValue(mockSuggestion);

      await suggestionController.rejectSuggestion(mockReq, mockRes, mockNext);

      expect(Suggestion.findByPk).toHaveBeenCalledWith('1', {
        include: [
          {
            model: Suggestion.sequelize.models.User,
            as: 'coordinator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });
      expect(mockSuggestion.update).toHaveBeenCalledWith({
        status: 'rejected',
        admin_comments: 'Not feasible at this time',
        approved_by: 1,
        approved_at: expect.any(Date)
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Suggestion rejected successfully',
        data: {
          suggestion: mockSuggestion
        }
      });
    });

    it('should return 404 if suggestion not found', async () => {
      mockReq.params.id = '999';
      validationResult.mockReturnValue({ isEmpty: () => true });
      Suggestion.findByPk.mockResolvedValue(null);

      await suggestionController.rejectSuggestion(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        errorHelpers.notFound('Suggestion', '999')
      );
    });

    it('should return 400 if suggestion has already been processed', async () => {
      const mockSuggestion = {
        id: 1,
        coordinator_id: '12345678',
        suggestion_text: 'Test suggestion',
        status: 'approved',
        update: jest.fn()
      };

      mockReq.params.id = '1';
      mockReq.body.admin_comments = 'Not feasible';
      mockReq.user.id = 1;

      validationResult.mockReturnValue({ isEmpty: () => true });
      Suggestion.findByPk.mockResolvedValue(mockSuggestion);

      await suggestionController.rejectSuggestion(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'This suggestion has already been processed'
      });
      expect(mockSuggestion.update).not.toHaveBeenCalled();
    });
  });
}); 