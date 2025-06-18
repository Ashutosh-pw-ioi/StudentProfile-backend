import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "secretkey123";

const createToken = (payload: Record<string, unknown>) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

const checkPassword = async (plain: string, hash: string) =>
  bcrypt.compare(plain, hash);

export const loginStudent = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  if (!email || !password) {
    res.status(400).json({ message: "email and password are required." });
    return;
  }
  //@ts-ignore
  const student = await prisma.student.findUnique({ where: { email } });

  if (!student || !(await checkPassword(password, student.password))) {
    res.status(401).json({ message: "Invalid credentials." });
    return;
  }

  const token = createToken({ id: student.id, type: "STUDENT" });

  res.json({
    token,
    user: { id: student.id, email, type: "STUDENT" },
  });
};

export const loginTeacher = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  const teacher = await prisma.teacher.findUnique({ where: { email } });

  if (!teacher || !(await checkPassword(password, teacher.password))) {
    res.status(401).json({ message: "Invalid credentials." });
    return;
  }

  const token = createToken({ id: teacher.id, type: "TEACHER" });

  res.json({
    token,
    user: { id: teacher.id, email, type: "TEACHER" },
  });
};

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin || !(await checkPassword(password, admin.password))) {
    res.status(401).json({ message: "Invalid credentials." });
    return;
  }

  const token = createToken({ id: admin.id, role: admin.role });

  res.json({
    token,
    user: { id: admin.id, email, role: admin.role },
  });
};
