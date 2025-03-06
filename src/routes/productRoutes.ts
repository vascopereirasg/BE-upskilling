import { Router, Request, Response } from "express";
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from "../controllers/productController";

const router = Router();

// Explicitly type the request and response
router.post("/", async (req: Request, res: Response) => createProduct(req, res));
router.get("/", async (req: Request, res: Response) => getProducts(req, res));
router.get("/:id", async (req: Request, res: Response) => getProductById(req, res));
router.put("/:id", async (req: Request, res: Response) => updateProduct(req, res));
router.delete("/:id", async (req: Request, res: Response) => deleteProduct(req, res));

export default router;