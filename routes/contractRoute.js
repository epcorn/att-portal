import { Router } from "express";
import {
  contracts,
  create,
  contractify,
  singleContract,
  update,
  approve,
  printCount,
  docData,
  createDC,
  createWorklog,
  getWorklogs,
  getDCs,
  addBatchNumber,
  addChemical,
  deleteBatchNumber,
  deleteChemical,
  getChemical,
  deletedContract,
  getArchive,
  genReport,
  genMonthlyReport,
  dashboardData,
} from "../controller/contractController.js";
import { verifyToken } from "../middleware/verifyUser.js";

const router = Router();

router.post("/create", verifyToken, create);
router.get("/dashboard", verifyToken, dashboardData);
router.get("/create/:id", verifyToken, contractify);
router.get("/getContracts", verifyToken, contracts);
router.get("/approve/:id", verifyToken, approve);
router.get("/print/:id", verifyToken, printCount);
router.get("/docx/:id", verifyToken, docData);
router.post("/:id/dc/create", verifyToken, createDC);
router.post("/:id/worklog/create", verifyToken, createWorklog);
router.get("/worklog/:id", verifyToken, getWorklogs);
router.get("/dc/:id", verifyToken, getDCs);
router.get("/chemical", getChemical);
router.post("/chemical", addChemical);
router.put("/chemical/:chemicalId/batch", addBatchNumber);
router.delete("/chemical/:chemicalId/batch", deleteBatchNumber);
router.delete("/chemical/:chemicalId", deleteChemical);
router.get("/:id", verifyToken, singleContract);
router.post("/:id", verifyToken, update);
router.delete("/:contractId", verifyToken, deletedContract);
router.get("/archive/:id", verifyToken, getArchive);
router.get("/reports/r1", verifyToken, genReport);
router.get("/automated/reports/r1", verifyToken, genMonthlyReport);
export default router;
