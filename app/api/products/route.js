import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { productSchema } from "@/validations/product";
import { z } from "zod";
import { translate } from "@/lib/translate";

export async function GET() {
  await dbConnect();
  try {
    const products = await Product.find({});
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch products", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const validatedData = productSchema.parse(data);

    // Perform translations with delay to avoid rate limits
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const name = validatedData.name
      ? {
          en: validatedData.name.en,
          ar:
            validatedData.name.ar ||
            (await translate(validatedData.name.en, "ar")),
        }
      : undefined;
    if (validatedData.name && !validatedData.name.ar) await delay(1000);

    const saleText = validatedData.saleText
      ? {
          en: validatedData.saleText.en,
          ar:
            validatedData.saleText.ar ||
            (await translate(validatedData.saleText.en, "ar")),
        }
      : undefined;
    if (validatedData.saleText && !validatedData.saleText.ar) await delay(1000);

    const description = validatedData.description
      ? {
          en: validatedData.description.en,
          ar:
            validatedData.description.ar ||
            (await translate(validatedData.description.en, "ar")),
        }
      : undefined;
    if (validatedData.description && !validatedData.description.ar)
      await delay(1000);

    const materials = validatedData.materials
      ? {
          en: validatedData.materials.en,
          ar:
            validatedData.materials.ar ||
            (await translate(validatedData.materials.en, "ar")),
        }
      : undefined;
    if (validatedData.materials && !validatedData.materials.ar)
      await delay(1000);

    const careInstructions = await Promise.all(
      validatedData.careInstructions.map(async (item) => {
        const ar = item.ar || (await translate(item.en, "ar"));
        if (!item.ar) await delay(1000);
        return { en: item.en, ar };
      })
    );

    const dimensions = await Promise.all(
      validatedData.dimensions.map(async (item) => {
        const ar = item.ar || (await translate(item.en, "ar"));
        if (!item.ar) await delay(1000);
        return { size: item.size, en: item.en, ar };
      })
    );

    const details = await Promise.all(
      validatedData.details.map(async (item) => {
        const ar = item.ar || (await translate(item.en, "ar"));
        if (!item.ar) await delay(1000);
        return { en: item.en, ar };
      })
    );

    const productData = {
      ...validatedData,
      name,
      saleText,
      description,
      materials,
      careInstructions,
      dimensions,
      details,
    };

    const newProduct = new Product(productData);
    await newProduct.save();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("POST error:", error.message);
    return NextResponse.json(
      { message: "Failed to create product", error: error.message },
      { status: 500 }
    );
  }
}
