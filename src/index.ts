import express from "express";
import "dotenv/config";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import studentRouter from "./routes/student.route.js";
import teacherRouter from "./routes/teacher.route.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.ORIGIN }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/student", studentRouter);
app.use("/api/teacher", teacherRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
