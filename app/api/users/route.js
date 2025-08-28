export const dynamic = "force-dynamic";
// app/api/users/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect"; // Ensure this function connects to DB
import User from "@/models/User";
import { getAuthSession } from "@/lib/getAuthSession";

// Ensure Mongoose models are compiled only once (important for hot-reloading)
import "../../../models/User";

export async function GET(request) {
  try {
    const session = await getAuthSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search") || "";

    // --- FIX IS HERE ---
    await dbConnect(); // <--- Await the result of calling dbConnect()
    // --- END FIX ---

    let query = {};
    if (searchTerm) {
      query = {
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query).select("-password");
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getAuthSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // --- FIX IS HERE ---
    await dbConnect(); // <--- Await the result of calling dbConnect()
    // --- END FIX ---

    const body = await request.json();

    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    if (!["USER", "ADMIN"].includes(body.role)) {
      return NextResponse.json(
        { message: "Invalid role provided" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
