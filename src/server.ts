import express from 'express';
import dotenv from 'dotenv';
//import cors from 'cors';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import todoRoutes from './routes/todos';
import productRoutes from "./routes/productRoutes";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Database Connection (No Username/Password)
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'myuser',
  password: 'mypassword',
});

// Middleware to parse JSON requests
app.use(express.json());

// CORS Middleware to allow frontend access
//app.use(cors());

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// API Key Authentication Middleware
const authenticateAPIKey = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const apiKey = req.header('x-api-key');
  if (apiKey !== 'secure-api-key') {
    res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  } else {
    next();
  }
};

// Encrypt Password Middleware
const encryptPassword = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }
  next();
};

// Routes
app.use('/api/todos', authenticateAPIKey, todoRoutes);

app.use("/products", productRoutes);

// Error Handling Middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the Server
app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1'); // Test database connection
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
});

export { pool };
