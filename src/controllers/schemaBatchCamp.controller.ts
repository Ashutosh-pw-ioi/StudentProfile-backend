import { Request, RequestHandler, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getStudentByContact = async (req: Request, res: Response) => {
  const { contactNumber } = req.body;

  if (!contactNumber) {
    res.status(400).json({ error: 'contactNumber is required' });
    return;
  }

  try {
    const student = await prisma.summerCampBatch.findUnique({
      where: { contactNumber },
      select: {
        studentName: true,
        courseName: true,
        contactNumber: true,
      },
    });

    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    res.status(200).json(student);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};
export default getStudentByContact;