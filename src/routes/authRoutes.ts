import { Router } from "express"
import { loginUser, refreshToken, logout, changePassword, getCurrentUser } from "../controllers/authController"
import { authenticateJWT } from "../middlewares/authMiddleware"
import { authRateLimit } from "../middlewares/rateLimitMiddleware"

const router = Router()

// Public routes with rate limiting for security
router.post("/login", authRateLimit, loginUser)
router.post("/refresh-token", authRateLimit, refreshToken)
router.post("/logout", logout)

// Protected routes
router.get("/me", authenticateJWT, getCurrentUser)
router.post("/change-password", authenticateJWT, changePassword)

export default router