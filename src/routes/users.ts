import express from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import validateUserRequest from '../middlewares/validateRequest';
import encryptPasswordMiddleware from '../middlewares/encryptPassword';
import apiKeyMiddleware from '../middlewares/apiKeyMiddleware';

const usersRouter = express.Router();
const usersFilePath = path.join(__dirname, '../data/users.json');

interface User {
  id: number;
  email: string;
  password: string;
}

// Read users from file
const readUsersFromFile = (): User[] => {
  try {
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  } catch (error) {
    return [];
  }
};

// Write users to file
const writeUsersToFile = (users: User[]) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
};

/**
 * CREATE: POST /users (Protected with API Key)
 * Uses encryption middleware before storing the password.
 */
usersRouter.post('/', apiKeyMiddleware, validateUserRequest, encryptPasswordMiddleware, (req, res) => {
  const { email, password } = req.body;
  const users = readUsersFromFile();

  const newUser: User = { id: users.length + 1, email, password };
  users.push(newUser);
  writeUsersToFile(users);

  res.status(201).json({ message: 'User created', user: { id: newUser.id, email: newUser.email } });
});

/**
 * UPDATE PASSWORD: PUT /users/:id (Protected with API Key)
 * Uses encryption middleware to hash new passwords before storing.
 */
usersRouter.put('/:id', apiKeyMiddleware, encryptPasswordMiddleware, (req: any, res:any) => {
  const { id } = req.params;
  const { email, password } = req.body;
  const users = readUsersFromFile();

  const userIndex = users.findIndex((user) => user.id === parseInt(id));

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (email) users[userIndex].email = email;
  if (password) users[userIndex].password = password; // Password is already encrypted by middleware

  writeUsersToFile(users);
  res.json({ message: 'User updated successfully' });
});

export default usersRouter;
