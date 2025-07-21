/**
 * Custom error class for API errors
 * @extends Error
 */
class ErrorResponse extends Error {
    /**
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     */
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Helper function to create standardized error responses
   */
  const errorHelpers = {
    /**
     * Create a not found error response
     * @param {string} resource - The resource that was not found
     * @param {string|number} id - The ID of the resource
     * @returns {ErrorResponse} Not found error
     */
    notFound: (resource, id) => {
      return new ErrorResponse(`${resource} not found with id ${id}`, 404);
    },
    
    /**
     * Create a forbidden error response
     * @param {string} message - Error message
     * @returns {ErrorResponse} Forbidden error
     */
    forbidden: (message = 'You do not have permission to perform this action') => {
      return new ErrorResponse(message, 403);
    },
    
    /**
     * Create an unauthorized error response
     * @param {string} message - Error message
     * @returns {ErrorResponse} Unauthorized error
     */
    unauthorized: (message = 'Not authorized to access this resource') => {
      return new ErrorResponse(message, 401);
    },
    
    /**
     * Create a bad request error response
     * @param {string} message - Error message
     * @returns {ErrorResponse} Bad request error
     */
    badRequest: (message = 'Invalid request parameters') => {
      return new ErrorResponse(message, 400);
    },
    
    /**
     * Create a server error response
     * @param {string} message - Error message
     * @returns {ErrorResponse} Server error
     */
    serverError: (message = 'Internal server error') => {
      return new ErrorResponse(message, 500);
    },
    
    /**
     * Create a conflict error response
     * @param {string} message - Error message
     * @returns {ErrorResponse} Conflict error
     */
    conflict: (message = 'Resource already exists') => {
      return new ErrorResponse(message, 409);
    }
  };
  
  module.exports = {
    ErrorResponse,
    errorHelpers
  };