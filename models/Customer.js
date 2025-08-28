// models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amountWillPay: {
      type: Number,
      required: true,
      min: [700, "Amount to pay must be at least $700"],
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
    referralCount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "referralCount must be an integer",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);

export default Customer;
