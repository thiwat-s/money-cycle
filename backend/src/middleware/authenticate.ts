import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { config } from "../config.js";

export type AuthenticatedRequest = Request & {
  userId: Types.ObjectId;
};

type JwtPayload = {
  sub: string;
};

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = req.cookies?.token ?? (header?.startsWith("Bearer ") ? header.slice(7) : undefined);

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    (req as AuthenticatedRequest).userId = new Types.ObjectId(payload.sub);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

export function getUserId(req: Request) {
  return (req as AuthenticatedRequest).userId;
}
