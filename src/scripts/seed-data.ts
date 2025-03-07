import { AppDataSource } from "../database/data-source"
import { User } from "../entities/User"
import { Product } from "../entities/Product"
import { Purchase } from "../entities/Purchase"
import bcrypt from "bcryptjs"

/**
 * This script seeds the database with initial data
 * Run with: npx ts-node src/scripts/seed-data.ts
 */
async function seedDatabase() {
  console.log("Starting database seeding...")

  try {
    // Initialize database connection
    await AppDataSource.initialize()
    console.log("Database connection established")

    // Clear existing data (optional)
    await AppDataSource.getRepository(Purchase).clear()
    await AppDataSource.getRepository(User).clear()
    await AppDataSource.getRepository(Product).clear()
    console.log("Cleared existing data")

    // Create users
    const userRepository = AppDataSource.getRepository(User)

    // Hash passwords
    const salt = await bcrypt.genSalt(10)
    const password1 = await bcrypt.hash("password123", salt)
    const password2 = await bcrypt.hash("securepass", salt)

    const users = userRepository.create([
      {
        email: "john@example.com",
        password: password1,
        name: "John Doe",
      },
      {
        email: "jane@example.com",
        password: password2,
        name: "Jane Smith",
      },
    ])

    await userRepository.save(users)
    console.log("Created users")

    // Create products
    const productRepository = AppDataSource.getRepository(Product)
    const products = productRepository.create([
      {
        name: "Smartphone",
        description: "Latest model with high-resolution camera",
        price: 799.99,
        stock: 50,
      },
      {
        name: "Laptop",
        description: "Powerful laptop for professionals",
        price: 1299.99,
        stock: 30,
      },
      {
        name: "Headphones",
        description: "Noise-cancelling wireless headphones",
        price: 199.99,
        stock: 100,
      },
    ])

    await productRepository.save(products)
    console.log("Created products")

    // Create some purchases
    const purchaseRepository = AppDataSource.getRepository(Purchase)
    const purchases = purchaseRepository.create([
      {
        userId: users[0].id,
        productId: products[0].id,
        quantity: 1,
        purchasePrice: products[0].price,
        status: "completed",
      },
      {
        userId: users[1].id,
        productId: products[1].id,
        quantity: 1,
        purchasePrice: products[1].price,
        status: "completed",
      },
      {
        userId: users[0].id,
        productId: products[2].id,
        quantity: 2,
        purchasePrice: products[2].price,
        status: "completed",
      },
    ])

    await purchaseRepository.save(purchases)
    console.log("Created purchases")

    // Update product stock based on purchases
    products[0].stock -= 1
    products[1].stock -= 1
    products[2].stock -= 2
    await productRepository.save(products)
    console.log("Updated product stock")

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    // Close the connection
    await AppDataSource.destroy()
    console.log("Database connection closed")
  }
}

// Run the seeding function
seedDatabase()

