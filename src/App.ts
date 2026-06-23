import express from "express";
import cors from "cors";
import { createServer, Server as HttpServer } from "http";
import { PORT, CORS_ORIGIN } from "./config/index.js";
import { connectWithMongo } from "./database/index.js";
import { initializeSocket } from "./services/socket.service.js";
import notificationRoutes from "./routes/notification.route.js";

class App {
    public app: express.Application;
    public httpServer: HttpServer;
    public port: number;

    constructor() {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.port = PORT;

        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeDatabase();
        this.initializeSockets();
    }

    private initializeMiddlewares() {
        this.app.use(cors({
            origin: CORS_ORIGIN,
            credentials: true
        }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private initializeRoutes() {
        // Mount all notification routes under /internal/notifications
        this.app.use("/internal/notifications", notificationRoutes);

        // Simple healthcheck route
        this.app.get("/health", (req, res) => {
            res.status(200).json({ status: "healthy", service: "socification" });
        });
    }

    private async initializeDatabase() {
        await connectWithMongo();
    }

    private initializeSockets() {
        initializeSocket(this.httpServer);
    }

    public listen() {
        this.httpServer.listen(this.port, () => {
            console.log(`=================================`);
            console.log(`Socification Service Running on Port ${this.port}`);
            console.log(`=================================`);
        });
    }
}

export default App;
