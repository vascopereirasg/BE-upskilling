import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate user creation request.
 */
const validateUserRequest = (req: any, res: any, next: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  next(); // Proceed to the route handler
};

export default validateUserRequest;
