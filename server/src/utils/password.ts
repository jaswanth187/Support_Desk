import bcrypt from "bcryptjs"
import { setDefaultHighWaterMark } from "node:stream";

const SALT_ROUNDS = 12;

export const hashPassword = async (
    password: string
): Promise<string>=>{
    return bcrypt.hash(password,SALT_ROUNDS)
}

export const comparePassword = async (password: string,hashPassword: string):Promise<boolean>=>{
    return bcrypt.compare(password, hashPassword)
}