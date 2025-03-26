import mongoose from "mongoose";
import bcrypt from "bcrypt";

const prefixEnum = [
  "Mr.",
  "Mrs.",
  "Ms.",
  "Miss",
  "Master",
  "Dr.",
  "Rev.",
  "Prof.",
  "Hon.",
  "Sir",
];
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  prefix: { type: String, enum: prefixEnum, required: true },
  initials: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
  },
  rights: {
    type: Object,
    required: true,
    default: {
      createQuote: false,
      createContract: false,
      genCard: false,
      workLogUpdate: false,
      approve: false,
      admin: false,
    },
  },
  active: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre("save", async function encryptPass(next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
