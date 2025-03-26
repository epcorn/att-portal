import express from "express";
import {
  addFileToCorrespondence,
  getCorrespondence,
  updateFile,
  deleteFile,
  deleteCorrespondence,
} from "../controller/correspondenceController.js";

import { verifyToken } from "../middleware/verifyUser.js";

const router = express.Router();

router.post(
  "/files",
  (req, res, next) => {
    req.app.locals.upload.single("file")(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "File uplad error", error: err.message });
      }
      next();
    });
  },
  verifyToken,
  addFileToCorrespondence
);

router.post("/get", getCorrespondence);

router.put("/:correspondenceId/files/:direction/:publicId", updateFile);

router.post("/:correspondenceId/delete/file", deleteFile);

router.delete("/:correspondenceId", deleteCorrespondence);

export default router;
