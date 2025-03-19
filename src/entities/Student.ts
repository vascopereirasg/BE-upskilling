import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm"
  import { User } from "./User"
  import { Enrollment } from "./Enrollment"
  
  @Entity("students")
  export class Student {
    @PrimaryGeneratedColumn()
    id!: number
  
    @Column({ type: "int" })
    userId!: number
  
    @Column({ type: "varchar", length: 255, nullable: true })
    major!: string
  
    @Column({ type: "varchar", length: 255, nullable: true })
    studentId!: string // Like a student number/ID card
  
    @Column({ type: "date", nullable: true })
    enrollmentDate!: Date
  
    @Column({ type: "int", nullable: true })
    graduationYear!: number
  
    @OneToOne(() => User)
    @JoinColumn({ name: "userId" })
    user!: User
  
    @OneToMany(
      () => Enrollment,
      (enrollment) => enrollment.student,
    )
    enrollments!: Enrollment[]
  
    @CreateDateColumn()
    createdAt!: Date
  
    @UpdateDateColumn()
    updatedAt!: Date
  }
  
  