import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma.js";

const registerUser = async (req: Request, res: Response) : Promise<any> => {
  try {
      const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }


    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export { registerUser };
