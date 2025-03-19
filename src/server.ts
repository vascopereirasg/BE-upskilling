import express from "express"
import dotenv from "dotenv"
import { Pool } from "pg"
import todoRoutes from "./routes/todos"
import userRoutes from "./routes/userRoutes"
import authRoutes from "./routes/authRoutes"
import errorHandler from "./middlewares/errorHandler"
import loggerMiddleware from "./middlewares/logger"
import { AppDataSource } from "./database/data-source"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// PostgreSQL Database Connection
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "postgres",
  user: process.env.DB_USER || "myuser",
  password: process.env.DB_PASSWORD || "mypassword",
})

// Initialize TypeORM connection
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!")
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error)
  })

// Middleware to parse JSON requests
app.use(express.json())

// Request Logging Middleware
app.use(loggerMiddleware)

// Routes
app.use("/api/todos", todoRoutes)
app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)

// Error Handling Middleware
app.use(errorHandler)

// Start the Server
app.listen(PORT, async () => {
  try {
    await pool.query("SELECT 1") // Test database connection
    console.log(`Server running on http://localhost:${PORT}`)
  } catch (error) {
    console.error("Database connection failed:", error)
  }
})

export { pool }

