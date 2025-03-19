import type { Request, Response } from "express"
import { AppDataSource } from "../database/data-source"
import { CourseClass } from "../entities/CourseClass"

// Get repository
const courseClassRepository = AppDataSource.getRepository(CourseClass)

// Create a new course class
export const createCourseClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, credits, instructor, startDate, endDate, status } = req.body

    // Validate required fields
    if (!name || !credits) {
      res.status(400).json({ error: "Name and credits are required" })
      return
    }

    // Create new course class
    const courseClass = courseClassRepository.create({
      name,
      description,
      credits,
      instructor,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status: status || "active",
    })

    await courseClassRepository.save(courseClass)

    res.status(201).json({
      message: "Course class created successfully",
      courseClass,
    })
  } catch (error) {
    console.error("Error creating course class:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get all course classes
export const getCourseClasses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const courseClasses = await courseClassRepository.find()
    res.status(200).json(courseClasses)
  } catch (error) {
    console.error("Error fetching course classes:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get a course class by ID
export const getCourseClassById = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseClass = await courseClassRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ["enrollments", "enrollments.student", "enrollments.student.user"],
    })

    if (!courseClass) {
      res.status(404).json({ error: "Course class not found" })
      return
    }

    res.status(200).json(courseClass)
  } catch (error) {
    console.error("Error fetching course class:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Update a course class
export const updateCourseClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseClass = await courseClassRepository.findOne({
      where: { id: Number(req.params.id) },
    })

    if (!courseClass) {
      res.status(404).json({ error: "Course class not found" })
      return
    }

    // Update fields
    courseClassRepository.merge(courseClass, req.body)

    // Handle date fields separately
    if (req.body.startDate) courseClass.startDate = new Date(req.body.startDate)
    if (req.body.endDate) courseClass.endDate = new Date(req.body.endDate)

    await courseClassRepository.save(courseClass)

    res.status(200).json({
      message: "Course class updated successfully",
      courseClass,
    })
  } catch (error) {
    console.error("Error updating course class:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Delete a course class
export const deleteCourseClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await courseClassRepository.delete(req.params.id)
    if (result.affected === 0) {
      res.status(404).json({ error: "Course class not found" })
      return
    }
    res.status(200).json({ message: "Course class deleted successfully" })
  } catch (error) {
    console.error("Error deleting course class:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

