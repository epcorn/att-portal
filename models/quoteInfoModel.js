import mongoose from "mongoose";

const quoteInfoSchema = mongoose.Schema({
  workAreaType: {
    type: String,
    enum: [
      "Basement Area",
      "Basement Area (Horizontal)",
      "Basement Area (Vertical)",
      "Retaining Wall",
      "Raft",
      "Plinth",
      "Periphery",
      "Floor",
    ],
    required: true,
  },
  workArea: {
    type: String,
    default: null,
  },
  workAreaUnit: {
    type: String,
    enum: ["Sq.fts", "Sq.mts", "R.fts", "R.mts"],
    validate: {
      validator: function (v) {
        return v === null || this.workArea !== null;
      },
      message: (props) =>
        `${props.value} is required when workArea is provided!`,
    },
    default: null,
  },
  chemicalRate: {
    type: String,
    default: null,
  },
  chemicalRateUnit: {
    type: String,
    enum: ["Per Ltr.", "Lumpsum"],
    validate: {
      validator: function (v) {
        return v === null || this.chemicalRate !== null;
      },
      message: (props) =>
        `${props.value} is required when chemicalRate is provided!`,
    },
    default: null,
  },
  serviceRate: {
    type: String,
    default: null,
  },
  serviceRateUnit: {
    type: String,
    enum: ["Per Sq.ft", "Per Sq.mt", "Per R.ft", "Per R.mt", "Lumpsum"],
    default: null,
    validate: {
      validator: function (v) {
        return v === null || this.serviceRate !== null;
      },
      message: (props) =>
        `${props.value} is required when serviceRate is provided!`,
    },
  },
  applyRate: {
    type: String,
    default: null,
  },
  applyRateUnit: {
    type: String,
    enum: ["Per Sq.ft", "Per Sq.mt", "Per R.ft", "Per R.mt", "Lumpsum"],
    default: null,
    validate: {
      validator: function (v) {
        return v === null || this.applyRate !== null;
      },
      message: (props) =>
        `${props.value} is required when applyRate is provided!`,
    },
  },
  chemical: {
    type: String,
    required: true,
  },
  chemicalQuantity: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
});

const QuoteInfo = mongoose.model("QuoteInfo", quoteInfoSchema);

export default QuoteInfo;
