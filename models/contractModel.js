import mongoose from "mongoose";
import { Counter } from "./index.js";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

const contractSchema = mongoose.Schema(
  {
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
    },
    os: {
      type: Boolean,
      default: false,
    },
    contractDate: {
      type: Date,
      default: null,
    },
    contractNo: {
      type: String,
    },
    billToAddress: {
      prefix: {
        type: String,
        enum: ["M/s.", "Mr.", "Mrs.", "Miss."],
        default: "M/s.",
      },
      name: String,
      a1: String,
      a2: String,
      a3: String,
      a4: String,
      a5: String,
      a6: String,
      city: String,
      pincode: String,
      kci: {
        type: [
          {
            name: {
              type: String,
            },
            designation: {
              type: String,
            },
            contact: { type: String },
            email: {
              type: String,
              set: (value) => {
                if (value === "") return "";
                return value.trim().toLowerCase();
              },
            },
          },
        ],
      },
    },
    shipToAddress: {
      projectName: String,
      a1: String,
      a2: String,
      a3: String,
      a4: String,
      a5: String,
      city: String,
      pincode: String,
      kci: {
        type: [
          {
            name: {
              type: String,
            },
            designation: {
              type: String,
            },
            contact: { type: String },
            email: {
              type: String,
              set: (value) => {
                if (value === "") return "";
                return value.trim().toLowerCase();
              },
            },
          },
        ],
      },
    },
    paymentTerms: {
      type: String,
      default: "Within 15 days from the date of submission of bill.",
    },
    taxation: {
      type: String,
      default: "GST @ 18% As Applicable.",
    },
    salesPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    docType: {
      type: String,
      enum: ["standard", "supply/apply", "supply"],
      default: "standard",
    },
    printCount: {
      type: Number,
      default: 0,
    },
    workOrderNo: { type: String, default: "" },
    workOrderDate: { type: Date, default: "" },
    gstNo: {
      type: String,
      default: "",
      set: (value) => {
        if (value === "") return "";
        return value.trim().toUpperCase();
      },
    },
    quoteInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuoteInfo" }],
    dcs: [{ type: mongoose.Schema.Types.ObjectId, ref: "DC" }],
    worklogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "WorkLogs" }],
    note: {
      type: String,
    },
    groupBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    warranty: { type: mongoose.Schema.ObjectId, ref: "Warranty" },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
contractSchema.plugin(mongooseLeanVirtuals);

contractSchema.virtual("archive", {
  ref: "QuoteArchive",
  localField: "_id",
  foreignField: "contractId",
  justOne: true,
});

contractSchema.virtual("workLog", {
  ref: "WorkLog",
  localField: "_id",
  foreignField: "contractId",
  justOne: true,
});

// Set the virtual property to be populated by default
contractSchema.set("toObject", { virtuals: true });
contractSchema.set("toJSON", { virtuals: true });

//######Uncomment contractDate for automatic No###########
contractSchema.methods.approve = async function () {
  this.approved = true;
  this.contractDate = new Date();
  return this.save();
};
contractSchema.methods.generateContractNo = async function () {
  try {
    // Get current date and determine financial year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-based

    let startYear, endYear;
    if (currentMonth >= 4) {
      startYear = currentYear;
      endYear = currentYear + 1;
    } else {
      startYear = currentYear - 1;
      endYear = currentYear;
    }
    const financialYear = `${startYear}-${endYear.toString().slice(-2)}`;

    // Find the counter document for contract numbers
    let counter = await Counter.findById("contractCounter");

    // If the counter document does not exist, create it
    if (!counter) {
      // If counter doesn't exist, create it with seq = 2
      counter = await new Counter({
        _id: "contractCounter",
        seq: 2,
        financialYear: financialYear,
      }).save();
    } else if (counter.financialYear !== financialYear) {
      counter.seq = 2;
      counter.financialYear = financialYear;
      await counter.save();
    } else {
      counter = await Counter.findByIdAndUpdate(
        "quotationCounter",
        { $inc: { seq: 1 } },
        { new: true }
      );
    }

    let newContractNo = "";
    if (this.os) {
      newContractNo = `OS/PRE/${financialYear}/${counter.seq}`;
    } else {
      newContractNo = `PRE/${financialYear}/${counter.seq}`;
    }
    // Set the generated contract number on the current document
    this.contractNo = newContractNo;
    return this.save();
  } catch (error) {
    console.error("Error generating contract number:", error);
    throw error;
  }
};

contractSchema.methods.incPrintCount = async function () {
  this.printCount = this.printCount + 1;
  return this.save();
};

contractSchema.statics.isApproved = async function (id) {
  const doc = await this.findById(id, "approved");
  return doc ? doc.approved : false;
};

contractSchema.methods.reviseContractNo = async function () {
  if (!this.approved) {
    return;
  }

  const currentContractNo = this.contractNo;
  const parts = currentContractNo.split("/");

  const hasOSPrefix = parts.length === 3 ? false : parts[0] === "OS";
  const revisionIndex = hasOSPrefix ? 4 : 3;

  if (parts.length > revisionIndex && parts[revisionIndex].startsWith("R")) {
    const revisionNumber = parseInt(parts[revisionIndex].substring(1)) + 1;
    parts[revisionIndex] = `R${revisionNumber}`;
  } else {
    parts.splice(revisionIndex, 0, "R1");
  }

  this.contractNo = parts.join("/");
  return this.save();
};

contractSchema.pre("findOneAndDelete", async function (next) {
  try {
    // Get the document that is about to be deleted
    const doc = await this.model.findOne(this.getFilter());

    if (doc) {
      // Now we can use doc instead of this
      await mongoose
        .model("QuoteInfo")
        .deleteMany({ _id: { $in: doc.quoteInfo } });
      await mongoose.model("DC").deleteMany({ _id: { $in: doc.dcs } });
      await mongoose
        .model("WorkLogs")
        .deleteMany({ _id: { $in: doc.worklogs } });
      await mongoose.model("QuoteArchive").deleteOne({ contractId: doc._id });
      await mongoose.model("WorkLogs").deleteOne({ contractId: doc._id });

      if (doc.quotation) {
        await mongoose.model("Quotation").deleteOne({ _id: doc.quotation });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Contract = mongoose.model("Contract", contractSchema);
export default Contract;
