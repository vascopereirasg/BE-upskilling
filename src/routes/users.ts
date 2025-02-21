import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const usersRouter = express.Router();

const usersFilePath = path.join(__dirname, '../data/users.json');

interface User {
  id: number;
  email: string;
  password: string;
}

// Middleware to encrypt the password (reverse string for now)
const encryptPasswordMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.password) {
    req.body.password = req.body.password.split('').reverse().join('');
  }
  next();
};

// Function to read users from the file
const readUsersFromFile = (): User[] => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data) as User[];
  } catch (error) {
    return [];
  }
};

// Function to write users to the file
const writeUsersToFile = (users: User[]) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
};

/**
 * CREATE: POST /users
 * Uses encryptPasswordMiddleware to encrypt passwords before storing.
 */
usersRouter.post('/', encryptPasswordMiddleware, (req: any, res: any) => {
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
 * Fetch all users.
 */
usersRouter.get('/', (req: Request, res: Response) => {
  const users = readUsersFromFile();
  res.json(users);
});

/**
 * READ: GET /users/:id
 * Fetch user by ID.
 */
usersRouter.get('/:id', (req: any, res: any) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const users = readUsersFromFile();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

/**
 * UPDATE: PUT /users/:id
 * Uses encryptPasswordMiddleware to encrypt passwords before updating.
 */
usersRouter.put('/:id', encryptPasswordMiddleware, (req: any, res: any) => {
  const userId = parseInt(req.params.id);
  const { email, password } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  let users = readUsersFromFile();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (email) users[userIndex].email = email;
  if (password) users[userIndex].password = password;

  writeUsersToFile(users);
  res.json({ message: 'User updated successfully', user: users[userIndex] });
});

/**
 * DELETE: DELETE /users/:id
 * Remove user from the array.
 */
usersRouter.delete('/:id', (req: any, res: any) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  let users = readUsersFromFile();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users = users.filter((u) => u.id !== userId);
  writeUsersToFile(users);

  res.json({ message: 'User deleted successfully' });
});

export default usersRouter;
