import express from "express";
const router = express.Router();
import * as users from "../controllers/user.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import { userRateLimit, userModifyRateLimit } from "../middleware/ratelimit";

router.get("/", authenticateAdmin, userRateLimit, users.getUsers);
router.post("/me", userRateLimit, users.me);
router.post("/verify-session", userRateLimit, users.verifySession);
router.post("/reset-password", userModifyRateLimit, users.resetPassword);
router.post("/forgot-password", userModifyRateLimit, users.forgotPassword);
router.post("/", userModifyRateLimit, users.createUser);
router.get("/:uid", authenticateUser, userRateLimit, users.getUserByUid);

router.patch("/", authenticateUser, userModifyRateLimit, users.updateUser);
router.post(
	"/api-key/regenerate",
	authenticateUser,
	userModifyRateLimit,
	users.regenerateApiKey,
);
router.patch("/admin", authenticateAdmin, userModifyRateLimit, users.updateUserByAdmin);
router.delete("/", authenticateAdmin, userModifyRateLimit, users.deleteUser);
router.delete("/multiple", authenticateAdmin, userModifyRateLimit, users.deleteUsers);

export default router;
