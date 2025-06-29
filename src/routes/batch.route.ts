import { Router } from "express";
import { createBatch, deleteBatch, getBatchesByCenter, updateBatch } from "../controllers/batch.controller.js";
import { authAdmin } from "../middlewares/auth.middleware.js";


const batchRouter = Router();

batchRouter.post("/create",authAdmin, createBatch);
batchRouter.get("/all",authAdmin, getBatchesByCenter);
batchRouter.put("/update",authAdmin, updateBatch);
batchRouter.delete("/delete",authAdmin, deleteBatch);

export default batchRouter;
