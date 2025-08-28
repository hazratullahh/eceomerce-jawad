import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import cloudinary from "@/lib/cloudinary";
import { categorySchema } from "@/validations/category";
import { z } from "zod";
import { translate } from "@/lib/translate";

export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const data = await req.json();
    const validatedData = categorySchema.parse(data);

    // Fetch existing category to compare fields
    const existingCategory = await Category.findById(params.categoryId);
    if (!existingCategory) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Perform translations with delay to avoid rate limits
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const name_ar =
      validatedData.name.ar &&
      validatedData.name.ar !== existingCategory.name.ar
        ? validatedData.name.ar
        : validatedData.name.en !== existingCategory.name.en
        ? await translate(validatedData.name.en, "ar")
        : existingCategory.name.ar;
    if (validatedData.name.en !== existingCategory.name.en) await delay(1000);

    const description = validatedData.description
      ? {
          en: validatedData.description.en,
          ar:
            validatedData.description.ar &&
            validatedData.description.ar !== existingCategory.description?.ar
              ? validatedData.description.ar
              : validatedData.description.en !==
                existingCategory.description?.en
              ? await translate(validatedData.description.en || "", "ar")
              : existingCategory.description?.ar,
        }
      : undefined;
    if (
      validatedData.description &&
      validatedData.description.en !== existingCategory.description?.en
    )
      await delay(1000);

    // Check if a new image is being uploaded and delete the old one from Cloudinary
    if (
      validatedData.image &&
      existingCategory.image &&
      validatedData.image.public_id !== existingCategory.image.public_id
    ) {
      await cloudinary.uploader.destroy(existingCategory.image.public_id);
    }

    const categoryData = {
      ...validatedData,
      name: { en: validatedData.name.en, ar: name_ar },
      description,
    };

    const updatedCategory = await Category.findByIdAndUpdate(
      params.categoryId,
      categoryData,
      { new: true }
    );
    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to update category", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const deletedCategory = await Category.findByIdAndDelete(params.categoryId);
    if (!deletedCategory) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }
    // Delete the image from Cloudinary
    if (deletedCategory.image) {
      await cloudinary.uploader.destroy(deletedCategory.image.public_id);
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete category", error },
      { status: 500 }
    );
  }
}
