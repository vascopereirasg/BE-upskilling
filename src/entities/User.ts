import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Purchase } from "./Purchase"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string

  @Column({ type: "varchar", length: 255 })
  password!: string

  @Column({ type: "varchar", length: 255, nullable: true })
  name!: string

  @OneToMany(
    () => Purchase,
    (purchase) => purchase.user,
  )
  purchases!: Purchase[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

