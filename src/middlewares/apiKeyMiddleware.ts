import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate API key in headers.
 */
const apiKeyMiddleware = (req: any, res: any, next: NextFunction) => {
  const apiKey = req.header('x-api-key'); // Get API key from request headers

  if (!apiKey) {
    return res.status(401).json({ error: 'API key is missing' });
  }

  if (apiKey !== 'secure-api-key') {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next(); // Allow the request to proceed
};

export default apiKeyMiddleware;
