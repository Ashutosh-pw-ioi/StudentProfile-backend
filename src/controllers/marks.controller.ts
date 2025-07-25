import { Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import { ScoreType } from "@prisma/client";
import { parseMarksExcel } from "../utils/parseMarksExcel.js";

async function addStudentMarks(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
      return;
    }

    const parsedData = parseMarksExcel(file.buffer);

    const operations = parsedData.map(async (row) => {
      const {
        enrollmentNumber,
        courseCode,
        testName,
        scoreType,
        obtainedMarks,
        totalMarks,
        date,
      } = row;

      if (
        !enrollmentNumber ||
        !courseCode ||
        !scoreType ||
        obtainedMarks === undefined
      ) {
        res.status(404).json({
          msg:"Skipping Invalid Rows",
          data:row
        })
        return;
      }

      const student = await prisma.student.findUnique({
        where: { enrollmentNumber },
        select: { id: true },
      });

      if (!student) {
        console.warn(`Student not found: ${enrollmentNumber}`);
        return;
      }

      const course = await prisma.course.findFirst({
        where: { code: courseCode },
        select: { id: true },
      });

      if (!course) {
        console.warn(`Course not found: ${courseCode}`);
        return;
      }

      const normalizedScoreType = scoreType.toUpperCase() as ScoreType;

      await prisma.courseScore.upsert({
        where: {
          studentId_courseId_scoreType: {
            studentId: student.id,
            courseId: course.id,
            scoreType: normalizedScoreType,
          },
        },
        update: {
          marksObtained: obtainedMarks,
          totalObtained: totalMarks || 100,
          dateOfExam: date,
          updatedAt: new Date(),
        },
        create: {
          studentId: student.id,
          courseId: course.id,
          name: testName as ScoreType,
          scoreType: scoreType,
          marksObtained: obtainedMarks,
          totalObtained: totalMarks || 100,
          dateOfExam: date,
          gradedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });

    await Promise.all(operations);

    res.status(200).json({
      success: true,
      message: "Student marks imported successfully",
    });
    return;
  } catch (error) {
    console.error("Error uploading marks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while uploading marks",
    });
    return;
  }
}

async function getCourseScoresByCenter(req: Request, res: Response) {
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
         res.status(404).json({ success: false, message: "Admin not found" });
         return;
      }

      centerId = admin.centerId;

    } else if (userRole === "SUPER_ADMIN") {
      const { centerName } = req.body;

      if (!centerName) {
         res.status(400).json({ success: false, message: "Center name is required" });
         return;
      }

      const center = await prisma.center.findUnique({
        where: { name: centerName },
      });

      if (!center) {
         res.status(404).json({ success: false, message: "Center not found" });
         return;
      }

      centerId = center.id;

    } else {
       res.status(403).json({ success: false, message: "Unauthorized role" });
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
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        students: {
          include: {
            scores: true,
            department: { select: { name: true } },
            center: { select: { name: true } },
            batch: { select: { name: true } },
          },
        },
        semester: {
          include: {
            batch: {
              include: {
                department: {
                  include: {
                    center: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const result = courses.map(course => ({
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      credits: course.credits,
      teachers: course.teachers,
      students: course.students.map(student => {
        const score = student.scores.find(s => s.courseId === course.id);
        return {
          studentId: student.id,
          studentName: student.name,
          email: student.email,
          enrollmentNumber: student.enrollmentNumber,
          department: student.department.name,
          center: student.center.name,
          batch: student.batch.name,
          scores: score
            ? {
              scoreId:score.id,
                marksObtained: score.marksObtained,
                totalObtained: score.totalObtained,
                scoreType: score.scoreType,
                name: score.name as ScoreType,
                dateOfExam: score.dateOfExam,
              }
            : null,
        };
      }),
    }));

     res.status(200).json({
      success: true,
      data: result,
    });
    return;

  } catch (error) {
    console.error("Error in getCourseScoresByCenter:", error);
     res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
}

async function editCourseScore(req: Request, res: Response) {
  try {
    const { scoreId,marksObtained, totalObtained, dateOfExam, scoreType, name } = req.body;

    const existingScore = await prisma.courseScore.findUnique({
      where: { id: scoreId },
      include: {
        student: { select: { centerId: true } },
      },
    });

    if (!existingScore) {
       res.status(404).json({ success: false, message: "Score not found" });
       return;
    }

    const updatedScore = await prisma.courseScore.update({
      where: { id: scoreId },
      data: {
        marksObtained,
        totalObtained,
        dateOfExam: new Date(dateOfExam),
        scoreType,
        name,
        updatedAt: new Date(),
      },
    });

     res.status(200).json({
      success: true,
      message: "Score updated successfully",
      data: updatedScore,
    });
    return;
  } catch (error) {
    console.error("Error in editCourseScoreByAdmin:", error);
     res.status(500).json({ success: false, message: "Internal server error" });
     return;
  }
}

async function deleteCourseScore(req: Request, res: Response) {
  try {
    const { scoreId } = req.body;

    const score = await prisma.courseScore.findUnique({
      where: { id: scoreId },
      include: {
        student: { select: { centerId: true } },
      },
    });

    if (!score) {
       res.status(404).json({ success: false, message: "Score not found" });
       return;
        }

    await prisma.courseScore.delete({ where: { id: scoreId } });

     res.status(200).json({
      success: true,
      message: "Score deleted successfully",
    });
    return;
  } catch (error) {
    console.error("Error in deleteCourseScoreByAdmin:", error);
     res.status(500).json({ success: false, message: "Internal server error" });
     return;
  }
}

export { addStudentMarks,getCourseScoresByCenter,editCourseScore,deleteCourseScore };