import express from "express";
import app from "../lib/express.js";
import cookieparser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import coursesRoutes from "./routes/courses.route.js";
import tutorStudents from "./routes/tutor.student.route.js";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieparser());

app.use("/auth", authRoutes);
app.use("/courses", coursesRoutes);
app.use("/tutors-student", tutorStudents);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
