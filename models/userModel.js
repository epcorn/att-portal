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

// --- New function to create admin user ---
/**
 * Creates a default admin user if one does not already exist.
 * This function should ideally be called once during application startup
 * or initialization (e.g., in your app.js or server.js file).
 */
export async function createAdminUser() {
  const adminUsername = "Chirag Notani";
  const adminPassword = "12345";

  try {
    const existingAdmin = await User.findOne({ username: adminUsername }); // This finds the user

    if (existingAdmin) {
      console.log(`Admin user "${adminUsername}" already exists.`); // This branch is correct
      return existingAdmin;
    }

    // IF IT REACHES HERE, it means existingAdmin was NOT found initially
    const newAdmin = new User({
      username: adminUsername,
      prefix: "Mr.",
      password: adminPassword,
      rights: {
        /* ... */
      },
      active: true,
    });

    await newAdmin.save(); // <--- THE ACTUAL DB INSERT HAPPENS HERE
    console.log(`Admin user "${adminUsername}" created successfully!`); // <--- THIS LOGS ON SUCCESS
    return newAdmin;
  } catch (error) {
    console.error(
      `Error creating admin user "${adminUsername}":`,
      error.message
    ); // <--- THIS LOGS ON ERROR
    throw error;
  }
}
createAdminUser();

export default User;
