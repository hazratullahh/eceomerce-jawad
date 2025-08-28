import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const { file } = await req.json();
    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    const uploadResponse = await cloudinary.uploader.upload(file, {
      upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      folder: "ecommerce-dashboard",
    });

    return NextResponse.json({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return NextResponse.json(
      { message: "Failed to upload image", error: error.message },
      { status: 500 }
    );
  }
}
