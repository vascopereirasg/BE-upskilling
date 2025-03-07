import { Router } from "express"
import { createUser, getUsers, getUserById, updateUser, deleteUser, loginUser } from "../controllers/userController"
import apiKeyMiddleware from "../middlewares/apiKeyMiddleware"

const router = Router()

// Public routes
router.post("/login", loginUser)

// Protected routes
router.post("/", apiKeyMiddleware, createUser)
router.get("/", apiKeyMiddleware, getUsers)
router.get("/:id", apiKeyMiddleware, getUserById)
router.put("/:id", apiKeyMiddleware, updateUser)
router.delete("/:id", apiKeyMiddleware, deleteUser)

export default router