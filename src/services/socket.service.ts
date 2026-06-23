import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import { CORS_ORIGIN } from "../config/index.js";

export let io: SocketIOServer;
export const userSockets = new Map<string, string>(); // tracks online status { userId: socketId }

export const initializeSocket = (server: Server) => {
    io = new SocketIOServer(server, {
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes window for reconnect state recovery
            skipMiddlewares: true,
        },
        cors: {
            origin: CORS_ORIGIN,
            credentials: true,
        },
    });

    console.log(`[Socket] Socket.io server initialized with allowed origins:`, CORS_ORIGIN);

    io.on("connection", (socket) => {
        const userId = socket.handshake.auth?.userId;
        if (userId) {
            socket.join(`user:${userId}`);
            userSockets.set(userId, socket.id);
            console.log(`[Socket] User ${userId} auto-joined room: user:${userId}`);
        }

        socket.on("user_connected", (userId) => {
            if (userId) {
                socket.join(`user:${userId}`);
                userSockets.set(userId, socket.id);
                console.log(`[Socket] User ${userId} joined room: user:${userId}`);
                
                // Broadcast to other users that this user is online
                io.emit("user_connected", userId);
                
                // Send back list of all online users to this socket
                socket.emit("users_online", Array.from(userSockets.keys()));
            }
        });

        socket.on("disconnect", () => {
            let disconnectedUserId;
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    userSockets.delete(userId);
                    break;
                }
            }
            if (disconnectedUserId) {
                console.log(`[Socket] User ${disconnectedUserId} disconnected`);
                io.emit("user_disconnected", disconnectedUserId);
            }
        });
    });
};
