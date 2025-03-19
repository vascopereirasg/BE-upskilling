import request from "supertest"
import express from "express"
import { AppDataSource } from "../../database/data-source"
import { User } from "../../entities/User"
import { Credentials } from "../../entities/Credentials"
import bcrypt from "bcryptjs"
import authRoutes from "../../routes/authRoutes"
import userRoutes from "../../routes/userRoutes"
import { authenticateJWT } from "../../middlewares/authMiddleware"
import { setupTestDB, teardownTestDB } from "../setup"
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals"

// Create Express app for testing
const app = express()
app.use(express.json())
app.use("/api/auth", authRoutes)

// Add protected routes
app.use("/api/users", authenticateJWT, userRoutes)

describe("Protected Routes", () => {
  // Test user data
  const testUser = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
  }

  let accessToken: string

  // Set up database before tests
  beforeAll(async () => {
    await setupTestDB()

    // Create test user
    const userRepository = AppDataSource.getRepository(User)
    const credentialsRepository = AppDataSource.getRepository(Credentials)

    // Create user
    const user = userRepository.create({
      email: testUser.email,
      name: testUser.name,
    })

    await userRepository.save(user)

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(testUser.password, salt)

    // Create credentials
    const credentials = credentialsRepository.create({
      userId: user.id,
      password: hashedPassword,
    })

    await credentialsRepository.save(credentials)

    // Login to get access token
    const response = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    })

    accessToken = response.body.accessToken
  })

  // Clean up after tests
  afterAll(async () => {
    await teardownTestDB()
  })

  describe("Protected Routes Access", () => {
    it("should allow access to protected routes with valid token", async () => {
      const response = await request(app).get("/api/users").set("Authorization", `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
    })

    it("should deny access to protected routes without token", async () => {
      const response = await request(app).get("/api/users")

      expect(response.status).toBe(401)
      expect(response.body.error).toBe("Authorization header missing")
    })

    it("should deny access with invalid token", async () => {
      const response = await request(app).get("/api/users").set("Authorization", "Bearer invalid.token.here")

      expect(response.status).toBe(401)
      expect(response.body.error).toBe("Invalid or expired token")
    })

    it("should deny access with incorrect token format", async () => {
      const response = await request(app).get("/api/users").set("Authorization", `InvalidFormat ${accessToken}`)

      expect(response.status).toBe(401)
      expect(response.body.error).toBe("Invalid authorization format. Use: Bearer <token>")
    })
  })
})

