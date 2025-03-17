/**
 * This file contains manual test code that you can run to test the JWT authentication
 * Run with: npx ts-node src/tests/manual-test.ts
 */
import axios, { type AxiosError } from "axios"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// API base URL
const API_URL = "http://localhost:3000/api"

// Test user credentials
const testUser = {
  email: "test@example.com",
  password: "password123",
}

// Store tokens
let accessToken: string
let refreshToken: string

interface LoginResponse {
  message: string
  user: {
    id: number
    email: string
    name?: string
  }
  accessToken: string
  refreshToken: string
}

interface RefreshResponse {
  accessToken: string
}

interface UserProfile {
  id: number
  email: string
  name?: string
  createdAt: string
  updatedAt: string
}

interface LogoutResponse {
  message: string
}

interface ErrorResponse {
  error: string
}

// Test the authentication flow
async function testAuthFlow(): Promise<void> {
  try {
    console.log("Starting JWT authentication test...")

    // Step 1: Login
    console.log("\n1. Testing login...")
    const loginResponse = await axios.post<LoginResponse>(`${API_URL}/auth/login`, testUser)

    console.log("Login successful!")
    console.log("User:", loginResponse.data.user)

    // Store tokens
    accessToken = loginResponse.data.accessToken
    refreshToken = loginResponse.data.refreshToken

    console.log("Access Token:", accessToken.substring(0, 20) + "...")
    console.log("Refresh Token:", refreshToken.substring(0, 20) + "...")

    // Step 2: Access protected route
    console.log("\n2. Testing protected route access...")
    const meResponse = await axios.get<UserProfile>(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    console.log("Protected route access successful!")
    console.log("User profile:", meResponse.data)

    // Step 3: Refresh token
    console.log("\n3. Testing token refresh...")
    const refreshResponse = await axios.post<RefreshResponse>(`${API_URL}/auth/refresh-token`, {
      refreshToken,
    })

    console.log("Token refresh successful!")
    console.log("New access token:", refreshResponse.data.accessToken.substring(0, 20) + "...")

    // Update access token
    accessToken = refreshResponse.data.accessToken

    // Step 4: Test with new access token
    console.log("\n4. Testing protected route with new access token...")
    const meResponse2 = await axios.get<UserProfile>(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    console.log("Protected route access with new token successful!")
    console.log("User profile:", meResponse2.data)

    // Step 5: Logout
    console.log("\n5. Testing logout...")
    const logoutResponse = await axios.post<LogoutResponse>(`${API_URL}/auth/logout`, {
      refreshToken,
    })

    console.log("Logout successful!")
    console.log("Response:", logoutResponse.data)

    // Step 6: Try to use refresh token after logout (should fail)
    console.log("\n6. Testing refresh token after logout (should fail)...")
    try {
      await axios.post<RefreshResponse>(`${API_URL}/auth/refresh-token`, {
        refreshToken,
      })
      console.log("ERROR: Refresh token still works after logout!")
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      console.log("Success: Refresh token was invalidated after logout")
      console.log("Error response:", axiosError.response?.data)
    }

    console.log("\nJWT authentication test completed successfully!")
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>
    console.error("Error during test:", axiosError.response?.data || axiosError.message)
  }
}

// Run the test
testAuthFlow()

