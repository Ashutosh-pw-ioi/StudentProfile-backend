import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface JwtPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

const authStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.headers as { token?: string };    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: "No token, authorization denied" 
      });
      return;
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    const student = await prisma.student.findUnique({
      where: { id: decodedToken.id }
    });

    if (!student) {
      res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
      return;
    }

    if (decodedToken.role !== 'STUDENT') {
      res.status(403).json({ 
        success: false, 
        message: "Access denied. Student role required." 
      });
      return;
    }
    
    req.userId = decodedToken.id;
    req.userRole = decodedToken.role;
    next();
    
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
      return;
    }
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

const authTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.headers as { token?: string };    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: "No token, authorization denied" 
      });
      return;
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    const teacher = await prisma.teacher.findUnique({
      where: { id: decodedToken.id }
    });

    if (!teacher) {
      res.status(404).json({ 
        success: false, 
        message: "Teacher not found" 
      });
      return;
    }

    if (decodedToken.role !== 'TEACHER') {
      res.status(403).json({ 
        success: false, 
        message: "Access denied. Teacher role required." 
      });
      return;
    }
    
    req.userId = decodedToken.id;
        req.userRole = decodedToken.role;

    next();
    
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
      return;
    }
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

const authAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.headers as { token?: string };

    if (!token) {
       res.status(401).json({
        success: false,
        message: "No token, authorization denied"
      });
      return;
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const admin = await prisma.admin.findUnique({
      where: { id: decodedToken.id }
    });

    if (!admin) {
       res.status(404).json({
        success: false,
        message: "Admin not found"
      });
      return;
    }

    if (decodedToken.role !== 'ADMIN' && decodedToken.role !== 'SUPER_ADMIN') {
       res.status(403).json({
        success: false,
        message: "Access denied. Admin or Super Admin role required."
      });
      return;
    }

    req.userId = decodedToken.id;
    req.userRole = decodedToken.role;

    next();
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
       res.status(401).json({
        success: false,
        message: "Invalid token"
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error"
    });
    return;
  }
};

const authSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.headers as { token?: string };    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: "No token, authorization denied" 
      });
      return;
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    const superAdmin = await prisma.admin.findUnique({
      where: { id: decodedToken.id }
    });

    if (!superAdmin) {
      res.status(404).json({ 
        success: false, 
        message: "Super Admin not found" 
      });
      return;
    }

    if (decodedToken.role !== 'SUPER_ADMIN') {
      res.status(403).json({ 
        success: false, 
        message: "Access denied. Super Admin role required." 
      });
      return;
    }
    
    req.userId = decodedToken.id;
    req.userRole = decodedToken.role;

    next();
    
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
      return;
    }
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export { authStudent, authTeacher,authAdmin,authSuperAdmin };