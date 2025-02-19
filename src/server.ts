import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Home route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript!');
});

// Route with an ID parameter
app.get('/user/:id', (req: Request<{ id: string }>, res: Response) => {
  const userId = req.params.id;
  res.json({ message: `Fetching details for user ${userId}` });
});

// Route with query parameters
app.get('/search', (req: any, res: any) => {
  const { keyword, limit } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  res.json({ message: `Searching for "${keyword}" with limit ${limit || 'no limit'}` });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});