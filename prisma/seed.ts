import { prisma } from "../src/db/prisma.js";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);
const pad = (n: number, l = 3) => String(n).padStart(l, "0");

const ORG = {
  Bangalore: {
    id: "c1111111-1111-1111-1111-111111111111",
    departments: {
      SOT: ["SOT23B1", "SOT24B1", "SOT24B2"],
      SOM: ["SOM23B1", "SOM24B2"],
    },
  },
  Noida: {
    id: "c2222222-2222-2222-2222-222222222222",
    departments: {
      SOT: ["SOT25B1"],
      SOM: ["SOM25B1"],
      SOH: ["SOH25B1"],
    },
  },
  Pune: {
    id: "c3333333-3333-3333-3333-333333333333",
    departments: {
      SOT: ["SOT25B1"],
      SOM: ["SOM25B1"],
      SOH: ["SOH25B1"],
    },
  },
  Lucknow: {
    id: "c4444444-4444-4444-4444-444444444444",
    departments: {
      SOT: ["SOT25B1"],
      SOM: ["SOM25B1"],
    },
  },
  Patna: {
    id: "c5555555-5555-5555-5555-555555555555",
    departments: {
      SOT: ["SOT25B1"],
      SOM: ["SOM25B1"],
    },
  },
  Indore: {
    id: "c6666666-6666-6666-6666-666666666666",
    departments: {
      SOT: ["SOT25B1"],
      SOM: ["SOM25B1"],
      SOH: ["SOH25B1"],
    },
  },
} as const;

const SEMESTERS = {
  SOT: 8,
  SOM: 6,
  SOH: 6,
} as const;

const SCORE_TYPES = [
  { type: "FORTNIGHTLY_TEST", maxMarks: 20 },
  { type: "ASSIGNMENT", maxMarks: 25 },
  { type: "MID_SEM", maxMarks: 50 },
  { type: "END_SEM", maxMarks: 100 },
] as const;

type DeptCode = keyof typeof SEMESTERS;
type ScoreType = (typeof SCORE_TYPES)[number]["type"];

