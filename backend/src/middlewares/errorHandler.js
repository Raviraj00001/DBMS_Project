// backend/src/middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR HANDLER] ${req.method} ${req.originalUrl}:`, err);

  // PostgreSQL Error Code Mapping
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        return res.status(409).json({
          success: false,
          message: 'Conflict: A record with these unique details already exists.',
          detail: err.detail,
        });

      case '23503': // foreign_key_violation
        return res.status(400).json({
          success: false,
          message: 'Referenced entity not found or foreign key constraint failed.',
          detail: err.detail,
        });

      case '23514': // check_violation
        return res.status(400).json({
          success: false,
          message: 'Data constraint validation failed: ' + (err.detail || err.message),
        });

      case '22P02': // invalid_text_representation
        return res.status(400).json({
          success: false,
          message: 'Invalid input format (e.g., non-integer supplied for an ID).',
        });

      case 'P0001': // Custom RAISE EXCEPTION from trigger or procedure
        return res.status(400).json({
          success: false,
          message: err.message,
        });

      case 'ECONNREFUSED':
      case 'ENOTFOUND':
        return res.status(503).json({
          success: false,
          message: 'Database server is currently unavailable. Please verify PostgreSQL connection.',
        });
    }
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;

