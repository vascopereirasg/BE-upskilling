import { Router } from "express"
import { createUser, getUsers, getUserById, updateUser, deleteUser } from "../controllers/userController"
import apiKeyMiddleware from "../middlewares/apiKeyMiddleware"

const router = Router()

// All routes protected with API key
router.use(apiKeyMiddleware)

router.post("/", createUser)
router.get("/", getUsers)
router.get("/:id", getUserById)
router.put("/:id", updateUser)
router.delete("/:id", deleteUser)

export default router