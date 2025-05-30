// ✅ Generate a 6-digit numeric OTP
// @desc    Returns a random 6-digit string for verification purposes
// @usage   Used in account verification and password reset flows

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};
