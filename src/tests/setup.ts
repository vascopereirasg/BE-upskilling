import { AppDataSource } from "../database/data-source"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.test" })

// Setup function to initialize database connection
export const setupTestDB = async () => {
  try {
    // Override database connection for tests
    Object.assign(AppDataSource.options, {
      database: process.env.TEST_DB_NAME || "test_db",
      synchronize: true, // Auto-create schema for tests
      dropSchema: true, // Drop schema before tests
    })

    // Initialize connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    console.log("Test database connection established")
  } catch (error) {
    console.error("Error setting up test database:", error)
    throw error
  }
}

// Teardown function to close database connection
export const teardownTestDB = async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy()
    console.log("Test database connection closed")
  }
}

