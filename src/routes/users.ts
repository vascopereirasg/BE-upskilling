import { Router } from "express"
import { createUser, getUsers, getUserById, updateUser, deleteUser } from "../controllers/userController"
import { authenticateJWT } from "../middlewares/authMiddleware"
import { rateLimit } from "../middlewares/rateLimitMiddleware"

const router = Router()

// Apply rate limiting to all user routes
router.use(rateLimit(60, 60 * 1000)) // 60 requests per minute

// All routes protected with JWT authentication
router.use(authenticateJWT)

router.post("/", createUser)
router.get("/", getUsers)
router.get("/:id", getUserById)
router.put("/:id", updateUser)
router.delete("/:id", deleteUser)

export default router