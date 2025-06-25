import express from "express";
import "dotenv/config";
import authRouter from "./routes/auth.route.js";
import studentRouter from "./routes/student.route.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/student", studentRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
