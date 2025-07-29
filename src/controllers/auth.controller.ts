import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET ?? "secretkey123";

interface JwtPayload {
  id: string;
  role: string;
}

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
      firstLoggedIn: user.firstLoggedIn
    },
  });
  return;
};

export const forgetPassword = async (req: Request, res: Response) => {
  const { email, role } = req.body;

  if (!email || !role) {
    res.status(400).json({ message: "Email and role are required." });
    return;
  }

  try {
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

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const token = createToken({ id: user.id, role: roleUpper });
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${user.id}/${token}`;

    const { error } = await resend.emails.send({
      from: "noreply@resend.dev",
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>Hello ${user.name ?? ""},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      res.status(500).json({ message: "Failed to send reset email." });
      return;
    }

    res.status(200).json({
      status: "Success",
      message: "Reset Password link sent to your email.",
    });
    return;
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { id, token } = req.params;
  const { password } = req.body;

  if (!token || !id || !password) {
    res.status(400).json({ message: "Token, ID, and password are required." });
    return;
  }

  let decodedToken: JwtPayload;
  try {
    decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
    return;
  }

  try {
    let user: any;
    const userRole = decodedToken.role;

    switch (userRole) {
      case "STUDENT":
        user = await prisma.student.findUnique({ where: { id } });
        break;
      case "TEACHER":
        user = await prisma.teacher.findUnique({ where: { id } });
        break;
      case "ADMIN":
        user = await prisma.admin.findUnique({ where: { id } });
        break;
      default:
        res.status(400).json({ message: "Invalid role in token." });
        return;
    }

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (decodedToken.role === "ADMIN" && user.role !== "ADMIN") {
      res.status(403).json({ message: "Access denied. Role mismatch." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let updatedUser: any;
    switch (userRole) {
      case "STUDENT":
        updatedUser = await prisma.student.update({
          where: { id },
          data: { password: hashedPassword },
        });
        break;
      case "TEACHER":
        updatedUser = await prisma.teacher.update({
          where: { id },
          data: { password: hashedPassword },
        });
        break;
      case "ADMIN":
        updatedUser = await prisma.admin.update({
          where: { id },
          data: { password: hashedPassword },
        });
        break;
    }

    const { password: _, ...safeUser } = updatedUser;

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
      user: safeUser,
    });
    return;
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

export const resetPasswordFirstTime = async (req: Request, res: Response) => {
  const { id, token } = req.params;
  const { password } = req.body;

  if (!token || !id || !password) {
    res.status(400).json({ message: "Token, ID, and password are required." });
    return;
  }

  let decodedToken: JwtPayload;
  try {
    decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
    return;
  }

  try {
    let user: any;
    const userRole = decodedToken.role;

    switch (userRole) {
      case "STUDENT":
        user = await prisma.student.findUnique({ where: { id } });
        break;
      case "TEACHER":
        user = await prisma.teacher.findUnique({ where: { id } });
        break;
      case "ADMIN":
        user = await prisma.admin.findUnique({ where: { id } });
        break;
      default:
        res.status(400).json({ message: "Invalid role in token." });
        return;
    }

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (decodedToken.role === "ADMIN" && user.role !== "ADMIN") {
      res.status(403).json({ message: "Access denied. Role mismatch." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let updatedUser: any;
    switch (userRole) {
      case "STUDENT":
        updatedUser = await prisma.student.update({
          where: { id },
          data: { password: hashedPassword,firstLoggedIn:true },
        });
        break;
      case "TEACHER":
        updatedUser = await prisma.teacher.update({
          where: { id },
          data: { password: hashedPassword,firstLoggedIn:true },
        });
        break;
      case "ADMIN":
        updatedUser = await prisma.admin.update({
          where: { id },
          data: { password: hashedPassword, firstLoggedIn:true },
        });
        break;
    }

    const { password: _, ...safeUser } = updatedUser;

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
      user: safeUser,
    });
    return;
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

