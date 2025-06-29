import { Request, Response } from "express";
import { PrismaClient, DepartmentType } from "@prisma/client";

const prisma = new PrismaClient();

 async function createCourse(req: Request, res: Response) {
  try {
    const adminId = req.userId;
    const userRole = req.userRole;

    const {
      centerName,
      departmentName,
      batchName,
      semesterNumber,
      name,
      code,
      credits,
    } = req.body;

    if (
      !centerName ||
      !departmentName ||
      !batchName ||
      !semesterNumber ||
      !name ||
      !code
    ) {
       res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
      return;
    }

    // Role-based center check
    if (userRole === "ADMIN") {
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        select: { center: true },
      });

      if (!admin) {
         res
          .status(404)
          .json({ success: false, message: "Admin not found." });
          return;
      }

      if (admin.center.name !== centerName) {
         res.status(403).json({
          success: false,
          message: "You can only add courses for your own center.",
        });
        return;
      }
    }

    // Find center
    const center = await prisma.center.findUnique({
      where: { name: centerName },
    });

    if (!center) {
       res
        .status(404)
        .json({ success: false, message: "Center not found." });
        return;
    }

    // Find department
    const department = await prisma.department.findFirst({
      where: {
        name: departmentName as DepartmentType,
        centerId: center.id,
      },
    });

    if (!department) {
       res
        .status(404)
        .json({ success: false, message: "Department not found." });
        return;
    }

    // Find batch
    const batch = await prisma.batch.findFirst({
      where: {
        name: batchName,
        departmentId: department.id,
      },
    });

    if (!batch) {
       res
        .status(404)
        .json({ success: false, message: "Batch not found." });
        return;
    }

    // Find semester
    const semester = await prisma.semester.findFirst({
      where: {
        number: semesterNumber,
        batchId: batch.id,
      },
    });

    if (!semester) {
       res
        .status(404)
        .json({ success: false, message: "Semester not found." });
        return;
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        name,
        code,
        credits,
        semester: {
          connect: { id: semester.id },
        },
      },
    });

     res.status(201).json({ success: true, data: course });
     return;
  } catch (error) {
    console.error(error);
     res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
      return;
  }
}

async function getAllCourses(req: Request, res: Response) {
  try {
    const userId = req.userId as string;
    const userRole = req.userRole as string;

    let centerId: string;

    if (userRole === "ADMIN") {
      const admin = await prisma.admin.findUnique({
        where: { id: userId },
        select: { centerId: true },
      });

      if (!admin) {
         res.status(404).json({
          success: false,
          message: "Admin not found",
        });
        return;
      }

      centerId = admin.centerId;
    } else if (userRole === "SUPER_ADMIN") {
      const { centerName } = req.body;

      if (!centerName) {
         res.status(400).json({
          success: false,
          message: "Center name is required for Super Admin",
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

      centerId = center.id;
    } else {
       res.status(403).json({
        success: false,
        message: "Unauthorized role",
      });
      return;
    }

    const courses = await prisma.course.findMany({
      where: {
        semester: {
          batch: {
            department: {
              centerId,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
        credits: true,
        teachers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            enrollmentNumber: true,
          },
        },
        semester: {
          select: {
            number: true,
            batch: {
              select: {
                name: true,
                department: {
                  select: {
                    name: true,
                    center: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const groupedByDepartment: Record<string, any[]> = {};

    for (const course of courses) {
      const depName = course.semester.batch.department.name;
      const centerName = course.semester.batch.department.center.name;
      const batchName = course.semester.batch.name;
      const semesterNo = course.semester.number;

      const formattedCourse = {
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        credits: course.credits,
        semesterNo,
        batchName,
        depName,
        centerName,
        teachers: course.teachers,
        students: course.students,
      };

      if (!groupedByDepartment[depName]) {
        groupedByDepartment[depName] = [];
      }

      groupedByDepartment[depName].push(formattedCourse);
    }

     res.status(200).json({
      success: true,
      centerId,
      data: groupedByDepartment,
    });
    return;
  } catch (error) {
    console.error("Error in getAllCourses:", error);
     res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
    return;
  }
}

async function getCourseById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        semester: {
          include: {
            batch: {
              include: {
                department: {
                  include: {
                    center: true,
                  },
                },
              },
            },
          },
        },
        teachers: true,
        students: true,
        scores: true,
      },
    });

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found." });
      return;
    }

    res.status(200).json({ success: true, data: course });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
}

async function updateCourse(req: Request, res: Response) {
  try {
    const { id } = req.body;
    const { name, code, credits } = req.body;

    const course = await prisma.course.update({
      where: { id },
      data: {
        name,
        code,
        credits,
      },
    });

    res.status(200).json({ success: true, data: course });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
}

async function deleteCourse(req: Request, res: Response) {
  try {
    const { id } = req.body;

    await prisma.course.delete({
      where: { id },
    });

    res
      .status(200)
      .json({ success: true, message: "Course deleted successfully." });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
}

export {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};


