import { Request, Response, NextFunction } from "express";
import { INTERNAL_SERVICE_TOKEN } from "../config/index.js";

export const verifyServiceToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["x-service-token"];
    if (!token || token !== INTERNAL_SERVICE_TOKEN) {
        return res.status(401).json({ message: "Unauthorized - Invalid or missing service token" });
    }
    next();
};
