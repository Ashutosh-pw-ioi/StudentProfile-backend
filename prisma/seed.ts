import { prisma } from "../src/db/prisma.js";
import bcrypt from "bcryptjs";

const hash = (pwd: string) => bcrypt.hashSync(pwd, 10); 

async function main() {
  await prisma.batch.createMany({
    data: [
      { id: "11111111-1111-1111-1111-111111111111", name: "Batch A" },
      { id: "22222222-2222-2222-2222-222222222222", name: "Batch B" },
      { id: "33333333-3333-3333-3333-333333333333", name: "Batch C" },
      { id: "44444444-4444-4444-4444-444444444444", name: "Batch D" },
      { id: "55555555-5555-5555-5555-555555555555", name: "Batch E" },
    ],
  });

  await prisma.teacher.createMany({
    data: [
      {
        id: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
        name: "Ajay Sharma",
        email: "ajay.sharma@example.com",
        password: hash("password123"),
      },
      {
        id: "bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2",
        name: "Bhavna Patel",
        email: "bhavna.patel@example.com",
        password: hash("password123"),
      },
      {
        id: "ccccccc3-cccc-cccc-cccc-ccccccccccc3",
        name: "Chirag Singh",
        email: "chirag.singh@example.com",
        password: hash("password123"),
      },
      {
        id: "ddddddd4-dddd-dddd-dddd-ddddddddddd4",
        name: "Divya Iyer",
        email: "divya.iyer@example.com",
        password: hash("password123"),
      },
      {
        id: "eeeeeee5-eeee-eeee-eeee-eeeeeeeeeee5",
        name: "Ethan D’Souza",
        email: "ethan.dsouza@example.com",
        password: hash("password123"),
      },
    ],
  });

  await prisma.admin.createMany({
    data: [
      {
        id: "99999991-1111-1111-1111-111111111111",
        name: "Rohan Kapoor",
        email: "rohan.k@example.com",
        password: hash("admin123"),
        role: "ADMIN",
      },
      {
        id: "99999992-2222-2222-2222-222222222222",
        name: "Sara Mehta",
        email: "sara.m@example.com",
        password: hash("super123"),
        role: "SUPER_ADMIN",
      },
      {
        id: "99999993-3333-3333-3333-333333333333",
        name: "Vikram Rao",
        email: "vikram.r@example.com",
        password: hash("mod123"),
        role: "MODERATOR",
      },
      {
        id: "99999994-4444-4444-4444-444444444444",
        name: "Pooja Desai",
        email: "pooja.d@example.com",
        password: hash("admin123"),
        role: "ADMIN",
      },
      {
        id: "99999995-5555-5555-5555-555555555555",
        name: "Arjun Nair",
        email: "arjun.n@example.com",
        password: hash("admin123"),
        role: "ADMIN",
      },
    ],
  });

  await prisma.student.createMany({
    data: [
      {
        id: "66666661-1111-1111-1111-111111111111",
        name: "Anita Verma",
        email: "anita.verma@example.com",
        enrollmentNumber: "2301010001",
        password: hash("student123"),
        deviceId: "dev-A01",
        batchId: "11111111-1111-1111-1111-111111111111",
      },
      {
        id: "66666662-2222-2222-2222-222222222222",
        name: "Bharat Singh",
        email: "bharat.singh@example.com",
        enrollmentNumber: "2301010002",
        password: hash("student123"),
        batchId: "22222222-2222-2222-2222-222222222222",
      },
      {
        id: "66666663-3333-3333-3333-333333333333",
        name: "Chetna Patel",
        email: "chetna.patel@example.com",
        enrollmentNumber: "2301010003",
        password: hash("student123"),
        deviceId: "dev-C03",
        batchId: "33333333-3333-3333-3333-333333333333",
      },
      {
        id: "66666664-4444-4444-4444-444444444444",
        name: "Deepak Kumar",
        email: "deepak.kumar@example.com",
        enrollmentNumber: "2301010004",
        password: hash("student123"),
        batchId: "44444444-4444-4444-4444-444444444444",
      },
      {
        id: "66666665-5555-5555-5555-555555555555",
        name: "Esha Thomas",
        email: "esha.thomas@example.com",
        enrollmentNumber: "2301010005",
        password: hash("student123"),
        deviceId: "dev-E05",
        batchId: "55555555-5555-5555-5555-555555555555",
      },
    ],
  });

  await prisma.class.createMany({
    data: [
      {
        id: "77777771-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
        subject: "Mathematics",
        batchId: "11111111-1111-1111-1111-111111111111",
        teacherId: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
        day: "MONDAY",
        startTime: "09:00",
        endTime: "10:00",
      },
      {
        id: "77777772-bbbb-bbbb-bbbb-bbbbbbbbbbb2",
        subject: "Physics",
        batchId: "22222222-2222-2222-2222-222222222222",
        teacherId: "bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2",
        day: "TUESDAY",
        startTime: "10:00",
        endTime: "11:00",
      },
      {
        id: "77777773-cccc-cccc-cccc-ccccccccccc3",
        subject: "Chemistry",
        batchId: "33333333-3333-3333-3333-333333333333",
        teacherId: "ccccccc3-cccc-cccc-cccc-ccccccccccc3",
        day: "WEDNESDAY",
        startTime: "11:15",
        endTime: "12:15",
      },
      {
        id: "77777774-dddd-dddd-dddd-ddddddddddd4",
        subject: "Biology",
        batchId: "44444444-4444-4444-4444-444444444444",
        teacherId: "ddddddd4-dddd-dddd-dddd-ddddddddddd4",
        day: "THURSDAY",
        startTime: "13:00",
        endTime: "14:00",
      },
      {
        id: "77777775-eeee-eeee-eeee-eeeeeeeeeee5",
        subject: "English",
        batchId: "55555555-5555-5555-5555-555555555555",
        teacherId: "eeeeeee5-eeee-eeee-eeee-eeeeeeeeeee5",
        day: "FRIDAY",
        startTime: "14:15",
        endTime: "15:15",
      },
    ],
  });
}

main()
  .then(() => {
    console.log("✅ Dummy data inserted successfully.");
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error("❌ Error inserting seed data:", e);
    prisma.$disconnect();
    process.exit(1);
  });
