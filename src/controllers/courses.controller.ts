import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/auth/password.js";
import { sendLoginDetails } from "../../lib/mail/mail.js";
import { verifyToken } from "../../lib/auth/jwt.js";
import type { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
  id: string;
}

// Create course logic
export const createCourse = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const { name, description } = body;

    const course = await prisma.course.create({
      data: {
        name,
        description,
      },
    });

    return res.status(201).json({
      success: true,
      message: `The course with the id: ${course.id.split("-").join("")} has been created!`,
      course,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Create tutor logic
export const createTutor = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const { fullName, email, password } = body;

    const hashedPassword = await hashPassword(password);

    // Check if tutor already exist
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Tutor already exist" });
    }

    const tutor = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: "TUTOR",
        isVerified: true,
      },
    });

    const tutorName = fullName?.split(" ")[0];
    await sendLoginDetails(tutorName, tutor.email, password);

    return res.status(201).json({ success: true, tutor });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Assign tutor logic
export const assignTutor = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { courseId, tutorId } = body;

    await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        tutorId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Tutor assigned to course successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
};

// Enroll student to course logic
export const enroll = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { courseId } = body;
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const decoded = verifyToken(token);

    if (typeof decoded === "string") {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const userId = decoded.id;

    const enrolledCourse = await prisma.studentCourse.create({
      data: {
        studentId: userId,
        courseId,
      },
    });

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isEnrolled: true,
      },
    });

    return res.status(200).json({ enrolledCourse });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Tutor course logic
export const tutorCourse = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const decoded = verifyToken(token);

    // Guard clause against strings or empty payloads
    if (!decoded || typeof decoded === "string") {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // Explicit type casting so TypeScript recognizes .id safely
    const userId = (decoded as CustomJwtPayload).id;

    // Fetch the courses
    const coursesRaw = await prisma.course.findMany({
      where: {
        tutorId: userId,
      },
      select: {
        name: true,
      },
    });

    // Flatten the array of objects into an array of pure strings
    const courseNames = coursesRaw.map((course: any) => course.name);

    return res.status(200).json({ courses: courseNames });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Available courses logic
export const availableCourses = async (req: Request, res: Response) => {
  try {
    const availableCourses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        tutor: {
          select: {
            fullName: true,
          },
        },
      },
    });
    return res.status(200).json({ success: true, availableCourses });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Student's course logic
export const studentCourse = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const decoded = verifyToken(token);

    const userId = typeof decoded === "string" ? decoded : decoded.id;

    const course = await prisma.studentCourse.findMany({
      where: { studentId: userId },
      include: {
        course: {
          select: {
            name: true,
          },
        },
      },
    });

    return res.status(200).json(course);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
