import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { productSchema } from "@/validations/product";
import { z } from "zod";
import { translate } from "@/lib/translate";

export async function GET(req, { params }) {
  await dbConnect();
  const { productId } = await params;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch product", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  await dbConnect();
  const { productId } = params;
  try {
    const data = await req.json();
    const validatedData = productSchema.parse(data);

    // Fetch the existing product to compare English fields
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Translate Arabic fields if English changed and Arabic is empty or unchanged
    const name_ar =
      validatedData.name.ar && validatedData.name.ar !== existingProduct.name.ar
        ? validatedData.name.ar
        : validatedData.name.en !== existingProduct.name.en
        ? await translate(validatedData.name.en, "ar")
        : existingProduct.name.ar;
    if (validatedData.name.en !== existingProduct.name.en) await delay(1000);

    const saleText = validatedData.saleText
      ? {
          en: validatedData.saleText.en,
          ar:
            validatedData.saleText.ar &&
            validatedData.saleText.ar !== existingProduct.saleText?.ar
              ? validatedData.saleText.ar
              : validatedData.saleText.en !== existingProduct.saleText?.en
              ? await translate(validatedData.saleText.en, "ar")
              : existingProduct.saleText?.ar,
        }
      : undefined;
    if (
      validatedData.saleText &&
      validatedData.saleText.en !== existingProduct.saleText?.en
    )
      await delay(1000);

    const description = validatedData.description
      ? {
          en: validatedData.description.en,
          ar:
            validatedData.description.ar &&
            validatedData.description.ar !== existingProduct.description?.ar
              ? validatedData.description.ar
              : validatedData.description.en !== existingProduct.description?.en
              ? await translate(validatedData.description.en, "ar")
              : existingProduct.description?.ar,
        }
      : undefined;
    if (
      validatedData.description &&
      validatedData.description.en !== existingProduct.description?.en
    )
      await delay(1000);

    const materials = validatedData.materials
      ? {
          en: validatedData.materials.en,
          ar:
            validatedData.materials.ar &&
            validatedData.materials.ar !== existingProduct.materials?.ar
              ? validatedData.materials.ar
              : validatedData.materials.en !== existingProduct.materials?.en
              ? await translate(validatedData.materials.en, "ar")
              : existingProduct.materials?.ar,
        }
      : undefined;
    if (
      validatedData.materials &&
      validatedData.materials.en !== existingProduct.materials?.en
    )
      await delay(1000);

    const careInstructions = await Promise.all(
      validatedData.careInstructions.map(async (item, index) => {
        const existingItem = existingProduct.careInstructions[index] || {};
        const ar =
          item.ar && item.ar !== existingItem.ar
            ? item.ar
            : item.en !== existingItem.en
            ? await translate(item.en, "ar")
            : existingItem.ar;
        if (item.en !== existingItem.en) await delay(1000);
        return { en: item.en, ar };
      })
    );

    const dimensions = await Promise.all(
      validatedData.dimensions.map(async (item, index) => {
        const existingItem = existingProduct.dimensions[index] || {};
        const ar =
          item.ar && item.ar !== existingItem.ar
            ? item.ar
            : item.en !== existingItem.en
            ? await translate(item.en, "ar")
            : existingItem.ar;
        if (item.en !== existingItem.en) await delay(1000);
        return { size: item.size, en: item.en, ar };
      })
    );

    const details = await Promise.all(
      validatedData.details.map(async (item, index) => {
        const existingItem = existingProduct.details[index] || {};
        const ar =
          item.ar && item.ar !== existingItem.ar
            ? item.ar
            : item.en !== existingItem.en
            ? await translate(item.en, "ar")
            : existingItem.ar;
        if (item.en !== existingItem.en) await delay(1000);
        return { en: item.en, ar };
      })
    );

    const productData = {
      ...validatedData,
      name: { en: validatedData.name.en, ar: name_ar },
      saleText,
      description,
      materials,
      careInstructions,
      dimensions,
      details,
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      productData,
      { new: true }
    );
    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to update product", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const { productId } = params;
  try {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    if (product.images?.length > 0) {
      await Promise.all(
        product.images.map((image) =>
          cloudinary.uploader.destroy(image.public_id)
        )
      );
    }
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete product", error: error.message },
      { status: 500 }
    );
  }
}
