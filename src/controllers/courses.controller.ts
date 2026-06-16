import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/auth/password.js";
import { sendLoginDetails } from "../../lib/mail/mail.js";

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
