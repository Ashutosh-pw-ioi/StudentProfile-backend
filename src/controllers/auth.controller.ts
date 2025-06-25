import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "secretkey123";

const createToken = (payload: object) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

export const handleLogin = async (req: Request, res: Response) => {
  const { email, password, role } = req.body as {
    email: string;
    password: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
  };
  if (!email || !password || !role) {
    res
      .status(400)
      .json({ message: "Email, password, and role are required." });
    return;
  }

  let user: any;
  const roleUpper = role.toUpperCase();

  switch (roleUpper) {
    case "STUDENT":
      user = await prisma.student.findUnique({ where: { email } });
      break;
    case "TEACHER":
      user = await prisma.teacher.findUnique({ where: { email } });
      break;
    case "ADMIN":
      user = await prisma.admin.findUnique({ where: { email } });
      break;
    default:
      res.status(400).json({ message: "Invalid role." });
      return;
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "Invalid credentials." });
    return;
  }

  const tokenPayload =
    roleUpper === "ADMIN"
      ? { id: user.id, role: user.role }
      : { id: user.id, role: roleUpper };

  const token = createToken(tokenPayload);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: tokenPayload.role,
    },
  });
};