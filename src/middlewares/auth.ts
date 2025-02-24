import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check for an API key in the request headers.
 */
const authMiddleware = (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== 'secure-api-key') {
    return res.status(401).json({ error: 'Unauthorized. Invalid API key.' });
  }

  next(); // Proceed if the API key is valid
};

export default authMiddleware;
