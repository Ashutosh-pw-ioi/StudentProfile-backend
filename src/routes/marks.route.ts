import express from "express";
import {
  addStudentMarks,
  getCourseScoresByCenter,
  editCourseScore,
  deleteCourseScore,
} from "../controllers/marks.controller.js";
import { uploadExcel } from "../middlewares/uploadExcel.js";
import { authAdmin, authTeacher } from "../middlewares/auth.middleware.js";

const marksRouter = express.Router();

marksRouter.post("/upload-marks",authTeacher, uploadExcel.single("file"), addStudentMarks);
marksRouter.get("/center-scores",authAdmin, getCourseScoresByCenter);
marksRouter.put("/edit-score",authAdmin, editCourseScore);
marksRouter.delete("/delete-score",authAdmin, deleteCourseScore);

export default marksRouter;
