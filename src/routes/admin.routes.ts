import { Router } from "express";
import {
  attendance,
  courses,
  stats,
  students,
  tutors,
} from "../controllers/admin.controller.js";

const router: Router = Router();

// Stats endpoint
router.get("/stats", stats);

// Students data endpoints
router.get("/students", students);

// Courses endpoint
router.get("/courses", courses);

// Tutors endpoint
router.get("/tutors", tutors);

// Attendance endpoint
router.get("/attendance", attendance);

export default router;
