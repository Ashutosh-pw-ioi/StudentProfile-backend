import { Router } from "express";
import { handleLogin } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/login", handleLogin);

export default authRouter;
