import express from "express";
import * as checkoutController from "../controllers/checkout.controllers";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

router.post("/", authenticateUser, checkoutController.createOrderFromCart);

export default router;
