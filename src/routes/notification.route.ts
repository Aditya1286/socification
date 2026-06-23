import { Router } from "express";
import NotificationController from "../controllers/notification.controller.js";
import { verifyServiceToken } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new NotificationController();

// Internal endpoints secured by service token verification
router.post("/create", verifyServiceToken, (req, res, next) => controller.createNotification(req, res, next));
router.post("/message", verifyServiceToken, (req, res, next) => controller.createMessageNotification(req, res, next));
router.post("/read-messages", verifyServiceToken, (req, res, next) => controller.readMessagesNotification(req, res, next));
router.post("/read-all", verifyServiceToken, (req, res, next) => controller.markAllRead(req, res, next));
router.post("/mark-read", verifyServiceToken, (req, res, next) => controller.markRead(req, res, next));
router.post("/delete", verifyServiceToken, (req, res, next) => controller.deleteNotification(req, res, next));

export default router;
