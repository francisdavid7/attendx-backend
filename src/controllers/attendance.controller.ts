import type { Request, Response } from "express";
import { verifyToken } from "../../lib/auth/jwt.js";
import { prisma } from "../../lib/prisma.js";

// Create session logic
export const createSession = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { courseId } = body;
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const decoded = verifyToken(token);

    const userId = typeof decoded === "string" ? decoded : decoded.id;

    const findCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!findCourse) {
      return res.status(404).json({ Massage: "Course Not found" });
    }

    const sessions = await prisma.session.create({
      data: {
        courseId,
        userId: userId,
        date: new Date(),
        qrCode: crypto.randomUUID(),
        qrExpiresAt: new Date(Date.now() + 120 * 60 * 1000),
        sessionEndAt: new Date(Date.now() + 120 * 60 * 1000),
        isActive: true,
      },
      include: {
        course: true,
      },
    });

    const session = await prisma.session.findFirst({
      where: { courseId: sessions?.courseId, isActive: true },
      include: {
        course: {
          select: {
            name: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json({ Message: "Session Created", session: session });
  } catch (error: any) {
    console.log("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get tutor session logic
export const getTutorSession = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const decoded = verifyToken(token);
    const tutorId = typeof decoded === "string" ? decoded : decoded.id;

    const tutor = await prisma.user.findUnique({
      where: { id: tutorId },
      include: {
        courses: {
          select: {
            name: true,
            tutorId: true,
            id: true,
          },
        },
      },
    });

    const tutorActiveSession = await prisma.session.findFirst({
      where: {
        courseId: tutor?.courses[0]?.id as string,
        userId: tutorId,
        isActive: true,
      },
      include: {
        course: {
          select: {
            name: true,
          },
        },
      },
    });

    return res.status(200).json({ tutorActiveSession });
  } catch (error: any) {
    console.log("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// End session logic
export const endSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ Message: "Unauthorized" });
    }

    const decoded = verifyToken(token);
    const userId = typeof decoded === "string" ? decoded : decoded.id;

    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: userId,
      },
    });

    if (!session) {
      return res
        .status(404)
        .json({ Message: "Session not found or not yours" });
    }

    const endedSession = await prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        isActive: false,
        sessionEndAt: new Date(),
      },
    });

    return res.status(200).json({
      Message: "Session ended successfully",
      sessionEndS: endedSession,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Mark student's attendance logic
export const markAttendance = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { id, qrCode } = body;

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }
    const decoded = verifyToken(token);
    const studentId = typeof decoded === "string" ? decoded : decoded.id;

    const studentExist = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!studentExist)
      return res.status(404).json({ Message: "User not found" });

    const session = await prisma.session.findUnique({
      where: { id: id, qrCode: qrCode },
    });

    if (!session) return res.status(422).json({ Message: "Invalid QrCode" });

    if (session.qrExpiresAt >= session?.sessionEndAt!)
      return res.status(401).json({ Message: "Attendance closed" });

    const existing = await prisma.attendance.findUnique({
      where: {
        studentId_sessionId: {
          studentId,
          sessionId: session.id,
        },
      },
    });

    if (existing)
      return res.status(409).json({ Message: "Attendance Already marked " });

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        sessionId: session.id,
        status: "PRESENT",
        checkInTime: new Date(),
      },
    });

    return res
      .status(200)
      .json({ Message: `Session marked successfully`, attendance });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get tutor's students attendance logic
export const getTutorStudentsAttendance = async (
  req: Request,
  res: Response,
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const decoded = verifyToken(token);

    const userId = typeof decoded === "string" ? decoded : decoded.id;

    const histories = await prisma.session.findMany({
      where: {
        userId,
      },
      include: {
        course: true,
        attendances: {
          include: {
            student: true,
          },
        },
      },
    });

    const attendanceCount = await prisma.attendance.count({
      where: {
        session: {
          userId,
        },
      },
    });

    return res.status(200).json({ histories, attendanceCount });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get student's attendance
export const studentAttendance = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const decoded = verifyToken(token);

    const studentId = typeof decoded === "string" ? decoded : decoded.id;

    const student = await prisma.user.findUnique({
      where: {
        id: studentId,
      },
      include: {
        attendances: {
          include: {
            session: {
              include: {
                course: true,
              },
            },
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });
    return res.status(200).json(student);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Message: "Internal Server Error" });
  }
};

// Attendance list
export const attendanceList = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { sessionId } = body;

    const totalAttendance = await prisma.attendance.count({
      where: {
        sessionId: sessionId,
      },
    });

    const studentsAttended = await prisma.attendance.findMany({
      where: { sessionId: sessionId },
      include: { student: true },
    });

    return res
      .status(200)
      .json({ Message: "AttendanceList", studentsAttended, totalAttendance });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Schedule page
export const schedulePage = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const decoded = verifyToken(token);

    const userId = typeof decoded === "string" ? decoded : decoded.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentCourses: {
          select: {
            courseId: true,
          },
        },
      },
    });

    const activeSession = await prisma.session.findFirst({
      where: {
        courseId: user?.studentCourses[0]?.courseId as string,
        isActive: true,
        sessionEndAt: {
          gt: new Date(),
        },
      },
      include: {
        course: true,
        tutor: true,
      },
    });

    return res.status(200).json({
      hasActiveSession: !!activeSession,
      session: activeSession,
      user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};
