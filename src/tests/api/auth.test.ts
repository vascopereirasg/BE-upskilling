import request from "supertest"
import express from "express"
import { AppDataSource } from "../../database/data-source"
import { User } from "../../entities/User"
import { Credentials } from "../../entities/Credentials"
import bcrypt from "bcryptjs"
import authRoutes from "../../routes/authRoutes"
import { setupTestDB, teardownTestDB } from "../setup"
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals"

// Create Express app for testing
const app = express()
app.use(express.json())
app.use("/api/auth", authRoutes)

describe("Authentication API", () => {
  // Test user data
  const testUser = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
  }

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
  })

  // Clean up after tests
  afterAll(async () => {
    await teardownTestDB()
  })

  describe("POST /api/auth/login", () => {
    it("should return 200 and tokens for valid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      })

      // Check response
      expect(response.status).toBe(200)
      expect(response.body.message).toBe("Login successful")
      expect(response.body.user).toBeDefined()
      expect(response.body.user.email).toBe(testUser.email)
      expect(response.body.accessToken).toBeDefined()
      expect(response.body.refreshToken).toBeDefined()

      // Store tokens for later tests
      const { accessToken, refreshToken } = response.body

      // Test refresh token endpoint
      const refreshResponse = await request(app).post("/api/auth/refresh-token").send({ refreshToken })

      expect(refreshResponse.status).toBe(200)
      expect(refreshResponse.body.accessToken).toBeDefined()

      // Test protected endpoint
      const meResponse = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${accessToken}`)

      expect(meResponse.status).toBe(200)
      expect(meResponse.body.email).toBe(testUser.email)

      // Test logout
      const logoutResponse = await request(app).post("/api/auth/logout").send({ refreshToken })

      expect(logoutResponse.status).toBe(200)
      expect(logoutResponse.body.message).toBe("Logged out successfully")

      // Verify refresh token no longer works
      const refreshAfterLogoutResponse = await request(app).post("/api/auth/refresh-token").send({ refreshToken })

      expect(refreshAfterLogoutResponse.status).toBe(403)
    })

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe("Invalid credentials")
    })

    it("should return 401 for non-existent user", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe("Invalid credentials")
    })
  })

  describe("POST /api/auth/change-password", () => {
    let accessToken: string

    // Login before testing password change
    beforeEach(async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      })

      accessToken = response.body.accessToken
    })

    it("should change password successfully", async () => {
      const response = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: "newpassword123",
        })

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("Password changed successfully")

      // Verify old password no longer works
      const oldLoginResponse = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      })

      expect(oldLoginResponse.status).toBe(401)

      // Verify new password works
      const newLoginResponse = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "newpassword123",
      })

      expect(newLoginResponse.status).toBe(200)

      // Reset password for other tests
      await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${newLoginResponse.body.accessToken}`)
        .send({
          currentPassword: "newpassword123",
          newPassword: testUser.password,
        })
    })

    it("should return 401 for incorrect current password", async () => {
      const response = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          currentPassword: "wrongpassword",
          newPassword: "newpassword123",
        })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe("Current password is incorrect")
    })

    it("should return 401 for missing token", async () => {
      const response = await request(app).post("/api/auth/change-password").send({
        currentPassword: testUser.password,
        newPassword: "newpassword123",
      })

      expect(response.status).toBe(401)
    })
  })
})

