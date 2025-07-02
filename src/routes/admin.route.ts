import express from "express";
import {
  listCenterDepartments,
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from "../controllers/admin.controller.js";
import { authSuperAdmin } from "../middlewares/auth.middleware.js";

const adminRouter = express.Router();

adminRouter.get("/departments",authSuperAdmin, listCenterDepartments);
adminRouter.post("/create",authSuperAdmin, createAdmin);
adminRouter.get("/all",authSuperAdmin, getAllAdmins);
adminRouter.post("/get", getAdminById);
adminRouter.put("/update",authSuperAdmin, updateAdmin);
adminRouter.delete("/delete",authSuperAdmin, deleteAdmin);

export default adminRouter;
