import type { Request, Response } from "express"
import { AppDataSource } from "../database/data-source"
import { Student } from "../entities/Student"
import { User } from "../entities/User"

// Get repositories
const studentRepository = AppDataSource.getRepository(Student)
const userRepository = AppDataSource.getRepository(User)

// Create a new student
export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, major, studentId, enrollmentDate, graduationYear } = req.body

    // Check if user exists
    const user = await userRepository.findOne({ where: { id: userId } })
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    // Check if user is already a student
    const existingStudent = await studentRepository.findOne({ where: { userId } })
    if (existingStudent) {
      res.status(400).json({ error: "This user is already registered as a student" })
      return
    }

    // Create new student
    const student = studentRepository.create({
      userId,
      major,
      studentId,
      enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : undefined,
      graduationYear,
    })

    await studentRepository.save(student)

    // Return student with user info
    const savedStudent = await studentRepository.findOne({
      where: { id: student.id },
      relations: ["user"],
    })

    res.status(201).json({
      message: "Student created successfully",
      student: savedStudent,
    })
  } catch (error) {
    console.error("Error creating student:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get all students
export const getStudents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const students = await studentRepository.find({
      relations: ["user"],
    })
    res.status(200).json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get a student by ID
export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await studentRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ["user", "enrollments", "enrollments.courseClass"],
    })

    if (!student) {
      res.status(404).json({ error: "Student not found" })
      return
    }

    res.status(200).json(student)
  } catch (error) {
    console.error("Error fetching student:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get a student by user ID
export const getStudentByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await studentRepository.findOne({
      where: { userId: Number(req.params.userId) },
      relations: ["user", "enrollments", "enrollments.courseClass"],
    })

    if (!student) {
      res.status(404).json({ error: "Student not found for this user" })
      return
    }

    res.status(200).json(student)
  } catch (error) {
    console.error("Error fetching student by user ID:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Update a student
export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await studentRepository.findOne({
      where: { id: Number(req.params.id) },
    })

    if (!student) {
      res.status(404).json({ error: "Student not found" })
      return
    }

    // Update student fields
    if (req.body.major !== undefined) student.major = req.body.major
    if (req.body.studentId !== undefined) student.studentId = req.body.studentId
    if (req.body.enrollmentDate !== undefined) {
      student.enrollmentDate = new Date(req.body.enrollmentDate)
    }
    if (req.body.graduationYear !== undefined) student.graduationYear = req.body.graduationYear

    await studentRepository.save(student)

    // Get updated student with relations
    const updatedStudent = await studentRepository.findOne({
      where: { id: student.id },
      relations: ["user"],
    })

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    })
  } catch (error) {
    console.error("Error updating student:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Delete a student
export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await studentRepository.delete(req.params.id)
    if (result.affected === 0) {
      res.status(404).json({ error: "Student not found" })
      return
    }
    res.status(200).json({ message: "Student deleted successfully" })
  } catch (error) {
    console.error("Error deleting student:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

