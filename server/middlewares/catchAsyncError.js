// ✅ catchAsyncError: A higher-order function to handle async errors in Express routes
// @desc    Wraps async route handlers and forwards errors to the error middleware
// @usage   Used in controllers to avoid repetitive try-catch blocks

export const catchAsyncError = (theFunction) => {
  return (req, res, next) => {
    // Executes the async function and catches any rejected promises
    Promise.resolve(theFunction(req, res, next)).catch(next);
  };
};
