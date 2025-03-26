import mongoose from "mongoose";

const dcSchema = new mongoose.Schema(
  {
    dcCount: {
      type: Number,
    },
    dcObj: [
      {
        chemical: {
          type: String,
        },
        batchNo: {
          type: String,
        },
        chemicalqty: {
          type: String,
        },
        packaging: {
          type: String,
        },
      },
    ],
    entryBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const DC = mongoose.model("DC", dcSchema);

export default DC;
