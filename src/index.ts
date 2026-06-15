import app from "../lib/express.js";
import authControllers from "./auth/auth.controller.js";

const PORT = 8080;

app.use("/auth", authControllers);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
