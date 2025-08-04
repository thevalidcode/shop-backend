import express from "express";
import cors from "cors";
import * as admins from "../controllers/admin.controllers";

const router = express.Router();

const openCors = cors({ origin: true, credentials: true });

router.get("/login", openCors, admins.adminLogin);
router.post("/login", openCors, admins.authenticateAdmin);
router.post("/logout", openCors, admins.logoutAdmin);
router.post("/register", openCors, admins.registerAdmin);
router.get("/check-domain/:domain", openCors, admins.checkDomainAvailability);

export default router;