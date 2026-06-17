import { Router } from "express";
import {
  attendanceList,
  createSession,
  endSession,
  getTutorSession,
  getTutorStudentsAttendance,
  markAttendance,
  schedulePage,
  studentAttendance,
} from "../controllers/attendance.controller.js";

const router: Router = Router();

// Create session enpdpoint
router.post("/create-session", createSession);

// Get session endpoint
router.get("/get-session", getTutorSession);

// End session endpoint
router.post("/end-session", endSession);

// Tutor's students attendance endpoint
router.get("/tutor-attendance", getTutorStudentsAttendance);

// Mark attendance endpoint
router.post("/mark-attendance", markAttendance);

// Student's attendance endpoint
router.get("/student-attendance", studentAttendance);

// Attendance list endpoint
router.post("/attendance-list", attendanceList);

// Schedule endpoint
router.get("schedule", schedulePage);

export default router;
