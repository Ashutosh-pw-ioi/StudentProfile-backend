import { Router } from "express";
import { forgetPassword, handleLogin, resetPassword, resetPasswordFirstTime } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/login", handleLogin);
authRouter.post("/forget-password", forgetPassword);
authRouter.post("/reset-password/:id/:token", resetPassword);
authRouter.post("/first-reset-password/:id/:token", resetPasswordFirstTime);

export default authRouter;