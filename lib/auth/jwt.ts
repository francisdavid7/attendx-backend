import jwt from "jsonwebtoken";

const JWT_SECRET_KEY = process.env.JWT_SECRET!;

export function generateToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET_KEY);
}
