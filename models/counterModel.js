import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, default: "quotationCounter" },
  seq: { type: Number, default: 2 },
});

const chemicalAndBatch = new mongoose.Schema({
  chemical: {
    type: String,
    required: true,
  },
  batchNos: [String],
});

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    default: {},
  },
});

const Groups = mongoose.model("Groups", groupSchema);
const Counter = mongoose.model("Counter", counterSchema);
const ChemicalBatchNos = mongoose.model("ChemicalBatchNos", chemicalAndBatch);

export { Counter, ChemicalBatchNos, Groups };
