import express from 'express';
import dotenv from 'dotenv';
import usersRouter from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Use usersRouter for all /users routes
app.use('/users', usersRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
