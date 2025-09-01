import express from "express";
import * as cartController from "../controllers/cart.controllers";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

// All cart routes require an authenticated user
router.use(authenticateUser);

router.get("/", cartController.getCart);
router.post("/items", cartController.addItemToCart);
router.patch("/items/:itemId", cartController.updateCartItem);
router.delete("/items/:itemId", cartController.removeItemFromCart);

export default router;
