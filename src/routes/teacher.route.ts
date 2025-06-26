import { Router } from "express";
import { authTeacher } from "../middlewares/auth.middleware.js";
import { getStudentProfile, getTeacherProfile, getTeachingDetails } from "../controllers/teacher.controller.js";

const teacherRouter = Router();

teacherRouter.get("/teacher-profile",authTeacher,getTeacherProfile );
teacherRouter.get("/teacher-academics",authTeacher,getTeachingDetails );
teacherRouter.get("/student-profile",authTeacher,getStudentProfile );


export default teacherRouter;