import { type Response, type NextFunction } from "express";
import { verifyToken } from "../../lib/auth/jwt.js";
import type { JwtPayload } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET!;

const controller = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  const decoded = verifyToken(token);

  req.userId = (decoded as JwtPayload).id;

  next();
};

export default controller;
