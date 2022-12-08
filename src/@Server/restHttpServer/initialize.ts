import { Application } from "express";
import { authRouter } from "./routes/auth";

const authRoutes = authRouter;

export const initializeRestRouter = (app: Application) => {
    app.use("/api/auth", authRoutes);
};
