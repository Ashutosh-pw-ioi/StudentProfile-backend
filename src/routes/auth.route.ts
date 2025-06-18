import { Router } from "express";
import { loginAdmin, loginStudent, loginTeacher } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/student/login", loginStudent);
authRouter.post("/teacher/login", loginTeacher);
authRouter.post("/admin/login", loginAdmin);


export default authRouter;