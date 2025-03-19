import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm"
import { User } from "./User"

@Entity("credentials")
export class Credentials {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  userId!: number

  @Column({ type: "varchar", length: 255 })
  password!: string

  @OneToOne(
    () => User,
    (user) => user.credentials,
  )
  @JoinColumn({ name: "userId" })
  user!: User
}

