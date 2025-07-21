const config = require('../config/config');

// Middleware to check if user is an admin

exports.isAdmin = (req, res, next) => {
  if (req.user.role_id !== config.roles.ADMIN) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Middleware to check if user is a coordinator

exports.isCoordinator = (req, res, next) => {
  if (req.user.role_id !== config.roles.COORDINATOR) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Coordinator privileges required.'
    });
  }
  next();
};

// Middleware to check if user is either an admin or coordinator

exports.isAdminOrCoordinator = (req, res, next) => {
  if (
    req.user.role_id !== config.roles.ADMIN && 
    req.user.role_id !== config.roles.COORDINATOR
  ) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin or Coordinator privileges required.'
    });
  }
  next();
};

// Middleware to check if user is the requested user or an admin
exports.isSelfOrAdmin = (req, res, next) => {
  if (
    req.user.id !== parseInt(req.params.id) && 
    req.user.role_id !== config.roles.ADMIN
  ) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. You can only access your own data unless you are an admin.'
    });
  }
  next();
};

/**
 * Middleware to check if user is the coordinator for the course
 * Requires the course ID to be in the request parameters
 */
exports.isCourseCoordinator = async (req, res, next) => {
  const courseId = req.params.courseId;
  const CoordinatorCourse = require('../models/CoordinatorCourse');
  
  try {
    const association = await CoordinatorCourse.findOne({
      where: {
        coordinator_id: req.user.id,
        course_id: courseId,
        status: 'active'
      }
    });
    
    if (!association && req.user.role_id !== config.roles.ADMIN) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You are not a coordinator for this course.'
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};