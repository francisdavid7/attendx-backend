import { Router } from "express";
import {
  createCourse,
  createTutor,
} from "../controllers/courses.controller.js";

const router = Router();

// Create course endpoint
router.post("/create-course", createCourse);

// Create tutor endpoint
router.post("/create-tutor", createTutor);

export default router;
