import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};
async function main() {
    const adminPass = await hashPassword('admin123');
    const superAdminPass = await hashPassword('superadmin123');
    const moderatorPass = await hashPassword('moderator123');
    const teacherPass = await hashPassword('teacher123');
    const studentPass = await hashPassword('student123');
    let teacherCounter = 1;
    let studentCounter = 1;
    let enrollmentCounter = 1;
    const formatEnrollment = (year, dep, branch) => {
        const num = String(enrollmentCounter++).padStart(4, '0');
        return `${year}${dep}${branch}${num}`;
    };
    const scoreTypes = [
        { code: 'FORTNIGHTLY TEST 1', name: 'FORTNIGHTLY_TEST' },
        { code: 'ASSIGNMENT 3', name: 'ASSIGNMENT' },
        { code: 'MID_SEM 1', name: 'MID_SEM' },
        { code: 'INTERVIEW 2', name: 'INTERVIEW' },
    ];
    const centersData = [
        {
            name: 'Bangalore',
            departments: [
                { name: 'SOT', batches: ['SOT23B1', 'SOT24B1', 'SOT24B2'] },
                { name: 'SOM', batches: ['SOM23B1', 'SOM24B1'] },
            ],
        },
        {
            name: 'Pune',
            departments: [
                { name: 'SOT', batches: ['SOT25B1', 'SOT25B2'] },
                { name: 'SOM', batches: ['SOM25B1', 'SOM25B2'] },
                { name: 'SOH', batches: ['SOH25B1', 'SOH25B2'] },
            ],
        },
        {
            name: 'Lucknow',
            departments: [
                { name: 'SOT', batches: ['SOT25B1', 'SOT25B2'] },
                { name: 'SOM', batches: ['SOM25B1', 'SOM25B2'] },
            ],
        },
        {
            name: 'Patna',
            departments: [
                { name: 'SOT', batches: ['SOT25B1', 'SOT25B2'] },
                { name: 'SOM', batches: ['SOM25B1', 'SOM25B2'] },
            ],
        },
        {
            name: 'Noida',
            departments: [
                { name: 'SOT', batches: ['SOT25B1', 'SOT25B2'] },
                { name: 'SOM', batches: ['SOM25B1', 'SOM25B2'] },
                { name: 'SOH', batches: ['SOH25B1', 'SOH25B2'] },
            ],
        },
        {
            name: 'Indore',
            departments: [
                { name: 'SOT', batches: ['SOT25B1', 'SOT25B2'] },
                { name: 'SOM', batches: ['SOM25B1', 'SOM25B2'] },
            ],
        },
    ];
    const allCenters = [];
    for (const center of centersData) {
        const centerData = await prisma.center.create({
            data: {
                name: center.name,
                location: `${center.name}`,
            },
        });
        allCenters.push(centerData);
        await prisma.admin.create({
            data: {
                name: `Admin - ${center.name}`,
                email: `admin-${center.name.toLowerCase()}@pwioi.com`,
                password: adminPass,
                role: 'ADMIN',
                centerId: centerData.id,
            },
        });
        for (const dept of center.departments) {
            const departmentData = await prisma.department.create({
                data: {
                    name: dept.name,
                    centerId: centerData.id,
                },
            });
            for (const batchName of dept.batches) {
                const batchData = await prisma.batch.create({
                    data: {
                        name: batchName,
                        departmentId: departmentData.id,
                    },
                });
                const semesterCount = dept.name === 'SOT' ? 8 : 6;
                const semesters = await Promise.all(Array.from({ length: semesterCount }).map((_, idx) => prisma.semester.create({
                    data: {
                        number: idx + 1,
                        batchId: batchData.id,
                    },
                })));
                // Create courses
                const courses = await Promise.all(semesters.flatMap((semester) => Array.from({ length: 3 }).map((_, idx) => prisma.course.create({
                    data: {
                        name: `Course${idx + 1}`,
                        code: `C${idx + 1}${batchName}S${semester.number}`,
                        credits: 3,
                        semesterId: semester.id,
                    },
                }))));
                // Create teachers connected to batches and courses
                const teachers = await Promise.all(courses.map(async (course) => {
                    const currentTeacherId = teacherCounter++;
                    const teacher = await prisma.teacher.create({
                        data: {
                            name: `Teacher${currentTeacherId}`,
                            email: `teacher${currentTeacherId}@pwioi.com`,
                            password: teacherPass,
                            gender: 'Male',
                            phoneNumber: `99999999${currentTeacherId}`,
                            experience: 5,
                            centerId: centerData.id,
                            departmentId: departmentData.id,
                            courses: {
                                connect: { id: course.id },
                            },
                            batches: {
                                connect: { id: batchData.id },
                            },
                        },
                    });
                    return teacher;
                }));
                // Create students
                const students = await Promise.all(Array.from({ length: 5 }).map(async () => {
                    const currentStudentId = studentCounter++;
                    return prisma.student.create({
                        data: {
                            name: `Student${currentStudentId}`,
                            email: `student${currentStudentId}@pwioi.com`,
                            gender: 'Female',
                            phoneNumber: `88888888${currentStudentId}`,
                            enrollmentNumber: formatEnrollment(23, dept.name === 'SOT' ? '01' : dept.name === 'SOM' ? '02' : '03', center.name.substring(0, 2).toUpperCase()),
                            password: studentPass,
                            semesterNo: semesters.length,
                            centerId: centerData.id,
                            departmentId: departmentData.id,
                            batchId: batchData.id,
                            courses: {
                                connect: courses.map((c) => ({ id: c.id })),
                            },
                        },
                    });
                }));
                // Create course scores
                for (const student of students) {
                    for (const course of courses) {
                        for (const scoreType of scoreTypes) {
                            await prisma.courseScore.create({
                                data: {
                                    marksObtained: Math.floor(Math.random() * 40) + 60,
                                    totalObtained: 100,
                                    dateOfExam: new Date(),
                                    scoreType: scoreType.code,
                                    name: scoreType.name,
                                    gradedAt: new Date(),
                                    studentId: student.id,
                                    courseId: course.id,
                                },
                            });
                        }
                    }
                }
            }
        }
    }
    // ✅ Create SuperAdmin and Moderator assigned to the first center
    const firstCenter = allCenters[0];
    await prisma.admin.create({
        data: {
            name: 'SuperAdmin',
            email: 'superadmin@pwioi.com',
            password: superAdminPass,
            role: 'SUPER_ADMIN',
            centerId: firstCenter.id,
        },
    });
    await prisma.admin.create({
        data: {
            name: 'Moderator',
            email: 'moderator@pwioi.com',
            password: moderatorPass,
            role: 'MODERATOR',
            centerId: firstCenter.id,
        },
    });
    console.log('✅ Seeding completed successfully!');
}
main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
    console.error('❌ Seeding failed: ', e);
    prisma.$disconnect();
    process.exit(1);
});
