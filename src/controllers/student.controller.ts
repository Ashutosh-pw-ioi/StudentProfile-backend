import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma.js";
import { DepartmentType } from "@prisma/client";
import { parseStudentExcel } from "../utils/parseStudentExcel.js";

async function addStudent(req: Request, res: Response) {
  try {
    const userRole = req.userRole as string;
    const adminId = req.userId as string;

    if (!req.file) {
      res
        .status(400)
        .json({ success: false, message: "No Excel file uploaded" });
      return;
    }

    let adminCenterId: string | null = null;

    if (userRole === "ADMIN") {
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        select: { centerId: true },
      });

      if (!admin) {
        res.status(403).json({ success: false, message: "Admin not found" });
        return;
      }

      adminCenterId = admin.centerId;
    }

    const studentRows = parseStudentExcel(req.file.buffer);
    const createdStudents = [];

    for (const row of studentRows) {
      const {
        name,
        email,
        password,
        gender,
        phoneNumber,
        enrollmentNumber,
        center: centerName,
        department,
        batch: batchName,
      } = row;

      const center = await prisma.center.findUnique({
        where: { name: centerName },
      });
      if (!center) {
        res.status(400).json({
          success: false,
          message: `Center '${centerName}' not found.`,
        });
        return;
      }

      if (userRole === "ADMIN" && center.id !== adminCenterId) {
        res.status(403).json({
          success: false,
          message: `You are not authorized to add students to center '${centerName}'.`,
        });
        return;
      }

      const departmentEnum = department as DepartmentType;

      const departmentObj = await prisma.department.findUnique({
        where: {
          centerId_name: {
            centerId: center.id,
            name: departmentEnum,
          },
        },
      });

      if (!departmentObj) {
        res.status(400).json({
          success: false,
          message: `Department '${department}' not found in center '${centerName}'`,
        });
        return;
      }

      const batch = await prisma.batch.findUnique({
        where: {
          departmentId_name: {
            departmentId: departmentObj.id,
            name: batchName,
          },
        },
      });

      if (!batch) {
        res.status(400).json({
          success: false,
          message: `Batch '${batchName}' not found in department '${department}'`,
        });
        return;
      }

      const semesterNo = 1;

      const courses = await prisma.course.findMany({
        where: {
          semester: {
            batchId: batch.id,
            number: semesterNo,
          },
        },
        select: { id: true },
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      const newStudent = await prisma.student.create({
        data: {
          name,
          email,
          password: hashedPassword,
          gender,
          phoneNumber,
          enrollmentNumber,
          semesterNo,
          centerId: center.id,
          departmentId: departmentObj.id,
          batchId: batch.id,
          courses: {
            connect: courses.map((c) => ({ id: c.id })),
          },
        },
      });

      createdStudents.push(newStudent);
    }

    res.status(201).json({
      success: true,
      message: `${createdStudents.length} student(s) added successfully.`,
      data: createdStudents,
    });
    return;
  } catch (err) {
    console.error("Error adding students:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
}

async function getStudentDetails(req: Request, res: Response) {
  try {
    const id = req.userId;

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
        _count: {
          select: {
            courses: true,
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

    const { _count, ...rest } = student;

    res.status(200).json({
      success: true,
      data: {
        ...rest,
        courseCount: _count.courses,
      },
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

async function getStudentAcademicDetails(req: Request, res: Response) {
  try {
    const id = req.userId;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
      return;
    }

    // Single database call to fetch all required data
    const academicData = await prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        courses: {
          select: {
            id: true,
            name: true,
            code: true,
            credits: true,
          },
        },
        scores: {
          select: {
            id: true,
            marksObtained: true,
            scoreType: true,
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                credits: true,
              },
            },
          },
        },
      },
    });

    if (!academicData) {
      res.status(404).json({
        success: false,
        message: "Student not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: academicData,
    });
    return;
  } catch (error) {
    console.error("Error fetching student academic records:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
}

async function getScoreGraph(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { courseCode, scoreType } = req.body;

    if (!userId || !courseCode || !scoreType) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const course = await prisma.course.findFirst({
      where: {
        code: courseCode,
        students: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!course) {
      res.status(404).json({ message: "Course not found for student" });
      return;
    }

    const scores = await prisma.courseScore.findMany({
      where: {
        studentId: userId,
        courseId: course.id,
        name: scoreType,
      },
      orderBy: {
        dateOfExam: "asc",
      },
      select: {
        id: true,
        marksObtained: true,
        totalObtained: true,
        dateOfExam: true,
        gradedAt: true,
      },
    });

    res.status(200).json({ scores });
    return;
  } catch (err) {
    console.error("Error in getScoreGraph:", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
}

async function getStudentMarksByBatch(req: Request, res: Response) {
  try {
    const studentId = req.userId as string;

    if (!studentId) {
      res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
      return;
    }

    const referenceStudent = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        centerId: true,
        batchId: true,
        center: { select: { name: true, location: true } },
        department: { select: { name: true } },
        batch: { select: { name: true } },
      },
    });

    if (!referenceStudent) {
      res.status(404).json({
        success: false,
        message: "Student not found",
      });
      return;
    }

    const students = await prisma.student.findMany({
      where: {
        centerId: referenceStudent.centerId,
        batchId: referenceStudent.batchId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        enrollmentNumber: true,
        scores: {
          select: {
            marksObtained: true,
            scoreType: true,
            course: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    type StudentWithTotal = {
      id: string;
      name: string;
      email: string;
      enrollmentNumber: string;
      scores: {
        marksObtained: number;
        scoreType: string;
        course: { name: string };
      }[];
      totalMarks: number;
      rank?: number;
    };

    const studentsWithTotal: StudentWithTotal[] = students.map((student) => {
      const totalMarks = student.scores.reduce((sum, score) => sum + score.marksObtained, 0);
      return {
        ...student,
        totalMarks,
      };
    });

    // Sort by total marks descending
    studentsWithTotal.sort((a, b) => b.totalMarks - a.totalMarks);

    // Assign ranks (handle ties)
    let rank = 1;
    let prevMarks: number | null = null;
    let sameRankCount = 0;

    studentsWithTotal.forEach((student, index) => {
      if (student.totalMarks === prevMarks) {
        student.rank = rank;
        sameRankCount++;
      } else {
        rank = index + 1;
        student.rank = rank;
        prevMarks = student.totalMarks;
        sameRankCount = 1;
      }
    });

    const currentStudent = studentsWithTotal.find((s) => s.id === studentId);

    res.status(200).json({
      success: true,
      data: {
        center: referenceStudent.center,
        department: referenceStudent.department,
        batch: referenceStudent.batch,
        studentRank: currentStudent?.rank ?? null,
        studentTotalMarks: currentStudent?.totalMarks ?? 0,
        students: studentsWithTotal,
        totalStudents: studentsWithTotal.length,
      },
    });
  } catch (error) {
    console.error("Error fetching student marks by batch:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


async function getStudentMarksByDepartment(req: Request, res: Response){
  try {
    const studentId = req.userId as string;

    if (!studentId) {
      res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
      return;
    }

    // Fetch the current student to get department
    const referenceStudent = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        center: { select: { name: true } },
        department: { select: { name: true } },
      },
    });

    if (!referenceStudent) {
      res.status(404).json({
        success: false,
        message: "Student not found",
      });
      return;
    }

    const departmentName = referenceStudent.department.name;

    // Fetch all students across all centers from the same department
    const allStudents = await prisma.student.findMany({
      where: {
        department: { name: departmentName },
      },
      select: {
        id: true,
        name: true,
        enrollmentNumber: true,
        semesterNo: true,
        center: { select: { name: true } },
        department: { select: { name: true } },
        scores: {
          select: {
            marksObtained: true,
            scoreType: true,
            course: { select: { name: true } },
          },
        },
      },
    });

    // Add total marks to each student
    type StudentWithTotal = typeof allStudents[number] & { totalMarks: number };
    const studentsWithTotalMarks: StudentWithTotal[] = allStudents.map((student) => {
      const totalMarks = student.scores.reduce((sum, score) => sum + score.marksObtained, 0);
      return {
        ...student,
        totalMarks,
      };
    });

    // Sort by totalMarks descending
    studentsWithTotalMarks.sort((a, b) => b.totalMarks - a.totalMarks);

    // Assign rank
    let lastMarks: number | null = null;
    let lastRank = 0;
    let skip = 0;

    const rankedStudents = studentsWithTotalMarks.map((student, index) => {
      if (student.totalMarks === lastMarks) {
        skip++;
      } else {
        lastRank = index + 1;
        skip = 0;
        lastMarks = student.totalMarks;
      }

      return {
        ...student,
        rank: lastRank,
      };
    });

    // Find current student's data
    const you = rankedStudents.find((s) => s.id === studentId);

    res.status(200).json({
      success: true,
      data: {
        department: departmentName,
        totalStudents: rankedStudents.length,
        yourRank: you?.rank ?? null,
        yourTotalMarks: you?.totalMarks ?? null,
        yourCenter: referenceStudent.center,
        yourDepartment: referenceStudent.department,
        students: rankedStudents,
      },
    });
  } catch (error) {
    console.error("Error fetching student ranks by department:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getStudentsByCenter(req: Request, res: Response) {
  try {
    const userId = req.userId as string;
    const userRole = req.userRole as string;

    let centerId: string;

    if (userRole === "ADMIN") {
      // Fetch centerId using adminId
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

    // Fetch students for the centerId
    const students = await prisma.student.findMany({
      where: { centerId },
      select: {
        id: true,
        name: true,
        enrollmentNumber: true,
        email: true,
        semesterNo: true,
        center: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        batch: { select: { id: true, name: true } },
      },
    });

    const totalCount = await prisma.student.count({ where: { centerId } });

    res.status(200).json({
      success: true,
      totalCount,
      students,
    });
    return;
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    return;
  }
}

async function editStudent(req: Request, res: Response) {
  try {
    const {
      id,
      centerName,
      depName,
      batchName,
      name,
      gender,
      phoneNumber,
      semesterNo,
      password,
    } = req.body;

    const center = await prisma.center.findUnique({
      where: { name: centerName },
    });
    if (!center) {
      res.status(404).json({ success: false, message: "Center not found" });
      return;
    }

    const department = await prisma.department.findFirst({
      where: { name: depName, centerId: center.id },
    });
    if (!department) {
      res.status(404).json({ success: false, message: "Department not found" });
      return;
    }

    const batch = await prisma.batch.findFirst({
      where: { name: batchName, departmentId: department.id },
    });
    if (!batch) {
      res.status(404).json({ success: false, message: "Batch not found" });
      return;
    }

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      res.status(404).json({ success: false, message: "Student not found" });
      return;
    }

    // 🧠 Find the semester in the selected batch
    const semester = await prisma.semester.findFirst({
      where: {
        batchId: batch.id,
        number: semesterNo,
      },
    });

    if (!semester) {
      res
        .status(404)
        .json({ success: false, message: "Semester not found for batch" });
      return;
    }

    const courses = await prisma.course.findMany({
      where: {
        semesterId: semester.id,
      },
      select: {
        id: true,
      },
    });

    const courseIds = courses.map((course) => ({ id: course.id }));

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        name,
        gender,
        phoneNumber,
        semesterNo,
        password,
        centerId: center.id,
        departmentId: department.id,
        batchId: batch.id,
        courses: {
          set: courseIds, // this will replace old courses with new semester courses
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Student updated successfully and courses refreshed.",
      student: updatedStudent,
    });
    return;
  } catch (error) {
    console.error("Edit student error:", error);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
}

async function deleteStudent(req: Request, res: Response) {
  try {
    const { id } = req.body;

    const student = await prisma.student.findUnique({ where: { id: id } });
    if (!student) {
      res.status(404).json({ success: false, message: "Student not found" });
      return;
    }

    await prisma.student.delete({ where: { id: id } });

    res
      .status(200)
      .json({ success: true, message: "Student deleted successfully" });
    return;
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
}

export {
  addStudent,
  getStudentDetails,
  getStudentAcademicDetails,
  getScoreGraph,
  getStudentMarksByBatch,
  getStudentMarksByDepartment,
  getStudentsByCenter,
  editStudent,
  deleteStudent,
};
