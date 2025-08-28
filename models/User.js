// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // <--- Import bcryptjs

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    emailVerified: {
      // Used by NextAuth.js
      type: Date,
    },
    image: {
      // Used by NextAuth.js
      type: String,
    },
    password: {
      // For credentials provider
      type: String,
      // Make it required here if you're always creating users with passwords
      // or handle cases where it might be null/undefined for OAuth users
      required: true, // Typically, for credentials provider, password should be required
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// --- Add this pre-save hook ---
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10); // Hash with a salt round of 10
  }
  next(); // Continue with the save operation
});
// --- End of pre-save hook ---

// To prevent mongoose from trying to redefine the model if it already exists
// when hot reloading in development.
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
