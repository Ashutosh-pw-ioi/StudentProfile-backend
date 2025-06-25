import { Router } from "express";
import { getStudentAcademicDetails, getStudentDetails, getStudentMarksByBatch, getStudentMarksByDepartment } from "../controllers/student.controller.js";
import { authStudent } from "../middlewares/auth.middleware.js";

const studentRouter = Router();

studentRouter.get("/get-student-profile",authStudent, getStudentDetails);
studentRouter.get("/get-student-academics",authStudent, getStudentAcademicDetails);
studentRouter.get("/get-batch-leaderboard",authStudent, getStudentMarksByBatch);
studentRouter.get("/get-department-leaderboard",authStudent, getStudentMarksByDepartment);


export default studentRouter;