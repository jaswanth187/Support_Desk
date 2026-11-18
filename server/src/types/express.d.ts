import type { UserRole } from "../../generate/prisma/client";

declare global{
    namespace Express{
        interface UserPayload{
            id: string;
            role: UserRole;
        }

        interface Request{
            user?: UserPayload;
        }
    }
}

export {};