import { Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import { parseTeacherExcel } from "../utils/parseTeacherExcel.js";
import bcrypt from "bcryptjs";

 async function addTeacher(req: Request, res: Response) {
  try {
    const userRole = req.userRole as string;
    const adminId = req.userId as string;

    if (!req.file) {
       res.status(400).json({ success: false, message: "No Excel file uploaded" });
       return;
    }

    const buffer = req.file.buffer;
    const teachersData = parseTeacherExcel(buffer);

    let adminCenterId: string | null = null;
    if (userRole === "ADMIN") {
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!admin) {
         res.status(403).json({ success: false, message: "Admin not found" });
         return;
      }

      adminCenterId = admin.centerId;
    }

    const createdTeachers = [];

    for (const teacher of teachersData) {
      const {
        name,
        email,
        password,
        gender,
        phoneNumber,
        experience,
        centerName,
        departmentName,
        batchName,
        courseName,
      } = teacher;

      const center = await prisma.center.findUnique({
        where: { name: centerName },
      });
      if (!center) {
        throw new Error(`Center not found: ${centerName}`);
      }

      if (userRole === "ADMIN" && center.id !== adminCenterId) {
         res.status(403).json({
          success: false,
          message: `You are not authorized to add teachers to ${centerName}`,
        });
        return;
      }

      const department = await prisma.department.findFirst({
        where: {
          name: departmentName as any,
          centerId: center.id,
        },
      });
      if (!department) {
        throw new Error(`Department not found: ${departmentName} in center ${centerName}`);
      }

      const batch = await prisma.batch.findFirst({
        where: {
          name: batchName,
          departmentId: department.id,
        },
      });
      if (!batch) {
        throw new Error(`Batch not found: ${batchName} in department ${departmentName}`);
      }

      const course = await prisma.course.findFirst({
        where: {
          name: courseName,
          semester: {
            batchId: batch.id,
          },
        },
        include: {
          semester: true,
        },
      });
      if (!course) {
        throw new Error(`Course not found: ${courseName} in batch ${batchName}`);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newTeacher = await prisma.teacher.create({
        data: {
          name,
          email,
          password: hashedPassword,
          gender,
          phoneNumber,
          experience,
          centerId: center.id,
          departmentId: department.id,
          batches: {
            connect: { id: batch.id },
          },
          courses: {
            connect: { id: course.id },
          },
        },
      });

      createdTeachers.push(newTeacher);
    }

     res.status(201).json({
      success: true,
      message: "Teachers added successfully",
      data: createdTeachers,
    });
    return;
  } catch (error: any) {
    console.error("Error adding teachers:", error);
     res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
    return;
  }
}

async function getTeacherProfile(req: Request, res: Response) {
  try {
    const id = req.userId;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
      return;
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        center: true,
        department: true,
        courses: {
          include: {
            students: true,
            semester: {
              include: {
                batch: {
                  include: {
                    department: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
      return;
    }

    const totalCourses = teacher.courses.length;
    const uniqueStudentIds = new Set<string>();

    teacher.courses.forEach((course) => {
      course.students.forEach((student) => {
        uniqueStudentIds.add(student.id);
      });
    });

    const totalStudents = uniqueStudentIds.size;

    const profileData = {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      gender: teacher.gender,
      phoneNumber: teacher.phoneNumber,
      experience: teacher.experience,
      centerCity: teacher.center.location,
      department: teacher.department.name,
      statistics: {
        totalCourses,
        totalStudents,
        coursesDetails: teacher.courses.map((course) => ({
          id: course.id,
          name: course.name,
          code: course.code,
          credits: course.credits,
          studentsCount: course.students.length,
          semester: course.semester.number,
          batch: course.semester.batch.name,
          department: course.semester.batch.department.name,
        })),
      },
    };

    res.status(200).json({
      success: true,
      data: profileData,
    });
    return;
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
}

async function getTeachingDetails(req: Request, res: Response) {
  try {
    const id = req.userId;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
      return;
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            semester: {
              include: {
                batch: true,
              },
            },
            students: {
              select: {
                id: true,
                name: true,
                email: true,
                enrollmentNumber: true,
                gender: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
      return;
    }

    const teachingDetails = teacher.courses.map((course) => {
      const batch = course.semester.batch;

      return {
        batchName: batch.name,
        semester: course.semester.number,
        courseCode: course.code,
        courseName: course.name,
        admittedStudentsCount: course.students.length,
        admittedStudents: course.students.map((student) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          enrollmentNumber: student.enrollmentNumber,
          gender: student.gender,
          phoneNumber: student.phoneNumber,
        })),
      };
    });

    res.status(200).json({
      success: true,
      data: teachingDetails,
    });
    return;
  } catch (error) {
    console.error("Error fetching teaching details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
}

async function getStudentProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        phoneNumber: true,
        enrollmentNumber: true,
        semesterNo: true,
        center: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        batch: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!student) {
      res.status(404).json({
        success: false,
        message: "Student not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: student,
    });
    return;
  } catch (error) {
    console.error("Error fetching student basic info:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
}

async function getTeachersByCenter(req: Request, res: Response) {
  try {
    const userId = req.userId as string;
    const userRole = req.userRole as string;

    let centerId: string;

    if (userRole === "ADMIN") {
      // Find admin and extract centerId
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

    // Fetch teachers based on resolved centerId
    const teachers = await prisma.teacher.findMany({
      where: { centerId },
      select: {
        id: true,
        name: true,
        email: true,
        center: { select: { name: true } },
        department: { select: { name: true } },
        batches: { select: { name: true } },
      },
    });

    const totalCount = await prisma.teacher.count({ where: { centerId } });

     res.status(200).json({
      success: true,
      totalCount,
      teachers,
    });
    return;
  } catch (error) {
    console.error("Error fetching teachers by center:", error);
     res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
}

async function updateTeacher (req: Request, res: Response){
  try {
    const { id } = req.body;

    const {
      name,
      email,
      password,
      gender,
      phoneNumber,
      experience,
      centerName,
      depName,
    } = req.body;

    if (!id || !centerName || !depName) {
       res.status(400).json({
        success: false,
        message: "Teacher ID, centerName, and depName are required",
      });
      return;
    }

    const center = await prisma.center.findUnique({
      where: { name: centerName },
    });

    if (!center) {
       res.status(404).json({ success: false, message: "Center not found" });
       return;
    }

    const department = await prisma.department.findFirst({
      where: {
        centerId: center.id,
        name: depName,
      },
    });

    if (!department) {
       res.status(404).json({ success: false, message: "Department not found" });
       return;
    }

    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!existingTeacher) {
       res.status(404).json({ success: false, message: "Teacher not found" });
       return;
    }

    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data: {
        name,
        email,
        password,
        gender,
        phoneNumber,
        experience,
        centerId: center.id,
        departmentId: department.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
    return;
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

async function deleteTeacher (req: Request, res: Response){
  try {
    const { id } = req.body;

    if (!id) {
       res.status(400).json({ success: false, message: "Teacher ID is required" });
       return;
    }

    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!existingTeacher) {
       res.status(404).json({ success: false, message: "Teacher not found" });
       return;
    }

    await prisma.teacher.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
    return;
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

export { addTeacher,getTeacherProfile, getTeachingDetails, getStudentProfile,getTeachersByCenter,updateTeacher,deleteTeacher };
