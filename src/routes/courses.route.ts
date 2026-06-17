import { Router } from "express";
import {
  assignTutor,
  availableCourses,
  createCourse,
  createTutor,
  enroll,
  studentCourse,
  tutorCourse,
  tutorStudent,
} from "../controllers/courses.controller.js";

const router: Router = Router();

// Create course endpoint
router.post("/create-course", createCourse);

// Create tutor endpoint
router.post("/create-tutor", createTutor);

// Assign tutor endpoint
router.post("/assign-tutor", assignTutor);

// Enroll student endpoint
router.post("/enroll", enroll);

// Tutor course endpoint
router.get("/tutor-course", tutorCourse);

// Available courses endpoint
router.get("/available-courses", availableCourses);

// Student's course endpoint
router.get("/student-course", studentCourse);

// Tutor's students logic
router.get("/tutor-students", tutorStudent);

export default router;
