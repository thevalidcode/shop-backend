import express from "express";
const router = express.Router();
import * as users from "../controllers/user.controllers";
import { authenticate } from "../middleware/authenticate";
import { isAdmin } from "../middleware/authorize";

router.get("/", authenticate, isAdmin, users.getUsers);
router.post("/me", users.me);
router.post("/", users.createUser);
router.post("/verify-session", authenticate, users.verifySession);
// router.get("/:uid",authenticate, users.getUserByUid);
// router.patch("/", authenticate, users.updateUser);
// router.delete("/", authenticate, users.deleteUser);
// router.delete("/multiple", authenticate, users.deleteUsers);

export default router;
