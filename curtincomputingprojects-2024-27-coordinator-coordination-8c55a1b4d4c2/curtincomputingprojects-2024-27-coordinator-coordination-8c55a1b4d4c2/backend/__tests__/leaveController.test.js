const { validationResult } = require('express-validator');
const { LeaveRequest } = require('../models/LeaveRequest');
const leaveController = require('../controllers/leaveController');
const { errorHelpers } = require('../utils/errorResponse');

// Mock dependencies
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

jest.mock('../models/LeaveRequest', () => {
  const mockLeaveRequest = {
    findPendingRequests: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    findByCoordinatorId: jest.fn()
  };
  return {
    LeaveRequest: mockLeaveRequest
  };
});

describe('Leave Controller', () => {
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

  describe('submitLeaveRequest', () => {
    it('should submit a new leave request', async () => {
      const mockLeaveRequest = {
        id: 1,
        coordinator_id: '12345678',
        deputy_id: '87654321',
        start_date: '2024-03-01',
        end_date: '2024-03-05',
        reason: 'Personal reasons',
        status: 'pending'
      };

      mockReq.body = {
        deputy_id: '87654321',
        start_date: '2024-03-01',
        end_date: '2024-03-05',
        reason: 'Personal reasons'
      };

      validationResult.mockReturnValue({ isEmpty: () => true });
      LeaveRequest.create.mockResolvedValue(mockLeaveRequest);

      await leaveController.submitLeaveRequest(mockReq, mockRes, mockNext);

      expect(LeaveRequest.create).toHaveBeenCalledWith({
        coordinator_id: '12345678',
        deputy_id: '87654321',
        start_date: '2024-03-01',
        end_date: '2024-03-05',
        reason: 'Personal reasons',
        status: 'pending'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Leave request submitted successfully',
        data: {
          leaveRequest: mockLeaveRequest
        }
      });
    });

    it('should handle validation errors', async () => {
      const validationErrors = [
        { param: 'start_date', msg: 'Start date cannot be empty' }
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors
      });

      await leaveController.submitLeaveRequest(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation error',
        errors: validationErrors
      });
    });
  });

  describe('getPendingLeaveRequests', () => {
    it('should return pending leave requests', async () => {
      const mockLeaveRequests = [
        {
          id: 1,
          coordinator_id: '12345678',
          deputy_id: '87654321',
          start_date: '2024-03-01',
          end_date: '2024-03-05',
          status: 'pending'
        }
      ];

      LeaveRequest.findPendingRequests.mockResolvedValue(mockLeaveRequests);

      await leaveController.getPendingLeaveRequests(mockReq, mockRes, mockNext);

      expect(LeaveRequest.findPendingRequests).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: {
          leaveRequests: mockLeaveRequests
        }
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      LeaveRequest.findPendingRequests.mockRejectedValue(error);

      await leaveController.getPendingLeaveRequests(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('approveLeaveRequest', () => {
    it('should approve a pending leave request', async () => {
      const mockLeaveRequest = {
        id: 1,
        status: 'pending',
        update: jest.fn().mockResolvedValue(true)
      };

      mockReq.params.id = '1';
      mockReq.body.admin_comments = 'Approved for personal reasons';

      LeaveRequest.findById.mockResolvedValue(mockLeaveRequest);

      await leaveController.approveLeaveRequest(mockReq, mockRes, mockNext);

      expect(LeaveRequest.findById).toHaveBeenCalledWith('1');
      expect(mockLeaveRequest.update).toHaveBeenCalledWith({
        status: 'approved',
        admin_comments: 'Approved for personal reasons',
        approved_by: 1,
        approved_at: expect.any(Date)
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Leave request approved successfully',
        data: {
          leaveRequest: mockLeaveRequest
        }
      });
    });

    it('should return 404 if leave request not found', async () => {
      mockReq.params.id = '999';
      LeaveRequest.findById.mockResolvedValue(null);

      await leaveController.approveLeaveRequest(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        errorHelpers.notFound('Leave request', '999')
      );
    });

    it('should return 400 if leave request already processed', async () => {
      const mockLeaveRequest = {
        id: 1,
        status: 'approved'
      };

      mockReq.params.id = '1';
      LeaveRequest.findById.mockResolvedValue(mockLeaveRequest);

      await leaveController.approveLeaveRequest(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'This leave request has already been processed'
      });
    });
  });

  describe('rejectLeaveRequest', () => {
    it('should reject a pending leave request', async () => {
      const mockLeaveRequest = {
        id: 1,
        status: 'pending',
        update: jest.fn().mockResolvedValue(true)
      };

      mockReq.params.id = '1';
      mockReq.body.admin_comments = 'Rejected due to insufficient coverage';

      LeaveRequest.findById.mockResolvedValue(mockLeaveRequest);

      await leaveController.rejectLeaveRequest(mockReq, mockRes, mockNext);

      expect(LeaveRequest.findById).toHaveBeenCalledWith('1');
      expect(mockLeaveRequest.update).toHaveBeenCalledWith({
        status: 'rejected',
        admin_comments: 'Rejected due to insufficient coverage',
        approved_by: 1,
        approved_at: expect.any(Date)
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Leave request rejected successfully',
        data: {
          leaveRequest: mockLeaveRequest
        }
      });
    });

    it('should return 404 if leave request not found', async () => {
      mockReq.params.id = '999';
      LeaveRequest.findById.mockResolvedValue(null);

      await leaveController.rejectLeaveRequest(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        errorHelpers.notFound('Leave request', '999')
      );
    });

    it('should return 400 if leave request already processed', async () => {
      const mockLeaveRequest = {
        id: 1,
        status: 'rejected'
      };

      mockReq.params.id = '1';
      LeaveRequest.findById.mockResolvedValue(mockLeaveRequest);

      await leaveController.rejectLeaveRequest(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'This leave request has already been processed'
      });
    });
  });

  describe('getCoordinatorLeaveHistory', () => {
    it('should successfully get coordinator leave records', async () => {
      const mockLeaveRequests = [
        {
          id: 1,
          coordinator_id: '12345678',
          start_date: '2024-03-01',
          end_date: '2024-03-05',
          status: 'approved'
        },
        {
          id: 2,
          coordinator_id: '12345678',
          start_date: '2024-04-01',
          end_date: '2024-04-03',
          status: 'pending'
        }
      ];

      mockReq.params.coordinatorId = '12345678';
      mockReq.user.staff_id = '12345678';
      LeaveRequest.findByCoordinatorId.mockResolvedValue(mockLeaveRequests);

      await leaveController.getCoordinatorLeaveHistory(mockReq, mockRes, mockNext);

      expect(LeaveRequest.findByCoordinatorId).toHaveBeenCalledWith('12345678');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: {
          leaveRequests: mockLeaveRequests
        }
      });
    });

    it('admin should be able to view any coordinator\'s leave records', async () => {
      const mockLeaveRequests = [
        {
          id: 1,
          coordinator_id: '87654321',
          start_date: '2024-03-01',
          end_date: '2024-03-05',
          status: 'approved'
        }
      ];

      mockReq.params.coordinatorId = '87654321';
      mockReq.user.staff_id = '12345678';
      mockReq.user.role = 'admin';
      LeaveRequest.findByCoordinatorId.mockResolvedValue(mockLeaveRequests);

      await leaveController.getCoordinatorLeaveHistory(mockReq, mockRes, mockNext);

      expect(LeaveRequest.findByCoordinatorId).toHaveBeenCalledWith('87654321');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: {
          leaveRequests: mockLeaveRequests
        }
      });
    });

    it('non-admin users cannot view other coordinators\' leave records', async () => {
      mockReq.params.coordinatorId = '87654321';
      mockReq.user.staff_id = '12345678';
      mockReq.user.role = 'coordinator';

      await leaveController.getCoordinatorLeaveHistory(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'You do not have permission to view other coordinators\' leave records'
      });
    });
  });
});