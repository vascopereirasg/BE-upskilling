import express, { type Express } from "express"
import dotenv from "dotenv"
import { Pool } from "pg"
import cors from "cors"
import helmet from "helmet"
import todoRoutes from "./routes/todos"
import userRoutes from "./routes/userRoutes"
import authRoutes from "./routes/authRoutes"
import studentRoutes from "./routes/studentRoutes"
import courseClassRoutes from "./routes/courseClassRoutes"
import enrollmentRoutes from "./routes/enrollmentRoutes"
import { AppDataSource } from "./database/data-source"
import errorHandler from "./middlewares/errorHandler"
import loggerMiddleware from "./middlewares/logger"
import { rateLimit } from "./middlewares/rateLimitMiddleware"

// Load environment variables
dotenv.config()

const app: Express = express()
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

// Security middleware
app.use(helmet()) // Set security HTTP headers
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // In production, set this to your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Global rate limiting
app.use(rateLimit(100, 15 * 60 * 1000)) // 100 requests per 15 minutes

// Middleware to parse JSON requests
app.use(express.json({ limit: "10kb" })) // Limit body size

// Request Logging Middleware
app.use(loggerMiddleware)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/course-classes", courseClassRoutes)
app.use("/api/enrollments", enrollmentRoutes)
app.use("/api/todos", todoRoutes) // Consider securing this route too

// Error Handling Middleware
app.use(errorHandler)

// Start the Server
app.listen(PORT, async () => {
  try {
    await pool.query("SELECT 1") // Test database connection
    console.log(`Server running on http://localhost:${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`)

    // Security warning for development
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "your-secret-key-change-in-production") {
      console.warn(
        "\x1b[33m%s\x1b[0m",
        "Warning: Using default JWT secret. Set JWT_SECRET environment variable in production!",
      )
    }
  } catch (error) {
    console.error("Database connection failed:", error)
  }
})

export { pool }

