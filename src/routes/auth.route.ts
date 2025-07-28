import { Router } from "express";
import { forgetPassword, handleLogin, resetPassword } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/login", handleLogin);
authRouter.post("/forget-password", forgetPassword);
authRouter.post("/reset-password/:id/:token", resetPassword);

export default authRouter;
