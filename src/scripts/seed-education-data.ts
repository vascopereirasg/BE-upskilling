import { AppDataSource } from "../database/data-source"
import { User } from "../entities/User"
import { Credentials } from "../entities/Credentials"
import { Student } from "../entities/Student"
import { CourseClass } from "../entities/CourseClass"
import { Enrollment } from "../entities/Enrollment"
import bcrypt from "bcryptjs"

/**
 * This script seeds the database with initial education data
 * Run with: npx ts-node src/scripts/seed-education-data.ts
 */
async function seedEducationData() {
  console.log("Starting education data seeding...")

  try {
    // Initialize database connection
    await AppDataSource.initialize()
    console.log("Database connection established")

    // Use raw SQL with CASCADE to truncate tables properly
    console.log("Clearing existing data...")
    await AppDataSource.query(
      'TRUNCATE TABLE "enrollments", "course_classes", "students", "credentials", "users" CASCADE',
    )
    console.log("Tables truncated successfully")

    // Create users and credentials
    const userRepository = AppDataSource.getRepository(User)
    const credentialsRepository = AppDataSource.getRepository(Credentials)
    const studentRepository = AppDataSource.getRepository(Student)
    const courseClassRepository = AppDataSource.getRepository(CourseClass)
    const enrollmentRepository = AppDataSource.getRepository(Enrollment)

    // Create users
    const users = userRepository.create([
      {
        email: "john@example.com",
        name: "John Doe",
      },
      {
        email: "jane@example.com",
        name: "Jane Smith",
      },
      {
        email: "bob@example.com",
        name: "Bob Johnson",
      },
      {
        email: "alice@example.com",
        name: "Alice Williams",
      },
    ])

    await userRepository.save(users)
    console.log("Created users")

    // Hash passwords
    const salt = await bcrypt.genSalt(10)
    const password = await bcrypt.hash("password123", salt)

    // Create credentials
    const credentials = credentialsRepository.create(
      users.map((user) => ({
        userId: user.id,
        password,
      })),
    )

    await credentialsRepository.save(credentials)
    console.log("Created credentials")

    // Create students
    const students = studentRepository.create([
      {
        userId: users[0].id,
        major: "Computer Science",
        studentId: "CS001",
        enrollmentDate: new Date("2023-09-01"),
        graduationYear: 2027,
      },
      {
        userId: users[1].id,
        major: "Mathematics",
        studentId: "MATH002",
        enrollmentDate: new Date("2023-09-01"),
        graduationYear: 2027,
      },
      {
        userId: users[2].id,
        major: "Physics",
        studentId: "PHYS003",
        enrollmentDate: new Date("2022-09-01"),
        graduationYear: 2026,
      },
    ])

    await studentRepository.save(students)
    console.log("Created students")

    // Create course classes
    const courseClasses = courseClassRepository.create([
      {
        name: "Introduction to Programming",
        description: "Basic programming concepts using Python",
        credits: 3,
        instructor: "Dr. Smith",
        startDate: new Date("2023-09-01"),
        endDate: new Date("2023-12-15"),
        status: "active",
      },
      {
        name: "Data Structures and Algorithms",
        description: "Advanced data structures and algorithm analysis",
        credits: 4,
        instructor: "Dr. Johnson",
        startDate: new Date("2023-09-01"),
        endDate: new Date("2023-12-15"),
        status: "active",
      },
      {
        name: "Calculus I",
        description: "Introduction to differential and integral calculus",
        credits: 4,
        instructor: "Dr. Williams",
        startDate: new Date("2023-09-01"),
        endDate: new Date("2023-12-15"),
        status: "active",
      },
      {
        name: "Physics 101",
        description: "Introduction to classical mechanics",
        credits: 4,
        instructor: "Dr. Brown",
        startDate: new Date("2023-09-01"),
        endDate: new Date("2023-12-15"),
        status: "active",
      },
    ])

    await courseClassRepository.save(courseClasses)
    console.log("Created course classes")

    // Create enrollments
    const enrollments = enrollmentRepository.create([
      {
        studentId: students[0].id,
        courseClassId: courseClasses[0].id,
        enrollmentDate: new Date("2023-08-15"),
        evaluationNote: 85,
        status: "completed",
      },
      {
        studentId: students[0].id,
        courseClassId: courseClasses[1].id,
        enrollmentDate: new Date("2023-08-15"),
        evaluationNote: 92,
        status: "completed",
      },
      {
        studentId: students[1].id,
        courseClassId: courseClasses[2].id,
        enrollmentDate: new Date("2023-08-15"),
        evaluationNote: 88,
        status: "completed",
      },
      {
        studentId: students[1].id,
        courseClassId: courseClasses[0].id,
        enrollmentDate: new Date("2023-08-15"),
        evaluationNote: 79,
        status: "completed",
      },
      {
        studentId: students[2].id,
        courseClassId: courseClasses[3].id,
        enrollmentDate: new Date("2023-08-15"),
        evaluationNote: 95,
        status: "completed",
      },
      {
        studentId: students[2].id,
        courseClassId: courseClasses[2].id,
        enrollmentDate: new Date("2023-08-15"),
        evaluationNote: 91,
        status: "completed",
      },
    ])

    await enrollmentRepository.save(enrollments)
    console.log("Created enrollments")

    console.log("Education data seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding education data:", error)
  } finally {
    // Close the connection
    await AppDataSource.destroy()
    console.log("Database connection closed")
  }
}

// Run the seeding function
seedEducationData()

