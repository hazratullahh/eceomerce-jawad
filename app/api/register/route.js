// app/api/register/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Zod schema for server-side validation
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request) {
  await dbConnect(); // Ensure connection to MongoDB

  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const { name, email, password } = validatedData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ message: "Email already exists" }),
        {
          status: 409, // Conflict
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (default role will be 'USER' from schema)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      // role defaults to 'USER' as defined in models/User.js
      // emailVerified will be null by default
    });

    // Return a successful response (do not send password back)
    return new NextResponse(
      JSON.stringify({
        message: "User registered successfully",
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      }),
      {
        status: 201, // Created
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Zod validation errors
      return new NextResponse(JSON.stringify({ errors: error.errors }), {
        status: 400, // Bad Request
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Registration API error:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
