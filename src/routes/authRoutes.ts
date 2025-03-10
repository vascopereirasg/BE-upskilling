import { Router } from "express"
import { loginUser, changePassword } from "../controllers/authController"
import apiKeyMiddleware from "../middlewares/apiKeyMiddleware"

const router = Router()

// Login route (protected with API key)
router.post("/login", apiKeyMiddleware, loginUser)

// Change password route (protected with API key)
router.post("/change-password/:id", apiKeyMiddleware, changePassword)

export default router

