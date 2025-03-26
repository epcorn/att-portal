import mongoose from "mongoose";

// Reusable file schema with enhanced metadata
const fileSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Cloudinary URL is required"],
      match: [/^https?:\/\/(.*?)\.cloudinary\.com\//, "Invalid Cloudinary URL"],
    },
    publicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
    },
    resourceType: {
      type: String,
      required: [true, "Resource type is requried for deletion"],
    },
    title: {
      type: String,
      required: [true, "Document title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      default: "general",
    },
    sender: {
      name: { type: String, required: [true, "Sender name is required"] },
      designation: String,
      organization: String,
      contact: {
        email: {
          type: String,
          lowercase: true,
          match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        },
        phone: {
          type: String,
          match: [
            /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
            "Invalid phone number",
          ],
        },
      },
    },
    tags: {
      type: String,
    },
    uploadedBy: {
      type: String,
      required: [true, "Uploader name is required"],
    },
    fileType: {
      type: String,
      enum: ["pdf", "doc", "docx", "xlsx", "image", "other"],
      default: "pdf",
    },
  },
  { _id: false, versionKey: false, timestamps: true }
);

// Main correspondence schema with enhanced validation
const correspondenceSchema = new mongoose.Schema(
  {
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      index: true,
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      index: true,
    },
    outward: {
      files: [fileSchema],
    },
    inward: {
      files: [fileSchema],
    },
  },
  {
    timestamps: true,
    validateBeforeSave: true,
  }
);

// Virtual for combined files view
correspondenceSchema.virtual("allFiles").get(function () {
  return [...(this.inward?.files || []), ...(this.outward?.files || [])];
});

// Validation for document association
correspondenceSchema.pre("validate", function (next) {
  if (!this.quotation && !this.contract) {
    this.invalidate(
      "quotation",
      "Must be associated with a Quotation or Contract"
    );
  }
  next();
});

// Auto-population middleware
// correspondenceSchema.pre(/^find/, function (next) {
//   this.populate("uploadedBy", "name email");
//   next();
// });

const Correspondence = mongoose.model("Correspondence", correspondenceSchema);
export default Correspondence;
