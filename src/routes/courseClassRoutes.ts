import { Router } from "express"
import {
  createCourseClass,
  getCourseClasses,
  getCourseClassById,
  updateCourseClass,
  deleteCourseClass,
} from "../controllers/courseClassController"
import apiKeyMiddleware from "../middlewares/apiKeyMiddleware"

const router = Router()

// All routes protected with API key
router.use(apiKeyMiddleware)

router.post("/", createCourseClass)
router.get("/", getCourseClasses)
router.get("/:id", getCourseClassById)
router.put("/:id", updateCourseClass)
router.delete("/:id", deleteCourseClass)

export default router

