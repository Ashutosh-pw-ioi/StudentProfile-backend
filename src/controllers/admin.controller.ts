import { Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

async function hashPassword(password: string, saltRound: number): Promise<string> {
  return bcrypt.hash(password, saltRound);
}

export async function listCenterDepartments(req: Request, res: Response) {
  const adminId = req.userId as string;

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { centerId: true },
    });

    if (!admin) {
       res.status(404).json({
        success: false,
        message: "Admin not found",
      });
      return;
    }

    const departments = await prisma.department.findMany({
      where: {
        centerId: admin.centerId,
      },
      include: {
        batches: true,
      },
    });

     res.status(200).json({
      success: true,
      message: "Departments with batches fetched successfully",
      data: departments,
    });
    return;

  } catch (error) {
    console.error("Error fetching departments:", error);
     res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
}

export async function createAdmin(req: Request, res: Response) {
  try {
    const { name, email, password, role, centerName } = req.body;

    const center = await prisma.center.findUnique({
      where: { name: centerName },
    });

    if (!center) {
       res.status(404).json({ success: false, message: "Center not found" });
       return;
    }
    
    const hashedPassword = await hashPassword(password,10);

    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password:hashedPassword,
        role: role as Role,
        centerId: center.id,
      },
    });

    res.status(201).json({ success: true, data: admin });
    return;
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating admin", error: err });
    return;
  }
}

export async function getAllAdmins(req: Request, res: Response) {
  try {
    const admins = await prisma.admin.findMany({
      include: {
        center: true,
      },
    });

    res.json({ success: true, data: admins });
    return;
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching admins", error: err });
    return;
  }
}

export async function getAdminById(req: Request, res: Response) {
  try {
    const { id } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { id },
      include: {
        center: true,
      },
    });

    if (!admin) {
       res.status(404).json({ success: false, message: "Admin not found" });
       return;
    }

    res.json({ success: true, data: admin });
    return;
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching admin", error: err });
    return;
  }
}

export async function updateAdmin(req: Request, res: Response) {
  try {
    const { id } = req.body;
    const { name, email, password, role, centerName } = req.body;

    let centerId;

    if (centerName) {
      const center = await prisma.center.findUnique({ where: { name: centerName } });
      if (!center) {
         res.status(404).json({ success: false, message: "Center not found" });
         return;  
      }
      centerId = center.id;
    }

    const hashedPassword = await hashPassword(password,10);

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: {
        name,
        email,
        password:hashedPassword,
        role: role as Role,
        ...(centerId && { centerId }),
      },
    });

    res.json({ success: true, data: updatedAdmin });
    return;
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating admin", error: err });
    return;
  }
}

export async function deleteAdmin(req: Request, res: Response) {
  try {
    const { id } = req.body;

    await prisma.admin.delete({ where: { id } });

    res.json({ success: true, message: "Admin deleted successfully" });
    return;
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting admin", error: err });
    return;
  }
}