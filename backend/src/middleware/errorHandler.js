const { sendServerErrorAlert } = require('../utils/adminAlerts');

const errorHandler = async (err, req, res, next) => {
    console.error('🔴 Unhandled Error Caught:', err);

    const errorData = {
        message: err.message || 'Unknown Server Error',
        stack: err.stack,
        route: `${req.method} ${req.originalUrl}`,
        userEmail: req.user ? req.user.email : 'Unauthenticated'
    };

    // Send the alert asynchronously so it doesn't block the response
    sendServerErrorAlert(errorData).catch(console.error);

    // Send generic error response to client
    res.status(err.status || 500).json({
        success: false,
        error: 'Internal Server Error'
    });
};

module.exports = errorHandler;
