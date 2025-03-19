import bcrypt from 'bcryptjs';
import { NextFunction } from 'express';

/**
 * Middleware to hash the user's password before storing it.
 */
const encryptPasswordMiddleware = async (req: any, res: any, next: NextFunction) => {
  try {
    if (!req.body.password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    next(); // Move to the next middleware or route handler
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default encryptPasswordMiddleware;
