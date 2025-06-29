import { Request, Response } from "express";
import { PrismaClient, DepartmentType } from "@prisma/client";

const prisma = new PrismaClient();

async function createBatch(req: Request, res: Response) {
  try {
    const { centerName, depName, batchName } = req.body;

    if (!centerName || !depName || !batchName) {
       res.status(400).json({
        success: false,
        message: "centerName, depName, and batchName are required",
      });
      return;
    }

    const center = await prisma.center.findUnique({
      where: { name: centerName },
    });

    if (!center) {
       res.status(404).json({
        success: false,
        message: "Center not found",
      });
      return;
    }

    const department = await prisma.department.findFirst({
      where: {
        centerId: center.id,
        name: depName as DepartmentType,
      },
    });

    if (!department) {
       res.status(404).json({
        success: false,
        message: "Department not found for this center",
      });
      return;
    }

    const existingBatch = await prisma.batch.findUnique({
      where: {
        departmentId_name: {
          departmentId: department.id,
          name: batchName,
        },
      },
    });

    if (existingBatch) {
       res.status(409).json({
        success: false,
        message: "Batch with this name already exists in the department",
      });
      return;
    }

    const newBatch = await prisma.batch.create({
      data: {
        name: batchName,
        departmentId: department.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: newBatch,
    });
    return;
  } catch (error) {
    console.error("Create Batch Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
}
async function getBatchesByCenter(req: Request, res: Response) {
  try {
    const userId = req.userId as string;
    const userRole = req.userRole as string;

    let centerId: string;
    let centerName: string;

    if (userRole === "ADMIN") {
      const admin = await prisma.admin.findUnique({
        where: { id: userId },
        include: {
          center: true,
        },
      });

      if (!admin || !admin.center) {
         res.status(404).json({
          success: false,
          message: "Admin or associated center not found",
        });
        return;
      }

      centerId = admin.center.id;
      centerName = admin.center.name;

    } else if (userRole === "SUPER_ADMIN") {
      const { centerName: bodyCenterName } = req.body;

      if (!bodyCenterName) {
         res.status(400).json({
          success: false,
          message: "Center name is required for Super Admin",
        });
        return;
      }

      const center = await prisma.center.findUnique({
        where: { name: bodyCenterName },
      });

      if (!center) {
         res.status(404).json({
          success: false,
          message: "Center not found",
        });
        return;
      }

      centerId = center.id;
      centerName = center.name;

    } else {
       res.status(403).json({
        success: false,
        message: "Unauthorized role",
      });
      return
    }

    // Fetch departments and batches for the resolved center
    const departments = await prisma.department.findMany({
      where: { centerId },
      include: {
        batches: {
          include: {
            students: true,
            teachers: true,
          },
        },
      },
    });

     res.status(200).json({
      success: true,
      data: {
        center: centerName,
        departments: departments.map((dept) => ({
          departmentName: dept.name,
          batches: dept.batches.map((batch) => ({
            batchName: batch.name,
            students: batch.students,
            teachers: batch.teachers,
          })),
        })),
      },
    });
    return;

  } catch (error) {
    console.error("Get Batches by Center Error:", error);
     res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
}

async function updateBatch(req: Request, res: Response) {
  try {
    const { batchId, batchName } = req.body;

    if (!batchId || !batchName) {
       res.status(400).json({
        success: false,
        message: "batchId and batchName are required",
      });
      return;
    }

    const existing = await prisma.batch.findUnique({ where: { id: batchId } });

    if (!existing) {
       res.status(404).json({
        success: false,
        message: "Batch not found",
      });
      return;
    }

    // Check for duplicate batch name in same department
    const duplicate = await prisma.batch.findUnique({
      where: {
        departmentId_name: {
          departmentId: existing.departmentId,
          name: batchName,
        },
      },
    });

    if (duplicate) {
       res.status(409).json({
        success: false,
        message: "A batch with this name already exists in the department",
      });
      return;
    }

    const updatedBatch = await prisma.batch.update({
      where: { id: batchId },
      data: { name: batchName },
    });

    res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      data: updatedBatch,
    });
    return;
  } catch (error) {
    console.error("Update Batch Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
}

async function deleteBatch(req: Request, res: Response) {
  try {
    const { batchId } = req.body;

    if (!batchId) {
       res.status(400).json({
        success: false,
        message: "batchId is required",
      });
      return;
    }

    const batch = await prisma.batch.findUnique({ where: { id: batchId } });

    if (!batch) {
       res.status(404).json({
        success: false,
        message: "Batch not found",
      });
      return;
    }

    await prisma.batch.delete({
      where: { id: batchId },
    });

    res.status(200).json({
      success: true,
      message: "Batch deleted successfully",
    });
    return;
  } catch (error) {
    console.error("Delete Batch Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
}

export { createBatch, getBatchesByCenter, updateBatch, deleteBatch };

//looks good