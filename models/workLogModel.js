import mongoose from "mongoose";

const workLogSchema = new mongoose.Schema(
  {
    workAreaType: {
      type: String,
      required: true,
    },
    areaTreated: {
      type: String,
      required: true,
    },
    areaTreatedUnit: {
      type: String,
      required: true,
    },
    chemical: {
      type: String,
      required: true,
    },
    chemicalUsed: {
      type: String,
      required: true,
    },
    remark: {
      type: String,
      required: false,
    },
    entryBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const WorkLogs = mongoose.model("WorkLogs", workLogSchema);

export default WorkLogs;
