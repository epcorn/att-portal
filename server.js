import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import multer from "multer";
import connectDB from "./config/mongooseConfig.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import rootRouter from "./routes/index.js";
import Quotation from "./models/quotationModel.js";
import Contract from "./models/contractModel.js";
import User, { createAdminUser } from "./models/userModel.js";

connectDB();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 10 * 1024 * 1024 },
});

const app = express();
// Make multer middleware available to route
app.locals.upload = upload;

//dev logging
if (process.env.NODE_ENV !== "production") {
  app.use(
    morgan(function (tokens, req, res) {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
      ].join(" ");
    })
  );
}

//Root Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//API Routes
app.use("/api/v1", rootRouter);

(function fn() {
  if (process.env.NODE_ENV === "production") {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, "/client/dist")));
    app.get("*", (req, res) =>
      res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"))
    );
  } else {
    app.get("/", (req, res) => {
      res.send("API is running....");
    });
  }
})();

//funtion to find out mismatch in direct contract and contractified contract tally.
async function getContractifiedIds() {
  try {
    // Fetch all quotation IDs where contractified is true
    const contractIds = await Quotation.find(
      { contractified: true },
      { _id: 1 }
    ).lean();
    const contractWithoutQuote = await Contract.find(
      { quotation: { $exists: true } },
      { quotation: 1 }
    ).lean();

    // Extract the ID values
    const contractIdSet = new Set(contractIds.map(({ _id }) => _id.toString()));
    const contractWithoutQuoteSet = new Set(
      contractWithoutQuote.map(({ quotation }) => quotation.toString())
    );

    // Find unique IDs
    const uniqueInContractIds = [...contractIdSet].filter(
      (id) => !contractWithoutQuoteSet.has(id)
    );
    const uniqueInContractWithoutQuote = [...contractWithoutQuoteSet].filter(
      (id) => !contractIdSet.has(id)
    );
    console.log("*************************");
    console.log(uniqueInContractIds);
    console.log("*************************");
    console.log(uniqueInContractWithoutQuote);
  } catch (error) {
    console.error("Error fetching contractified IDs:", error);
    throw error;
  }
}

createAdminUser();
app.use(errorMiddleware);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running at port: ${port}`));
