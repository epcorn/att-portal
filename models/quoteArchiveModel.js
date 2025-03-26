import mongoose from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

const quoteArchiveSchema = mongoose.Schema({
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  revisions: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      state: {
        type: Object,
        required: true,
      },
      message: {
        type: String,
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      changes: {
        type: [String],
        default: [],
      },
    },
  ],
});
// Custom validator to ensure either quotationId or contractId is provided
quoteArchiveSchema.path("quotationId").validate(function (value) {
  return value || this.contractId;
}, "Either quotationId or contractId is required.");

quoteArchiveSchema.path("contractId").validate(function (value) {
  return value || this.quotationId;
}, "Either quotationId or contractId is required.");

quoteArchiveSchema.plugin(mongooseLeanVirtuals);

quoteArchiveSchema.set("toObject", { virtuals: true });
quoteArchiveSchema.set("toJSON", { virtuals: true });

const QuoteArchive = mongoose.model("QuoteArchive", quoteArchiveSchema);

export default QuoteArchive;
