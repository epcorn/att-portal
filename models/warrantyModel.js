import mongoose from "mongoose";

const warrantySchema = mongoose.Schema(
  {
    warrantyPeriod: {
      from: {
        type: Date,
      },
      to: {
        type: Date,
      },
    },
    warrantyDetails: [
      {
        chemicalName: {
          type: String,
        },
        areaTreated: {
          area: {
            type: String,
          },
          unit: {
            type: String,
          },
        },
        structureType: {
          type: String,
        },
      },
    ],
    warrantyNo: {
      type: String,
    },
  },
  { timestamps: true }
);

const Warranty = mongoose.model("Warranty", warrantySchema);

export default Warranty;
