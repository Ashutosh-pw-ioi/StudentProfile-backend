import { Request, Response } from "express";
import { prisma } from "../db/prisma.js";

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
    const { id } = req.body;

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

export { getTeacherProfile, getTeachingDetails, getStudentProfile };
