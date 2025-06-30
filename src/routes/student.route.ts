import { Router } from "express";
import {
  getStudentAcademicDetails,
  getStudentDetails,
  getStudentMarksByBatch,
  getStudentMarksByDepartment,
  getStudentsByCenter,
  editStudent,
  deleteStudent,
  addStudent,
} from "../controllers/student.controller.js";
import { authStudent, authAdmin } from "../middlewares/auth.middleware.js";
import { uploadExcel } from "../middlewares/uploadExcel.js";

const studentRouter = Router();

studentRouter.post("/add-student",authAdmin, uploadExcel.single("file"), addStudent);
studentRouter.get("/get-student-profile", authStudent, getStudentDetails);
studentRouter.get("/get-student-academics", authStudent, getStudentAcademicDetails);
studentRouter.get("/get-batch-leaderboard", authStudent, getStudentMarksByBatch);
studentRouter.get("/get-department-leaderboard", authStudent, getStudentMarksByDepartment);

studentRouter.get("/get-center-students", authAdmin, getStudentsByCenter);
studentRouter.put("/edit-student", authAdmin, editStudent);
studentRouter.delete("/delete-student", authAdmin, deleteStudent);

export default studentRouter;