import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Purchase } from "./Purchase"

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", length: 255 })
  name!: string

  @Column({ type: "text", nullable: true })
  description!: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number

  @Column({ type: "int", default: 0 })
  stock!: number

  @OneToMany(
    () => Purchase,
    (purchase) => purchase.product,
  )
  purchases!: Purchase[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}