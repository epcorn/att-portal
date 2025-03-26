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
    // Find the counter document for contract numbers
    let counter = await Counter.findById("contractCounter");

    // If the counter document does not exist, create it
    if (!counter) {
      counter = await new Counter({ _id: "contractCounter", seq: 1 }).save();
    }

    // Increment the counter and get the new sequence number
    counter = await Counter.findByIdAndUpdate(
      "contractCounter",
      { $inc: { seq: 1 } },
      { new: true }
    );

    // Get the current year
    const currentYear = new Date().getFullYear();
    let newContractNo = "";
    if (this.os) {
      newContractNo = `OS/PRE/${counter.seq}/${currentYear}`;
    } else {
      newContractNo = `PRE/${counter.seq}/${currentYear}`;
    }
    // Set the generated contract number on the current document
    this.contractNo = newContractNo;
    return this.save();
  } catch (error) {
    // Log the error and rethrow it
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
  } else {
    const currentContractNo = this.contractNo;
    // Process the existing quotationNo
    const parts = currentContractNo.split("/");
    let newContractNo;
    if (parts.length === 4 && parts[3].startsWith("R")) {
      // If already revised, increment the revision number
      const revisionNumber = parseInt(parts[3].substring(1)) + 1;
      parts[3] = `R${revisionNumber}`;
      newContractNo = parts.join("/");
    } else if (parts.length === 3) {
      // If first revision, add /R1
      newContractNo = `${currentContractNo}/R1`;
    } else {
      // Unexpected format, just append /R1
      newContractNo = `${currentContractNo}/R1`;
    }
    this.contractNo = newContractNo;
    console.log(newContractNo);
    return this.save();
  }
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
