import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
} from "../controllers/course.controller.js";
import { authAdmin } from "../middlewares/auth.middleware.js";

const courseRouter = Router();

courseRouter.post("/create",authAdmin, createCourse);
courseRouter.get("/all",authAdmin, getAllCourses);
courseRouter.get("/:id",authAdmin, getCourseById);
courseRouter.put("/update",authAdmin, updateCourse);
courseRouter.delete("/delete",authAdmin, deleteCourse);

export default courseRouter;
