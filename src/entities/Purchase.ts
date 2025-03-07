import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./User"
import { Product } from "./Product"

@Entity("purchases")
export class Purchase {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int" })
  userId!: number

  @Column({ type: "int" })
  productId!: number

  @Column({ type: "int" })
  quantity!: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  purchasePrice!: number

  @Column({ type: "varchar", length: 50, default: "pending" })
  status!: string

  @ManyToOne(
    () => User,
    (user) => user.purchases,
  )
  @JoinColumn({ name: "userId" })
  user!: User

  @ManyToOne(
    () => Product,
    (product) => product.purchases,
  )
  @JoinColumn({ name: "productId" })
  product!: Product

  @CreateDateColumn()
  createdAt!: Date
}

