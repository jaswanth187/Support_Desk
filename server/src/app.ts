import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes"
import cookieParser from "cookie-parser";
import {env} from "./config/env"
import authRoutes from "./routes/auth.routes"
import { errorMiddlware } from "./middlewares/error.middleware";
import protectedRoutes from "./routes/protected.routes.js";
import ticketRoutes from "./routes/ticket.routes"
import dashboardRoutes from "./routes/dashboard.routes"
import agentRoutes from "./routes/agent.routes.js";
// import "dotenv/config"
const app = express();
app.set("trust proxy", 1);
app.use(cors({
    origin: new URL(env.CLIENT_URL).origin,
    credentials: true,
}))



app.use(express.json());

app.use(cookieParser());

app.get("/api/health",(_req,res)=>{
    res.status(200).json({
        success: true,
        message: "SupportDesk API is running",
    })
})



app.use("/api/health",healthRoutes)
app.use('/api/auth',authRoutes)
app.use("/api", protectedRoutes);
app.use("/api/tickets",ticketRoutes);
app.use('/api/dashboard',dashboardRoutes)
app.use("/api/agents",agentRoutes);
app.use(errorMiddlware)
export default app;