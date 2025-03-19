import { Request, Response, NextFunction } from 'express';

/**
 * Centralized error-handling middleware.
 */
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
};

export default errorHandler;
