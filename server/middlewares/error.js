export class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "ErrorHandler";
    this.statusCode = statusCode || 500;
  }
}

export const ErrorHandlers = (message, statusCode) => {
  return new ErrorHandler(message, statusCode);
};

export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (err.name === "ErrorHandler") {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Resource not found. Invalid identifier: ${err.path}`,
    });
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: errors.join(", ") || err.message,
    });
  }

  if (err.name === "MongoServerError" && err.code === 11000) {
    const keys = err.keyValue ? Object.keys(err.keyValue) : ["field"];
    return res.status(409).json({
      success: false,
      message: `Duplicate entry for ${keys.join(", ")}`,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "JSON Web Token is invalid",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "JSON Web Token has expired",
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
