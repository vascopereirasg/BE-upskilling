import express, { type Request, type Response } from "express"
import fs from "fs"
import path from "path"
import bcrypt from "bcryptjs"
import apiKeyMiddleware from "../middlewares/apiKeyMiddleware"

const authRouter = express.Router()
const usersFilePath = path.join(__dirname, "../data/users.json")

interface User {
  id: number
  email: string
  password: string // Stored as a hashed password
}

// Read users from file
const readUsersFromFile = (): User[] => {
  try {
    return JSON.parse(fs.readFileSync(usersFilePath, "utf8"))
  } catch (error) {
    return []
  }
}

/**
 * LOGIN: POST /login
 * Compares the given password with the stored hash.
 */
authRouter.post("/login", apiKeyMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  // Validate request
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" })
    return
  }

  // Fetch users from storage
  const users = readUsersFromFile()
  const user = users.find((u) => u.email === email)

  if (!user) {
    res.status(401).json({ error: "Unauthorized: Invalid email or password (not found)" })
    return
  }

  // Compare password with stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    res.status(401).json({ error: "Unauthorized: Invalid email or password (incorrect)" })
    return
  }

  // If authentication is successful, return user details (excluding password)
  res.status(200).json({
    message: "Login successful",
    user: { id: user.id, email: user.email },
  })
})

export default authRouter

