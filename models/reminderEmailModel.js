import mongoose, { Mongoose } from "mongoose";

const reminderEmailSchema = new mongoose.Schema({
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quotation",
    required: true,
  },
  link: {
    type: String,
    default: "",
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contract",
  },
  emailCount: {
    type: Number,
    default: 0,
  },
  keepSending: {
    type: Boolean,
    default: true,
  },
  lost: {
    type: Boolean,
    default: false,
  },
  info: {
    type: String,
    default: "",
  },
  nextEmailDate: {
    type: Date,
    default: () => {
      const today = new Date();
      today.setDate(today.getDate() + 15); // Add 15 days to the current date
      return today;
    },
  },
  emailSend: {
    type: Boolean,
    default: false,
  },
});

const ReminderEmail = mongoose.model("ReminderEmail", reminderEmailSchema);

export default ReminderEmail;
