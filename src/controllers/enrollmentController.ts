import type { Request, Response } from "express"
import { AppDataSource } from "../database/data-source"
import { Enrollment } from "../entities/Enrollment"
import { Student } from "../entities/Student"
import { CourseClass } from "../entities/CourseClass"

// Get repositories
const enrollmentRepository = AppDataSource.getRepository(Enrollment)
const studentRepository = AppDataSource.getRepository(Student)
const courseClassRepository = AppDataSource.getRepository(CourseClass)

// Enroll a student in a course class
export const createEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, courseClassId, enrollmentDate, status } = req.body

    // Validate required fields
    if (!studentId || !courseClassId) {
      res.status(400).json({ error: "Student ID and Course Class ID are required" })
      return
    }

    // Check if student exists
    const student = await studentRepository.findOne({ where: { id: studentId } })
    if (!student) {
      res.status(404).json({ error: "Student not found" })
      return
    }

    // Check if course class exists
    const courseClass = await courseClassRepository.findOne({ where: { id: courseClassId } })
    if (!courseClass) {
      res.status(404).json({ error: "Course class not found" })
      return
    }

    // Check if student is already enrolled in this course class
    const existingEnrollment = await enrollmentRepository.findOne({
      where: { studentId, courseClassId },
    })

    if (existingEnrollment) {
      res.status(400).json({ error: "Student is already enrolled in this course class" })
      return
    }

    // Create new enrollment
    const enrollment = enrollmentRepository.create({
      studentId,
      courseClassId,
      enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
      status: status || "enrolled",
    })

    await enrollmentRepository.save(enrollment)

    // Return enrollment with relations
    const savedEnrollment = await enrollmentRepository.findOne({
      where: { id: enrollment.id },
      relations: ["student", "student.user", "courseClass"],
    })

    res.status(201).json({
      message: "Enrollment created successfully",
      enrollment: savedEnrollment,
    })
  } catch (error) {
    console.error("Error creating enrollment:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get all enrollments
export const getEnrollments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const enrollments = await enrollmentRepository.find({
      relations: ["student", "student.user", "courseClass"],
    })
    res.status(200).json(enrollments)
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get an enrollment by ID
export const getEnrollmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const enrollment = await enrollmentRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ["student", "student.user", "courseClass"],
    })

    if (!enrollment) {
      res.status(404).json({ error: "Enrollment not found" })
      return
    }

    res.status(200).json(enrollment)
  } catch (error) {
    console.error("Error fetching enrollment:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Update enrollment status or evaluation note
export const updateEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const enrollment = await enrollmentRepository.findOne({
      where: { id: Number(req.params.id) },
    })

    if (!enrollment) {
      res.status(404).json({ error: "Enrollment not found" })
      return
    }

    // Update status if provided
    if (req.body.status) {
      enrollment.status = req.body.status
    }

    // Update evaluation note if provided
    if (req.body.evaluationNote !== undefined) {
      // Validate evaluation note (0-100)
      const note = Number(req.body.evaluationNote)
      if (isNaN(note) || note < 0 || note > 100) {
        res.status(400).json({ error: "Evaluation note must be between 0 and 100" })
        return
      }

      enrollment.evaluationNote = note
    }

    await enrollmentRepository.save(enrollment)

    // Get updated enrollment with relations
    const updatedEnrollment = await enrollmentRepository.findOne({
      where: { id: enrollment.id },
      relations: ["student", "student.user", "courseClass"],
    })

    res.status(200).json({
      message: "Enrollment updated successfully",
      enrollment: updatedEnrollment,
    })
  } catch (error) {
    console.error("Error updating enrollment:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Delete an enrollment
export const deleteEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await enrollmentRepository.delete(req.params.id)
    if (result.affected === 0) {
      res.status(404).json({ error: "Enrollment not found" })
      return
    }
    res.status(200).json({ message: "Enrollment deleted successfully" })
  } catch (error) {
    console.error("Error deleting enrollment:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get enrollments by student ID
export const getEnrollmentsByStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = Number(req.params.studentId)

    // Check if student exists
    const student = await studentRepository.findOne({ where: { id: studentId } })
    if (!student) {
      res.status(404).json({ error: "Student not found" })
      return
    }

    const enrollments = await enrollmentRepository.find({
      where: { studentId },
      relations: ["courseClass"],
    })

    res.status(200).json(enrollments)
  } catch (error) {
    console.error("Error fetching student enrollments:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get enrollments by course class ID
export const getEnrollmentsByCourseClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseClassId = Number(req.params.courseClassId)

    // Check if course class exists
    const courseClass = await courseClassRepository.findOne({ where: { id: courseClassId } })
    if (!courseClass) {
      res.status(404).json({ error: "Course class not found" })
      return
    }

    const enrollments = await enrollmentRepository.find({
      where: { courseClassId },
      relations: ["student", "student.user"],
    })

    res.status(200).json(enrollments)
  } catch (error) {
    console.error("Error fetching course class enrollments:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

