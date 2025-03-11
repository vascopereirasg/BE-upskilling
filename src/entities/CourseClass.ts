import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { Enrollment } from "./Enrollment"

@Entity("course_classes")
export class CourseClass {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", length: 255 })
  name!: string

  @Column({ type: "text", nullable: true })
  description!: string

  @Column({ type: "int" })
  credits!: number

  @Column({ type: "varchar", length: 255, nullable: true })
  instructor!: string

  @Column({ type: "date", nullable: true })
  startDate!: Date

  @Column({ type: "date", nullable: true })
  endDate!: Date

  @Column({ type: "varchar", length: 50, default: "active" })
  status!: string

  @OneToMany(
    () => Enrollment,
    (enrollment) => enrollment.courseClass,
  )
  enrollments!: Enrollment[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

