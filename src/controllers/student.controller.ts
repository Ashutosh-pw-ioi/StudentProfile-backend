import { Request, Response } from "express";
import { prisma } from "../db/prisma.js";

// Get student Personal Details by ID
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

// Get student academic records (courses and marks) by ID
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
            marks: true,
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

// Get marks of all students in a particular center's department's batch
async function getStudentMarksByBatch(req: Request, res: Response) {
  try {
    const studentId = req.userId;

    if (!studentId) {
      res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
      return;
    }

    // First, get the student's details to find their center, department, and batch
    const referenceStudent = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        centerId: true,
        departmentId: true,
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

    const studentsWithMarks = await prisma.student.findMany({
      where: {
        centerId: referenceStudent.centerId,
        departmentId: referenceStudent.departmentId,
        batchId: referenceStudent.batchId,
      },
      select: {
        name: true,
        email: true,
        enrollmentNumber: true,
        scores: {
          select: {
            marks: true,
            scoreType: true,
            course: {
              select: {
                name: true,
              },
            },
          },
          orderBy: [
            { course: { name: 'asc' } },
            { scoreType: 'asc' },
          ],
        },
      },
      orderBy: {
        enrollmentNumber: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        center: referenceStudent.center,
        department: referenceStudent.department,
        batch: referenceStudent.batch,
        students: studentsWithMarks,
        totalStudents: studentsWithMarks.length,
      },
    });
    return;

  } catch (error) {
    console.error("Error fetching student marks by batch:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
}

// Get marks of all students in a department across all centers
async function getStudentMarksByDepartment(req: Request, res: Response) {
  try {
    const studentId = req.userId;

    if (!studentId) {
      res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
      return;
    }

    // First, get the student's department details
    const referenceStudent = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
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

    const studentsWithMarks = await prisma.student.findMany({
      where: {
        department: {
          name: referenceStudent.department.name,
        },
      },
      select: {
        name: true,
        email: true,
        enrollmentNumber: true,
        semesterNo: true,
        center: {
          select: {
            location: true,
          },
        },
        batch: {
          select: {
            name: true,
          },
        },
        scores: {
          select: {
            marks: true,
            scoreType: true,
            course: {
              select: {
                name: true,
              },
            },
          },
          orderBy: [
            { course: { name: 'asc' } },
            { scoreType: 'asc' },
          ],
        },
      },
      orderBy: [
        { center: { name: 'asc' } },
        { enrollmentNumber: 'asc' },
      ],
    });

    // Group students by center for better organization
    const studentsByCenter = studentsWithMarks.reduce((acc, student) => {
      const centerName = student.center.location;
      if (!acc[centerName]) {
        acc[centerName] = {
          center: student.center,
          students: [],
        };
      }
      acc[centerName].students.push(student);
      return acc;
    }, {} as Record<string, { center: any; students: any[] }>);

    res.status(200).json({
      success: true,
      data: {
        departmentName: referenceStudent.department.name,
        centerData: Object.values(studentsByCenter),
        totalStudents: studentsWithMarks.length,
        totalCenters: Object.keys(studentsByCenter).length,
      },
    });
    return;

  } catch (error) {
    console.error("Error fetching student marks by department:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
}

export {
  getStudentDetails,
  getStudentAcademicDetails,
  getStudentMarksByBatch,
  getStudentMarksByDepartment,
};