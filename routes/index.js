import { Router } from "express";
import userRoute from "./userRoute.js";
import quoteRoute from "./quoteRoute.js";
import contractRoute from "./contractRoute.js";
import correspondenceRoute from "./correspondenceRoute.js";
const router = Router();

router.use("/user", userRoute);
router.use("/quotation", quoteRoute);
router.use("/contract", contractRoute);
router.use("/correspondence", correspondenceRoute);
export default router;
