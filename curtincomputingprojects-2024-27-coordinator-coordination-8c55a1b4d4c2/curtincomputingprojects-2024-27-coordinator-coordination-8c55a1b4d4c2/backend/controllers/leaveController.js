const { validationResult } = require('express-validator');
const { LeaveRequest, User } = require('../models');
const { errorHelpers } = require('../utils/errorResponse');
const { sendNotificationEmail } = require('../services/emailService');

/**
 * @desc    Get all pending leave requests
 * @route   GET /api/leaves/pending
 * @access  Private/Admin
 */
exports.getPendingLeaveRequests = async (req, res, next) => {
  try {
    const leaveRequests = await LeaveRequest.findPendingRequests();
    
    res.status(200).json({
      status: 'success',
      results: leaveRequests.length,
      data: {
        leaveRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve leave request
 * @route   PATCH /api/leaves/:id/approve
 * @access  Private/Admin
 */
exports.approveLeaveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const leaveRequest = await LeaveRequest.findById(id);
    
    if (!leaveRequest) {
      return next(errorHelpers.notFound('Leave request', id));
    }
    
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'This leave request has already been processed'
      });
    }
    
    await leaveRequest.update({
      status: 'approved'
    });

    // Get coordinator and deputy information for email notification
    const [coordinator, deputy] = await Promise.all([
      User.findByStaffId(leaveRequest.coordinator_id),
      User.findByStaffId(leaveRequest.deputy_id)
    ]);

    // Send email notification to coordinator
    if (coordinator && coordinator.email) {
      const subject = `Leave Request Approved - ${leaveRequest.course_code}`;
      const message = `
        Your leave request has been approved.
        
        Leave Request Details:
        - Course: ${leaveRequest.course_code}
        - Start Date: ${new Date(leaveRequest.start_date).toLocaleDateString()}
        - End Date: ${new Date(leaveRequest.end_date).toLocaleDateString()}
        - Deputy: ${deputy.name}
        - Type: ${leaveRequest.is_short_leave ? 'Short Leave' : 'Regular Leave'}
      `;

      await sendNotificationEmail(coordinator.email, subject, message);
    }

    // Send email notification to deputy
    if (deputy && deputy.email) {
      const subject = `Leave Request Approved - ${leaveRequest.course_code}`;
      const message = `
        The leave request you were assigned to has been approved.
        
        Leave Request Details:
        - Course: ${leaveRequest.course_code}
        - Coordinator: ${coordinator.name}
        - Start Date: ${new Date(leaveRequest.start_date).toLocaleDateString()}
        - End Date: ${new Date(leaveRequest.end_date).toLocaleDateString()}
        - Type: ${leaveRequest.is_short_leave ? 'Short Leave' : 'Regular Leave'}
      `;

      await sendNotificationEmail(deputy.email, subject, message);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Leave request approved successfully',
      data: {
        leaveRequest
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject leave request
 * @route   PATCH /api/leaves/:id/reject
 * @access  Private/Admin
 */
exports.rejectLeaveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const leaveRequest = await LeaveRequest.findById(id);
    
    if (!leaveRequest) {
      return next(errorHelpers.notFound('Leave request', id));
    }
    
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'This leave request has already been processed'
      });
    }
    
    await leaveRequest.update({
      status: 'rejected'
    });

    // Get coordinator and deputy information for email notification
    const [coordinator, deputy] = await Promise.all([
      User.findByStaffId(leaveRequest.coordinator_id),
      User.findByStaffId(leaveRequest.deputy_id)
    ]);

    // Send email notification to coordinator
    if (coordinator && coordinator.email) {
      const subject = `Leave Request Rejected - ${leaveRequest.course_code}`;
      const message = `
        Your leave request has been rejected.
        
        Leave Request Details:
        - Course: ${leaveRequest.course_code}
        - Start Date: ${new Date(leaveRequest.start_date).toLocaleDateString()}
        - End Date: ${new Date(leaveRequest.end_date).toLocaleDateString()}
        - Deputy: ${deputy.name}
        - Type: ${leaveRequest.is_short_leave ? 'Short Leave' : 'Regular Leave'}
      `;

      await sendNotificationEmail(coordinator.email, subject, message);
    }

    // Send email notification to deputy
    if (deputy && deputy.email) {
      const subject = `Leave Request Rejected - ${leaveRequest.course_code}`;
      const message = `
        The leave request you were assigned to has been rejected.
        
        Leave Request Details:
        - Course: ${leaveRequest.course_code}
        - Coordinator: ${coordinator.name}
        - Start Date: ${new Date(leaveRequest.start_date).toLocaleDateString()}
        - End Date: ${new Date(leaveRequest.end_date).toLocaleDateString()}
        - Type: ${leaveRequest.is_short_leave ? 'Short Leave' : 'Regular Leave'}
      `;

      await sendNotificationEmail(deputy.email, subject, message);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Leave request rejected successfully',
      data: {
        leaveRequest
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit leave request
 * @route   POST /api/leaves
 * @access  Private
 */
exports.submitLeaveRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { deputy_id, course_code, duties, start_date, end_date, is_short_leave } = req.body;
    
    const leaveRequest = await LeaveRequest.create({
      coordinator_id: req.user.staff_id,
      deputy_id,
      course_code,
      duties,
      start_date,
      end_date,
      is_short_leave,
      status: 'pending'
    });

    // Get coordinator and deputy information for email notification
    const [coordinator, deputy] = await Promise.all([
      User.findByStaffId(req.user.staff_id),
      User.findByStaffId(deputy_id)
    ]);

    // Send email notification to deputy
    if (deputy && deputy.email) {
      const subject = `New Leave Request - ${course_code}`;
      const message = `
        You have been assigned as a deputy coordinator for ${course_code}.
        
        Leave Request Details:
        - Coordinator: ${coordinator.name}
        - Course: ${course_code}
        - Start Date: ${new Date(start_date).toLocaleDateString()}
        - End Date: ${new Date(end_date).toLocaleDateString()}
        - Duties: ${duties}
        - Type: ${is_short_leave ? 'Short Leave' : 'Regular Leave'}
        
        Please review this request in the system.
      `;

      await sendNotificationEmail(deputy.email, subject, message);
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Leave request submitted successfully',
      data: {
        leaveRequest
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get coordinator's leave history
 * @route   GET /api/leaves/coordinator/:coordinatorId
 * @access  Private
 */
exports.getCoordinatorLeaveHistory = async (req, res, next) => {
  try {
    const { coordinatorId } = req.params;
    
    // Verify if current user or admin
    if (req.user.staff_id !== coordinatorId && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view other coordinators\' leave records'
      });
    }
    
    const leaveRequests = await LeaveRequest.findByCoordinatorId(coordinatorId);
    
    res.status(200).json({
      status: 'success',
      results: leaveRequests.length,
      data: {
        leaveRequests
      }
    });
  } catch (error) {
    next(error);
  }
}; 