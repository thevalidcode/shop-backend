import express from "express";
import * as checkoutController from "../controllers/checkout.controllers";
import { authenticate } from "../middleware/authenticate";
import { isUser } from "../middleware/authorize";

const router = express.Router();

router.post("/", authenticate, isUser, checkoutController.createOrderFromCart);

export default router;