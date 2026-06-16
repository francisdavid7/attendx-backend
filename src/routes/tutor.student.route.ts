import { Router } from "express";
import type { Request, Response } from "express";
import { verifyToken } from "../../lib/auth/jwt.js";
import { prisma } from "../../lib/prisma.js";

const router = Router();

const tutorStudent = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const decoded = verifyToken(token);

    const userId = typeof decoded === "string" ? decoded : decoded.id;

    const students = await prisma.course.findMany({
      where: {
        tutorId: userId,
      },
      include: {
        students: {
          include: {
            student: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    return res.status(200).json(students);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Message: "Internal Server Error" });
  }
};

router.get("/", tutorStudent);

export default router;
