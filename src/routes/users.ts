import express from 'express';
import fs from 'fs';
import path from 'path';
import validateUserRequest from '../middlewares/validateRequest';
import authMiddleware from '../middlewares/auth';

const usersRouter = express.Router();
const usersFilePath = path.join(__dirname, '../data/users.json');

interface User {
  id: number;
  email: string;
  password: string;
}

const readUsersFromFile = (): User[] => {
  try {
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeUsersToFile = (users: User[]) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
};

/**
 * CREATE: POST /users
 * Uses validation middleware before handling the request.
 */
usersRouter.post('/', validateUserRequest, (req, res) => {
  const { email, password } = req.body;
  const users = readUsersFromFile();

  const newUser: User = { id: users.length + 1, email, password };
  users.push(newUser);
  writeUsersToFile(users);

  res.status(201).json({ message: 'User created', user: newUser });
});

/**
 * READ: GET /users
 * Requires authentication (API key) to access.
 */
usersRouter.get('/', authMiddleware, (req, res) => {
  const users = readUsersFromFile();
  res.json(users);
});

export default usersRouter;
