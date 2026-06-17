import express from "express";
import app from "../lib/express.js";
import cookieparser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import coursesRoutes from "./routes/courses.route.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import addminRoutes from "./routes/admin.routes.js";
import swaggerUi from "swagger-ui-express";
import cors from "cors";

import { swaggerSpec } from "./docs/swagger.js";

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieparser());
app.use("api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", coursesRoutes);
app.use("/api/v1/session", attendanceRoutes);
app.use("/api/v1/admin", addminRoutes);

const PORT = 8080;
app.listen(PORT);
