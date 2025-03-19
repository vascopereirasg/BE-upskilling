import { Router } from "express"
import {
  createEnrollment,
  getEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment,
  getEnrollmentsByStudent,
  getEnrollmentsByCourseClass,
} from "../controllers/enrollmentController"
import apiKeyMiddleware from "../middlewares/apiKeyMiddleware"

const router = Router()

// All routes protected with API key
router.use(apiKeyMiddleware)

router.post("/", createEnrollment)
router.get("/", getEnrollments)
router.get("/:id", getEnrollmentById)
router.put("/:id", updateEnrollment)
router.delete("/:id", deleteEnrollment)
router.get("/student/:studentId", getEnrollmentsByStudent)
router.get("/course-class/:courseClassId", getEnrollmentsByCourseClass)

export default router

