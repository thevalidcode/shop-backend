import express from "express";
import * as api from "../controllers/api.controllers";
import { apiRequestLimiter } from "../middleware/ratelimit/api.ratelimit";

const router = express.Router();

router.post("/", apiRequestLimiter, api.apiRequests);

export default router;