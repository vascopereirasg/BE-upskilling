import { Router } from "express"
import {
  createPurchase,
  getPurchases,
  getPurchaseById,
  getPurchasesByUser,
  updatePurchaseStatus,
} from "../controllers/purchaseController"
import apiKeyMiddleware from "../middlewares/apiKeyMiddleware"

const router = Router()

// All routes protected with API key
router.use(apiKeyMiddleware)

router.post("/", createPurchase)
router.get("/", getPurchases)
router.get("/:id", getPurchaseById)
router.get("/user/:userId", getPurchasesByUser)
router.patch("/:id/status", updatePurchaseStatus)

export default router