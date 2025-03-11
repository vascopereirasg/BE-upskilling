import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm"
  import { Student } from "./Student"
  import { CourseClass } from "./CourseClass"
  
  @Entity("enrollments")
  export class Enrollment {
    @PrimaryGeneratedColumn()
    id!: number
  
    @Column({ type: "int" })
    studentId!: number
  
    @Column({ type: "int" })
    courseClassId!: number
  
    @Column({ type: "date" })
    enrollmentDate!: Date
  
    @Column({ type: "int", nullable: true, default: null })
    evaluationNote!: number // 0-100 percentage
  
    @Column({ type: "varchar", length: 50, default: "enrolled" })
    status!: string // enrolled, completed, dropped, etc.
  
    @ManyToOne(
      () => Student,
      (student) => student.enrollments,
    )
    @JoinColumn({ name: "studentId" })
    student!: Student
  
    @ManyToOne(
      () => CourseClass,
      (courseClass) => courseClass.enrollments,
    )
    @JoinColumn({ name: "courseClassId" })
    courseClass!: CourseClass
  
    @CreateDateColumn()
    createdAt!: Date
  
    @UpdateDateColumn()
    updatedAt!: Date
  }
  
  