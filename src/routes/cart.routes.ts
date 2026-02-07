import express from "express";
import * as cartController from "../controllers/cart.controllers";
import { authenticateUser } from "../middleware/auth";
import {
  cartRateLimit,
  cartModifyRateLimit,
} from "../middleware/ratelimit/cart.ratelimit";

const router = express.Router();

// All cart routes require an authenticated user
router.use(authenticateUser);

// GET /cart - View cart (general rate limit)
router.get("/", cartRateLimit, cartController.getCart);

// POST /cart/items - Add item (modify rate limit)
router.post("/items", cartModifyRateLimit, cartController.addItemToCart);

// PATCH /cart/items/:itemId - Update quantity (modify rate limit)
router.patch(
  "/items/:itemId",
  cartModifyRateLimit,
  cartController.updateCartItem
);

// DELETE /cart/items/:itemId - Remove item (modify rate limit)
router.delete(
  "/items/:itemId",
  cartModifyRateLimit,
  cartController.removeItemFromCart
);

export default router;
