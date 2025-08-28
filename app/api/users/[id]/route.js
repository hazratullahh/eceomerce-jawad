export const dynamic = "force-dynamic";
// app/api/users/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getAuthSession } from "@/lib/getAuthSession";
import bcrypt from "bcryptjs";

// Ensure Mongoose models are compiled only once
import "../../../../models/User";

// PUT /api/users/[id] - Update a user by ID
export async function PUT(request, { params }) {
  // `params` is available here
  try {
    const session = await getAuthSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // --- FIX IS HERE ---
    const { id } = await params; // Await params here
    // --- END FIX ---

    await dbConnect();
    const body = await request.json();

    const updateFields = {
      name: body.name,
      email: body.email,
      role: body.role,
    };

    if (body.password) {
      updateFields.password = await bcrypt.hash(body.password, 10);
    }

    if (!updateFields.name || !updateFields.email || !updateFields.role) {
      return NextResponse.json(
        { message: "Missing required fields for update" },
        { status: 400 }
      );
    }
    if (!["USER", "ADMIN"].includes(updateFields.role)) {
      return NextResponse.json(
        { message: "Invalid role provided" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error); // Still use params.id for logging
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user by ID
export async function DELETE(request, { params }) {
  // `params` is available here
  try {
    const session = await getAuthSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // --- FIX IS HERE ---
    const { id } = await params; // Await params here
    // --- END FIX ---

    await dbConnect();

    if (session.user.id === id) {
      return NextResponse.json(
        { message: "Cannot delete your own admin account" },
        { status: 403 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    // In the error log, you can still use the `params` object from the function signature
    // as it's the original object passed by Next.js. The issue is with accessing its properties
    // *before* awaiting it for consistency checks.
    console.error(`Error deleting user ${params.id}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
