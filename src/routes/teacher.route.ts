import { Router } from "express";
import { authAdmin,authTeacher } from "../middlewares/auth.middleware.js";

import {
  getStudentProfile,
  getTeacherProfile,
  getTeachingDetails,
  getTeachersByCenter,
  updateTeacher,
  deleteTeacher,
  addTeacher,
} from "../controllers/teacher.controller.js";
import { uploadExcel } from "../middlewares/uploadExcel.js";

const teacherRouter = Router();

teacherRouter.post("/add-teacher",authAdmin, uploadExcel.single("file"), addTeacher);
teacherRouter.get("/teacher-profile", authTeacher, getTeacherProfile);
teacherRouter.get("/teacher-academics", authTeacher, getTeachingDetails);
teacherRouter.get("/student-profile/:id", getStudentProfile);

teacherRouter.get("/center-teachers", authAdmin, getTeachersByCenter);
teacherRouter.post("/center-teachers", authAdmin, getTeachersByCenter);
teacherRouter.put("/update-teacher", authAdmin, updateTeacher);
teacherRouter.delete("/delete-teacher", authAdmin, deleteTeacher);

export default teacherRouter;
