import express from "express";
import app from "../lib/express.js";
import authControllers from "./auth/auth.controller.js";
import cookieparser from "cookie-parser";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieparser());

app.use("/auth", authControllers);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
