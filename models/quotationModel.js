import mongoose from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import { Counter, QuoteArchive } from "./index.js";

const quotationSchema = mongoose.Schema(
  {
    quotationNo: {
      type: String,
      default: null,
    },
    quotationDate: {
      type: Date,
    },
    kindAttention: {
      type: String,
    },
    kindAttentionPrefix: {
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
            contact: {
              type: String,
            },
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
    reference: [{ type: String }],
    shipToAddress: {
      projectName: String,
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
    emailTo: {
      type: String,
      default: "",
    },
    treatmentType: {
      type: String,
      default: "Anti-Termite Treatment",
    },
    specification: {
      type: String,
      enum: [
        "As per IS 6313 (Part 2):2013 & 2022",
        "As per IS 6313 (Part 2):2013",
      ],
      required: true,
    },
    equipments: {
      type: String,
      required: true,
      default:
        "Sprayers & Sprinklers will be used to ensure proper penetration of chemicals into the earth.",
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
    note: {
      type: String,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    contractified: {
      type: Boolean,
      default: false,
    },
    docType: {
      type: String,
      enum: ["standard", "supply/apply", "supply"],
      default: "standard",
    },
    groupBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    quoteInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuoteInfo" }],
  },
  { timestamps: true, toJSON: { virtual: true }, toObject: { virtual: true } }
);
quotationSchema.plugin(mongooseLeanVirtuals);

// Define the virtual property 'subject'
quotationSchema.virtual("subject").get(function () {
  return this.docType === "supply"
    ? "Supply Offer for Chemical as per your requirement."
    : `Pre Construction Anti Termite Treatment to your ${this.shipToAddress.projectName}`;
});
quotationSchema.virtual("archive", {
  ref: "QuoteArchive",
  localField: "_id",
  foreignField: "quotationId",
  justOne: true,
});

quotationSchema.pre("remove", async function (next) {
  const quoteHistory = await QuoteArchive.findOne({
    quotationNo: this.quotationNo,
  });
  if (quoteHistory) {
    await quoteHistory.deleteOne({ _id: quoteHistory._id });
  }
  next();
});
quotationSchema.methods.approve = async function () {
  this.approved = true;
  this.quotationDate = new Date();
  this.quotationNo = await this.constructor.generateQuotationNo();
  return this.save();
};

quotationSchema.methods.reviseQuotationNo = async function () {
  if (!this.approved) {
    return;
  }

  const currentQuotationNo = this.quotationNo;
  const parts = currentQuotationNo.split("/");

  let newQuotationNo;

  if (parts.length === 6 && parts[5].startsWith("R")) {
    // If already revised, increment the revision number
    const revisionNumber = parseInt(parts[5].substring(1)) + 1;
    parts[5] = `R${revisionNumber}`;
    newQuotationNo = parts.join("/");
  } else if (parts.length === 5) {
    // If first revision, add /R1
    newQuotationNo = `${currentQuotationNo}/R1`;
  } else {
    // Unexpected format, just append /R1
    newQuotationNo = `${currentQuotationNo}/R1`;
  }

  this.quotationNo = newQuotationNo;
  return this.save();
};

quotationSchema.statics.isApproved = async function (id) {
  const doc = await this.findById(id, "approved");
  return doc ? doc.approved : false;
};

quotationSchema.statics.generateQuotationNo = async function () {
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

    // Fetch the counter document
    let counter = await Counter.findById("quotationCounter");

    if (!counter) {
      // If counter doesn't exist, create it with seq = 2
      counter = await new Counter({
        _id: "quotationCounter",
        seq: 2, // Start from 2 as per requirement
        financialYear: financialYear,
      }).save();
    } else if (counter.financialYear !== financialYear) {
      // Reset counter if financial year has changed
      counter.seq = 2; // Start from 2
      counter.financialYear = financialYear;
      await counter.save();
    } else {
      // Increment the sequence if financial year is the same
      counter = await Counter.findByIdAndUpdate(
        "quotationCounter",
        { $inc: { seq: 1 } },
        { new: true }
      );
    }

    // Generate new quotation number
    const newQuoteNo = `EPPL/ATT/QTN/${financialYear}/${counter.seq}`;

    // Ensure uniqueness (rare case)
    const existingQuote = await this.findOne({ quotationNo: newQuoteNo });
    if (existingQuote) {
      return this.generateQuotationNo();
    }

    return newQuoteNo;
  } catch (error) {
    console.error("Error generating quotation number:", error);
    throw error;
  }
};

quotationSchema.pre("findOneAndDelete", async function (next) {
  try {
    // Get the document that is about to be deleted
    const doc = await this.model.findOne(this.getFilter());

    if (doc) {
      // Now we can use doc instead of this
      await mongoose
        .model("QuoteInfo")
        .deleteMany({ _id: { $in: doc.quoteInfo } });
      await mongoose.model("QuoteArchive").deleteOne({ quotationId: doc._id });
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Quotation = mongoose.model("Quotation", quotationSchema);
export default Quotation;
