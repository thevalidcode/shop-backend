import express from "express";
import * as adminController from "../controllers/admin.controllers";
import { authenticate } from "../middleware/authenticate";
import { isAdmin } from "../middleware/authorize";

const router = express.Router();

// Apply authentication and admin authorization to ALL routes in this file
router.use(authenticate, isAdmin);

router.post("/register", adminController.registerAdmin);
router.get("/check-domain/:domain", adminController.checkDomainAvailability);

// Settings Routes
router.patch("/settings/general", adminController.updateGeneralSettings);
router.patch("/settings/design", adminController.updateDesignSettings);

// Payment Setup Routes
router.get("/payment-gateways", adminController.getPaymentGateways);
router.post("/payment-gateways", adminController.createPaymentGateway);
router.patch("/payment-gateways/:uid", adminController.updatePaymentGateway);
router.delete("/payment-gateways/:uid", adminController.deletePaymentGateway);

// Wallet Management Routes
router.get("/users/:userUid/wallet-history", adminController.getWalletHistory);
router.post("/users/:userUid/wallet/credit", adminController.creditUserWallet);
router.post("/users/:userUid/wallet/debit", adminController.debitUserWallet);

// Referral Management Routes
router.get("/referrals", adminController.getReferrals);

// Contact Message Management
router.get("/contact-messages", adminController.getContactMessages);
router.patch(
  "/contact-messages/:uid",
  adminController.updateContactMessageStatus
);
router.delete("/contact-messages/:uid", adminController.deleteContactMessage);

export default router;
