import express from "express";
const router = express.Router();
import * as users from "../controllers/user.controllers";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";

router.get("/", authenticateUser, users.getUsers);
router.post("/me", users.me);
router.post("/", users.createUser);
router.post("/verify-session", authenticateUser, users.verifySession);
router.patch("/:uid", authenticateAdmin, users.updateUserByAdmin);
router.delete("/:uid", authenticateAdmin, users.deleteUserByAdmin);
// router.get("/:uid",authenticate, users.getUserByUid);
// router.patch("/", authenticate, users.updateUser);
// router.delete("/", authenticate, users.deleteUser);
// router.delete("/multiple", authenticate, users.deleteUsers);

export default router;