async function main() {
  console.log("🌱 Starting seed process...");

  console.log("🧹 Cleaning existing data...");
  await prisma.courseScore.deleteMany();
  await prisma.course.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.department.deleteMany();
  await prisma.center.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.admin.deleteMany();

  console.log("📍 Creating centers...");
  const centers = Object.entries(ORG).map(([name, cfg]) => ({
    id: cfg.id,
    name,
    location: name,
  }));
  await prisma.center.createMany({ data: centers });

  console.log("🏢 Creating departments and batches...");
  const departments: { id: string; name: DeptCode; centerId: string }[] = [];
  const batches: { id: string; name: string; departmentId: string }[] = [];

  for (const [
    centerName,
    { id: centerId, departments: deptMap },
  ] of Object.entries(ORG)) {
    for (const [deptCode, batchNames] of Object.entries(deptMap) as [
      DeptCode,
      string[]
    ][]) {
      const deptId = randomUUID();
      departments.push({ id: deptId, name: deptCode, centerId });

      for (const batchName of batchNames) {
        batches.push({
          id: randomUUID(),
          name: batchName,
          departmentId: deptId,
        });
      }
    }
  }
  await prisma.department.createMany({ data: departments });
  await prisma.batch.createMany({ data: batches });

  console.log("📚 Creating semesters...");
  const semesters: { id: string; number: number; batchId: string }[] = [];
  const firstSemesterOfBatch: Record<string, string> = {};

  for (const batch of batches) {
    const deptCode = batch.name.slice(0, 3) as DeptCode;
    const totalSem = SEMESTERS[deptCode];
    for (let n = 1; n <= totalSem; n++) {
      const id = randomUUID();
      semesters.push({ id, number: n, batchId: batch.id });
      if (n === 1) firstSemesterOfBatch[batch.id] = id;
    }
  }
  await prisma.semester.createMany({ data: semesters });

  console.log("👨‍🏫 Creating teachers...");
  const teacherCount = 100;
  const teachers = Array.from({ length: teacherCount }, (_, i) => ({
    id: randomUUID(),
    name: `Teacher ${i + 1}`,
    email: `teacher${i + 1}@example.edu`,
    password: hash("teacher123"),
    gender: "male",
    phoneNumber: `98765432${pad(i, 2)}`,
    experience: Math.floor(Math.random() * 10) + 1,
    centerId: centers[i % centers.length].id,
    departmentId: departments[i % departments.length].id,
  }));
  await prisma.teacher.createMany({ data: teachers });

  console.log("📖 Creating courses...");
  const courses = [] as {
    id: string;
    name: string;
    code: string;
    credits: number;
    semesterId: string;
  }[];
  let courseSeq = 1;

  for (const sem of semesters) {
    for (let i = 0; i < 2; i++) {
      const courseId = randomUUID();
      const courseCode = `C${pad(courseSeq, 4)}`;
      courses.push({
        id: courseId,
        name: `Course ${courseSeq}`,
        code: courseCode,
        credits: 3,
        semesterId: sem.id,
      });
      courseSeq++;
    }
  }
  await prisma.course.createMany({ data: courses });

  console.log("👑 Creating admins...");
  const admins = [
    ...Array.from({ length: 5 }, (_, i) => ({
      id: randomUUID(),
      name: `Admin ${i + 1}`,
      email: `admin${i + 1}@example.com`,
      password: hash("admin123"),
      role: "ADMIN" as const,
    })),
    {
      id: randomUUID(),
      name: "Super Admin",
      email: "super.admin@example.com",
      password: hash("super123"),
      role: "SUPER_ADMIN" as const,
    },
    {
      id: randomUUID(),
      name: "Moderator",
      email: "moderator@example.com",
      password: hash("mod123"),
      role: "MODERATOR" as const,
    },
  ];
  await prisma.admin.createMany({ data: admins });

  console.log("👨‍🎓 Creating students...");
  const students = [] as {
    id: string;
    name: string;
    email: string;
    gender: string;
    phoneNumber: string;
    enrollmentNumber: string;
    password: string;
    semesterNo: number;
    centerId: string;
    departmentId: string;
    batchId: string;
  }[];

  let studentSeq = 1;
  for (const batch of batches) {
    const department = departments.find((d) => d.id === batch.departmentId)!;
    const center = centers.find((c) => c.id === department.centerId)!;

    for (let s = 1; s <= 30; s++) {
      const genders = ["male", "female", "other"];
      const randomGender = genders[Math.floor(Math.random() * genders.length)];

      students.push({
        id: randomUUID(),
        name: `Student ${studentSeq}`,
        email: `student${studentSeq}@example.edu`,
        gender: randomGender,
        phoneNumber: `92875341${pad(Math.floor(Math.random() * 100), 2)}`,
        enrollmentNumber: `${center.name.slice(0, 3).toUpperCase()}${
          batch.name
        }${pad(s, 3)}`,
        password: hash("student123"),
        semesterNo: 1,
        centerId: center.id,
        departmentId: department.id,
        batchId: batch.id,
      });
      studentSeq++;
    }
  }
  await prisma.student.createMany({ data: students });

  console.log("🔗 Creating course-teacher-student relationships...");
  const teacherPool = await prisma.teacher.findMany();
  const studentsByBatch: Record<string, typeof students> = {};
  for (const stu of students) {
    (studentsByBatch[stu.batchId] ??= []).push(stu);
  }
  const availableStudentsByBatch = { ...studentsByBatch };

  for (const course of courses) {
    const semester = semesters.find((s) => s.id === course.semesterId)!;
    const batchId = semester.batchId;
    const teacher = teacherPool[Math.floor(Math.random() * teacherPool.length)];
    const availableStudents = availableStudentsByBatch[batchId] ?? [];
    const roster = availableStudents.splice(
      0,
      Math.min(5, availableStudents.length)
    );

    if (roster.length === 0) continue;

    await prisma.course.update({
      where: { id: course.id },
      data: {
        teachers: { connect: { id: teacher.id } },
        students: { connect: roster.map((s) => ({ id: s.id })) },
      },
    });
  }

  console.log("📊 Creating course scores...");
  const courseScores = [] as {
    id: string;
    marks: number;
    scoreType: ScoreType;
    studentId: string;
    courseId: string;
  }[];

  const coursesWithStudents = await prisma.course.findMany({
    include: { students: true },
  });
  for (const course of coursesWithStudents) {
    for (const student of course.students) {
      const numScoreTypes = Math.floor(Math.random() * 3) + 2;
      const selectedScoreTypes = [...SCORE_TYPES]
        .sort(() => 0.5 - Math.random())
        .slice(0, numScoreTypes);

      for (const scoreTypeConfig of selectedScoreTypes) {
        const percentage = Math.random() * 0.55 + 0.4;
        const marks = Math.round(scoreTypeConfig.maxMarks * percentage);

        courseScores.push({
          id: randomUUID(),
          marks,
          scoreType: scoreTypeConfig.type as ScoreType,
          studentId: student.id,
          courseId: course.id,
        });
      }
    }
  }
  if (courseScores.length > 0)
    await prisma.courseScore.createMany({ data: courseScores });

  console.log("✅ Seed completed successfully!");
  console.log(`📈 Centers: ${centers.length}`);
  console.log(`🏢 Departments: ${departments.length}`);
  console.log(`📚 Batches: ${batches.length}`);
  console.log(`📖 Semesters: ${semesters.length}`);
  console.log(`👨‍🏫 Teachers: ${teachers.length}`);
  console.log(`📘 Courses: ${courses.length}`);
  console.log(`👑 Admins: ${admins.length}`);
  console.log(`👨‍🎓 Students: ${students.length}`);
  console.log(`📊 Course Scores: ${courseScores.length}`);

  const scoreTypeCount: Record<string, number> = {};
  courseScores.forEach((score) => {
    scoreTypeCount[score.scoreType] =
      (scoreTypeCount[score.scoreType] || 0) + 1;
  });
  console.log("📈 Score type breakdown:");
  Object.entries(scoreTypeCount).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} scores`);
  });
}

main()
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
