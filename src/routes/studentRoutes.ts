import { Router } from "express"
import {
  createStudent,
  getStudents,
  getStudentById,
  getStudentByUserId,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController"
import apiKeyMiddleware from "../middlewares/apiKeyMiddleware"

const router = Router()

// All routes protected with API key
router.use(apiKeyMiddleware)

router.post("/", createStudent)
router.get("/", getStudents)
router.get("/:id", getStudentById)
router.get("/user/:userId", getStudentByUserId)
router.put("/:id", updateStudent)
router.delete("/:id", deleteStudent)

export default router

