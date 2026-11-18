import jwt, {type SignOptions} from "jsonwebtoken"
import { randomBytes,createHash } from "node:crypto"

import {env} from"../config/env"

interface TokenUser{
    id: string,
    role: "ADMIN" | "AGENT" | "CUSTOMER";
}

export const generateAccessToken = (user: TokenUser): string=>{
    return jwt.sign(
        {role: user.role},
        env.JWT_ACCESS_SECRET,
        {
            subject: user.id,
            expiresIn: env.ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"],
        }
    )
}

export const generateRefreshToken = (): string => {
  return randomBytes(64).toString("hex");
};

export const hashRefreshToken = (token: string): string => {
  return createHash("sha256")
    .update(token)
    .digest("hex");
};

export const getRefreshTokenExpiry = (): Date => {
  const expiry = new Date();

  expiry.setDate(
    expiry.getDate() + env.REFRESH_TOKEN_EXPIRY_DAYS
  );

  return expiry;
};