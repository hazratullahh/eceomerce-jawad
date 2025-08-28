import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { categorySchema } from "@/validations/category";
import { z } from "zod";
import { translate } from "@/lib/translate";

export async function GET() {
  await dbConnect();
  try {
    const categories = await Category.find({});
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch categories", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const data = await req.json();
    console.log("Received data:", data); // Log incoming data for debugging
    const validatedData = categorySchema.parse(data);

    // Perform translations with delay to avoid rate limits
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const name_ar =
      validatedData.name.ar || (await translate(validatedData.name.en, "ar"));
    await delay(1000);

    const description = validatedData.description
      ? {
          en: validatedData.description.en || "",
          ar:
            validatedData.description.ar ||
            (await translate(validatedData.description.en || "", "ar")),
        }
      : { en: "", ar: "" };
    if (validatedData.description && !validatedData.description.ar)
      await delay(1000);

    // Ensure image has both url and public_id
    if (
      !validatedData.image ||
      !validatedData.image.url ||
      !validatedData.image.public_id
    ) {
      throw new Error(
        "Invalid image data: Both url and public_id are required."
      );
    }

    const categoryData = {
      ...validatedData,
      name: { en: validatedData.name.en, ar: name_ar },
      description,
    };

    // Check for existing category with the same name.en or name.ar
    const existingCategory = await Category.findOne({
      $or: [{ "name.en": validatedData.name.en }, { "name.ar": name_ar }],
    });
    if (existingCategory) {
      throw new Error("A category with this name already exists.");
    }

    const newCategory = new Category(categoryData);
    await newCategory.save();
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error:", {
      message: error.message,
      stack: error.stack,
      data: await req.json().catch(() => "Failed to parse request body"),
    });
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create category", error: error.message },
      { status: 500 }
    );
  }
}
