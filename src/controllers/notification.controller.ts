import { Request, Response, NextFunction } from "express";
import { Notification } from "../models/notification.model.js";
import { io } from "../services/socket.service.js";

class NotificationController {
    // POST /internal/notifications/create
    public async createNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, senderId, senderName, senderAvatar, type, title, message, metadata, entityId, actor } = req.body;

            if (!userId || !type) {
                return res.status(400).json({ message: "userId and type are required" });
            }

            let notif: any;

            if (type === "PLAYLIST_LIKE") {
                if (!actor || !actor.userId || !actor.name) {
                    return res.status(400).json({ message: "actor (userId, name) is required for PLAYLIST_LIKE type" });
                }

                // Check for existing unread playlist like notification
                const existingNotif = await Notification.findOne({
                    userId,
                    type: "PLAYLIST_LIKE",
                    entityId,
                    isRead: false
                });

                if (existingNotif) {
                    // Check if actor is already added
                    const actorExists = existingNotif.actors.some((a: any) => a.userId === actor.userId);
                    if (!actorExists) {
                        existingNotif.actors.push(actor);
                    }
                    
                    const count = existingNotif.actors.length;
                    existingNotif.message = count > 1 
                        ? `${count} people liked your playlist`
                        : `${actor.name} liked your playlist`;
                    
                    existingNotif.createdAt = new Date();
                    notif = await existingNotif.save();
                } else {
                    notif = await Notification.create({
                        userId,
                        type: "PLAYLIST_LIKE",
                        entityId,
                        actors: [actor],
                        title: "Playlist Liked",
                        message: `${actor.name} liked your playlist`,
                        isRead: false
                    });
                }
            } else {
                // Standard notification
                notif = await Notification.create({
                    userId,
                    senderId,
                    senderName,
                    senderAvatar,
                    type,
                    title,
                    message,
                    metadata,
                    isRead: false
                });
            }

            // Fetch current unread count
            const unreadCount = await Notification.countDocuments({ userId, isRead: false });

            // Emit to the user's socket room
            if (io) {
                io.to(`user:${userId}`).emit("notification:new", {
                    notification: notif,
                    unreadCount
                });
            }

            res.status(201).json({ success: true, notification: notif, unreadCount });
        } catch (error) {
            next(error);
        }
    }

    // POST /internal/notifications/message
    public async createMessageNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const { senderId, receiverId, senderName, senderAvatar, message } = req.body;

            if (!senderId || !receiverId) {
                return res.status(400).json({ message: "senderId and receiverId are required" });
            }

            // Check for existing unread messages notification
            let notif = await Notification.findOne({
                userId: receiverId,
                senderId,
                type: "messages",
                isRead: false
            });

            if (notif) {
                notif.message = message;
                notif.title = `New message from ${senderName}`;
                notif.createdAt = new Date();
                await notif.save();
            } else {
                notif = await Notification.create({
                    userId: receiverId,
                    senderId,
                    senderName,
                    senderAvatar,
                    type: "messages",
                    title: `New message from ${senderName}`,
                    message: message,
                    isRead: false
                });
            }

            const unreadCount = await Notification.countDocuments({ userId: receiverId, isRead: false });

            if (io) {
                io.to(`user:${receiverId}`).emit("notification:new", {
                    notification: notif,
                    unreadCount
                });
            }

            res.status(200).json({ success: true, notification: notif, unreadCount });
        } catch (error) {
            next(error);
        }
    }

    // POST /internal/notifications/read-messages
    public async readMessagesNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const { senderId, receiverId } = req.body;

            if (!senderId || !receiverId) {
                return res.status(400).json({ message: "senderId and receiverId are required" });
            }

            await Notification.updateMany(
                { userId: receiverId, senderId, type: "messages", isRead: false },
                { $set: { isRead: true } }
            );

            const unreadCount = await Notification.countDocuments({ userId: receiverId, isRead: false });

            if (io) {
                io.to(`user:${receiverId}`).emit("notification:count-updated", { unreadCount });
            }

            res.status(200).json({ success: true, unreadCount });
        } catch (error) {
            next(error);
        }
    }

    // POST /internal/notifications/read-all
    public async markAllRead(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ message: "userId is required" });
            }

            await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });

            if (io) {
                io.to(`user:${userId}`).emit("notification:count-updated", { unreadCount: 0 });
            }

            res.status(200).json({ success: true, message: "All notifications marked as read." });
        } catch (error) {
            next(error);
        }
    }

    // POST /internal/notifications/mark-read
    public async markRead(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, id } = req.body;

            if (!userId || !id) {
                return res.status(400).json({ message: "userId and id are required" });
            }

            await Notification.findOneAndUpdate({ _id: id, userId }, { $set: { isRead: true } });
            const unreadCount = await Notification.countDocuments({ userId, isRead: false });

            if (io) {
                io.to(`user:${userId}`).emit("notification:read", { notificationId: id, unreadCount });
            }

            res.status(200).json({ success: true, message: "Notification marked as read." });
        } catch (error) {
            next(error);
        }
    }

    // POST /internal/notifications/delete
    public async deleteNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, id } = req.body;

            if (!userId || !id) {
                return res.status(400).json({ message: "userId and id are required" });
            }

            await Notification.findOneAndDelete({ _id: id, userId });
            const unreadCount = await Notification.countDocuments({ userId, isRead: false });

            if (io) {
                io.to(`user:${userId}`).emit("notification:deleted", { notificationId: id, unreadCount });
            }

            res.status(200).json({ success: true, message: "Notification deleted." });
        } catch (error) {
            next(error);
        }
    }
}

export default NotificationController;
