import express from "express";
import "dotenv/config";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import studentRouter from "./routes/student.route.js";
import teacherRouter from "./routes/teacher.route.js";
import marksRouter from "./routes/marks.route.js";
import courseRouter from "./routes/course.route.js";
import batchRouter from "./routes/batch.route.js";
import adminRouter from "./routes/admin.route.js";
import schemaBatchCampRoutes from "./routes/schemaBatchCamp.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/student", studentRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/marks", marksRouter);
app.use("/api/course", courseRouter);
app.use("/api/batch", batchRouter);
app.use("/api/admin", adminRouter);
app.use("/api/schemaBatchCamp", schemaBatchCampRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
