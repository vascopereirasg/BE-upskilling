import express from 'express';
import dotenv from 'dotenv';
import usersRouter from './routes/users';
import loggerMiddleware from './middlewares/logger';
import errorHandler from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Apply global middleware
app.use(loggerMiddleware);

// Use usersRouter for all /users routes
app.use('/users', usersRouter);

// Error handling middleware (must be the last middleware)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
