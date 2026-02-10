import type { Request, Response, NextFunction } from "express";

export const errorHandler = (statusCode: number, message: string) => {
  const error = new Error();
  error.message = message;
  return error;
};

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`Error ${err.name}: ${err.message}`);
  console.error('Stack:', err.stack);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Handle SQLite constraint errors
  if (err.message.includes('UNIQUE constraint failed')) {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists'
    });
  }

  if (err.message.includes('FOREIGN KEY constraint failed')) {
    return res.status(400).json({
      success: false,
      message: 'Referenced resource does not exist'
    });
  }

  if (err.message.includes('NOT NULL constraint failed')) {
    return res.status(400).json({
      success: false,
      message: 'Required field is missing'
    });
  }

  // Default error
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message || 'Something went wrong';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
}
