import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

// Stats logic
export const stats = async (req: Request, res: Response) => {
  try {
    const totalStudents = await prisma.user.count({
      where: {
        role: "STUDENT",
      },
    });

    const totalTutors = await prisma.user.count({
      where: { role: "TUTOR" },
    });

    const totalCourses = await prisma.course.count();

    const stats = {
      totalStudents,
      totalTutors,
      totalCourses,
    };

    return res.status(200).json({ success: true, stats });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Students stats and data logic
export const students = async (req: Request, res: Response) => {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },

      select: {
        fullName: true,
        email: true,
        studentCourses: {
          select: {
            course: {
              select: {
                name: true,
                tutor: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const studentsData = students.map((student: any) => {
      const course = student.studentCourses.map((cs: any) => cs.course.name);
      const tutor = student.studentCourses.map(
        (cs: any) => cs.course.tutor?.fullName,
      );

      return {
        student: student.fullName,
        email: student.email,
        course: course.length < 1 ? "N/A" : course,
        tutor: tutor.length < 1 ? "N/A" : tutor,
      };
    });
    return res.status(200).json({ studentsData });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Courses logic
export const courses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        tutor: {
          select: {
            fullName: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    const coursesData = courses.map((course: any) => {
      const totalStudents = course._count.students;
      const hasTutor = course.tutor ?? false;
      return {
        courseId: course.id,
        course: course.name,
        tutor: course.tutor?.fullName ?? "No Tutor Assigned",
        totalStudents,
        status: hasTutor ? "Assigned" : "Unassigned",
      };
    });

    return res.status(200).json({ success: true, coursesData });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Tutors logic
export const tutors = async (req: Request, res: Response) => {
  try {
    const tutors = await prisma.user.findMany({
      where: {
        role: "TUTOR",
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        fullName: true,
        email: true,
        courses: {
          select: {
            id: true,
            name: true,

            students: {
              select: {
                studentId: true,
              },
            },
          },
        },
      },
    });

    const coursesAssigned = await prisma.course.count({
      where: {
        tutorId: {
          not: null,
        },
      },
    });

    const tutorData = tutors.map((tutor: any) => {
      // Get students' ID
      const studentIds = tutor.courses.flatMap((course: any) =>
        course.students.map((student: any) => student.studentId),
      );

      // Remove duplicates
      const uniqueStudents = [...new Set(studentIds)];

      const assignedCourses = tutor.courses.map((course: any) => course.name);

      return {
        id: tutor.id,
        fullName: tutor.fullName,
        email: tutor.email,
        assignedCourses,
        totalStudents: uniqueStudents.length,
        status: assignedCourses.length >= 1 ? "Active" : "Inactive",
      };
    });

    return res.status(200).json({ success: true, tutorData, coursesAssigned });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all attendance
export const attendance = async (req: Request, res: Response) => {
  try {
    const attendance = await prisma.attendance.findMany({
      select: {
        session: {
          select: {
            tutor: {
              select: {
                fullName: true,
              },
            },
            course: {
              select: {
                name: true,
              },
            },
            createdAt: true,
            sessionEndAt: true,
          },
        },
      },
    });

    const formattedAttendance = attendance.map((attend: any) => {
      return {
        course: attend.session.course.name,
        tutor: attend.session.tutor?.fullName,
        startedAt: attend.session.createdAt,
        endedAt: attend.session.sessionEndAt,
      };
    });

    return res.status(200).json({ formattedAttendance });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
