// ✅ Custom ErrorHandler class to attach status codes to errors
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// ✅ Centralized error handling middleware
// @desc    Handles various known error types and sends consistent JSON responses
// @usage   Use as the last middleware in app.js: app.use(errorMiddleware)
export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Handle invalid MongoDB ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Resource not found. Invalid: ${err.path}`,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Handle invalid JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Json Web Token is invalid, try again",
    });
  }

  // Handle expired JWT
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Json Web Token is expired, try again",
    });
  }

  // Handle duplicate key errors (e.g., email or username already exists)
  if (err.name === "MongoServerError" && err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: `Duplicate ${Object.keys(err.keyValue)} entered`,
    });
  }

  // Handle Multer file upload errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Handle generic JavaScript errors
  if (err.name === "Error") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Handle type errors
  if (err.name === "TypeError") {
    return res.status(400).json({
      success: false,
      message: "Type Error occurred",
    });
  }

  // Default fallback for unhandled errors
  return res.status(statusCode).json({
    success: false,
    message: message,
  });
};

// ✅ Helper function to create custom errors with status codes
export const ErrorHandlers = (message, statusCode) => {
  return new ErrorHandler(message, statusCode);
};
