// Utility function to format API responses
export const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

// Utility function to format API errors
export const sendError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

// Validation helper
export const validateRequired = (obj, fields) => {
  const missing = fields.filter(field => !obj[field]);
  return missing.length === 0 ? null : `Missing required fields: ${missing.join(', ')}`;
};

export default { sendSuccess, sendError, validateRequired };
