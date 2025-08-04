import express from "express";
import * as cartController from "../controllers/cart.controllers";
import { authenticate } from "../middleware/authenticate";
import { isUser } from "../middleware/authorize";

const router = express.Router();

// All cart routes require an authenticated user
router.use(authenticate, isUser);

router.get("/", cartController.getCart);
router.post("/items", cartController.addItemToCart);
router.patch("/items/:itemId", cartController.updateCartItem);
router.delete("/items/:itemId", cartController.removeItemFromCart);

export default router;