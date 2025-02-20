import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Path to the JSON file
const usersFilePath = path.join(__dirname, 'users.json');

// User interface
interface User {
  id: number;
  email: string;
  password: string;
}

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to log requests
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.on('finish', () => console.log(`Response Status: ${res.statusCode}`));
  next();
};
app.use(requestLogger);

// Function to read users from the JSON file
const readUsersFromFile = (): User[] => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data) as User[];
  } catch (error) {
    return [];
  }
};

// Function to write users to the JSON file
const writeUsersToFile = (users: User[]) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
};

/**
 * CREATE: POST /users
 * Adds a new user to the JSON file.
 */
app.post('/users', (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = readUsersFromFile();
  const newUser: User = { id: users.length + 1, email, password };
  users.push(newUser);
  writeUsersToFile(users);

  res.status(201).json({ message: 'User created successfully', user: newUser });
});

/**
 * READ: GET /users
 * Retrieves the list of all users from the JSON file.
 */
app.get('/users', (req: Request, res: Response) => {
  const users = readUsersFromFile();
  res.json({ users });
});

/**
 * READ: GET /users/:id
 * Retrieves a user by ID.
 */
app.get('/users/:id', (req: any, res: any) => {
  const userId = parseInt(req.params.id);
  const users = readUsersFromFile();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
});

/**
 * UPDATE: PUT /users/:id
 * Updates a user's email or password in the JSON file.
 */
app.put('/users/:id', (req: any, res: any) => {
  const userId = parseInt(req.params.id);
  const { email, password } = req.body;

  // Check if userId is a valid number
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  let users = readUsersFromFile();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update email or password only if a new value is provided
  if (email) users[userIndex].email = email;
  if (typeof password === 'string' && password.trim() !== '') {
    users[userIndex].password = password;
  }

  writeUsersToFile(users);
  res.json({ message: 'User updated successfully', user: users[userIndex] });
});


/**
 * DELETE: DELETE /users/:id
 * Removes a user from the JSON file.
 */
app.delete('/users/:id', (req: any, res: any) => {
  const userId = parseInt(req.params.id);
  let users = readUsersFromFile();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users.splice(userIndex, 1);
  writeUsersToFile(users);

  res.json({ message: 'User deleted successfully' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
