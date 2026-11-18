import { Router } from "express";
import prisma from "../config/prisma"

const router = Router();

router.get('/db',async (_req,rest)=>{
    try {
        await prisma.$queryRaw`SELECT 1`;

        rest.status(200).json({success: true, message: "Database Connection sucessful"});

    }
    catch{
        console.error("Database health check failed.")
        rest.status(500).json({
            success: false,
            message: "Database connection failed"
        })
    }
})

export default router;