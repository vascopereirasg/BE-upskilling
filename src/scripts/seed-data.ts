import { AppDataSource } from "../database/data-source"
import { User } from "../entities/User"
import { Credentials } from "../entities/Credentials"
import bcrypt from "bcryptjs"

/**
 * This script seeds the database with initial user data
 * Run with: npx ts-node src/scripts/seed-users.ts
 */
async function seedUsers() {
  console.log("Starting user seeding...")

  try {
    // Initialize database connection
    await AppDataSource.initialize()
    console.log("Database connection established")

    // Use raw SQL with CASCADE to truncate tables properly
    console.log("Clearing existing data...")
    await AppDataSource.query('TRUNCATE TABLE "credentials", "users" CASCADE')
    console.log("Tables truncated successfully")

    // Create users and credentials
    const userRepository = AppDataSource.getRepository(User)
    const credentialsRepository = AppDataSource.getRepository(Credentials)

    // Create users
    const users = userRepository.create([
      {
        email: "john@example.com",
        name: "John Doe",
      },
      {
        email: "jane@example.com",
        name: "Jane Smith",
      },
    ])

    await userRepository.save(users)
    console.log("Created users")

    // Hash passwords
    const salt = await bcrypt.genSalt(10)
    const password1 = await bcrypt.hash("password123", salt)
    const password2 = await bcrypt.hash("securepass", salt)

    // Create credentials
    const credentials = credentialsRepository.create([
      {
        userId: users[0].id,
        password: password1,
      },
      {
        userId: users[1].id,
        password: password2,
      },
    ])

    await credentialsRepository.save(credentials)
    console.log("Created credentials")

    console.log("User seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding users:", error)
  } finally {
    // Close the connection
    await AppDataSource.destroy()
    console.log("Database connection closed")
  }
}

// Run the seeding function
seedUsers()

