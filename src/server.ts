import express from 'express';
import dotenv from 'dotenv';
import usersRouter from './routes/users';
import authRouter from './routes/auth'; // Import auth router

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Register Routers
app.use('/users', usersRouter);
app.use('/', authRouter); // Authentication routes (e.g., login)

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
