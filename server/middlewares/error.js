class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server error";

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Resource not found. Invalid: ${err.path}`,
    });
  } else if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Json Web Token is invalid, try again",
    });
  } else if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Json Web Token is expired, try again",
    });
  } else if (err.name === "MongoServerError" && err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: `Duplicate ${Object.keys(err.keyValue)} entered`,
    });
  } else if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err.name === "Error") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err.name === "TypeError") {
    return res.status(400).json({
      success: false,
      message: "Type Error occurred",
    });
  } else {
    return res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};
export const createError = (message, statusCode) => {
  return new ErrorHandler(message, statusCode);
};
