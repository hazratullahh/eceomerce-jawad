export const dynamic = "force-dynamic";
// app/api/customers/route.js
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Customer from "@/models/Customer";
import { z } from "zod";
import mongoose from "mongoose";

// Zod schema for validating incoming customer creation data
const customerCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amountWillPay: z
    .number()
    .min(700, "Amount to pay must be at least $700")
    .refine((val) => !isNaN(val), {
      message: "Amount to pay must be a valid number",
    }),
  paidAmount: z
    .number()
    .refine((val) => !isNaN(val), {
      message: "Paid amount must be a valid number",
    })
    .optional(),
  referrer: z.string().optional().nullable(),
});

/**
 * GET /api/customers
 * Fetches a list of customers, with optional search and referrer details.
 * Requires ADMIN role.
 */
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("search") || "";

  try {
    const query = {};
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: "i" };
    }

    const customers = await Customer.find(query)
      .populate({
        path: "referrer",
        model: "Customer",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .lean();

    const serializedCustomers = customers.map((customer) => ({
      id: customer._id.toString(),
      name: customer.name,
      amountWillPay: customer.amountWillPay,
      paidAmount: customer.paidAmount,
      referralCount: customer.referralCount,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      referrer: customer.referrer
        ? {
            id: customer.referrer._id.toString(),
            name: customer.referrer.name,
          }
        : null,
    }));

    return NextResponse.json(serializedCustomers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * POST /api/customers
 * Creates a new customer.
 * Requires ADMIN role.
 */
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await dbConnect();

  try {
    const body = await request.json();
    const validatedData = customerCreateSchema.parse(body);

    let referrerObjectId = null;
    if (validatedData.referrer) {
      if (!mongoose.Types.ObjectId.isValid(validatedData.referrer)) {
        return new NextResponse("Invalid Referrer ID format", { status: 400 });
      }
      const referrerExists = await Customer.findById(validatedData.referrer);
      if (!referrerExists) {
        return new NextResponse("Referrer not found", { status: 404 });
      }
      referrerObjectId = new mongoose.Types.ObjectId(validatedData.referrer);
    }

    const newCustomer = await Customer.create({
      name: validatedData.name,
      amountWillPay: validatedData.amountWillPay,
      paidAmount: validatedData.paidAmount || 0,
      referrer: referrerObjectId,
    });

    if (referrerObjectId) {
      await Customer.findByIdAndUpdate(
        referrerObjectId,
        { $inc: { referralCount: 1 } },
        { new: true }
      );
    }

    const populatedCustomer = await Customer.findById(newCustomer._id)
      .populate("referrer", "name")
      .lean();

    return NextResponse.json(
      {
        id: populatedCustomer._id.toString(),
        name: populatedCustomer.name,
        amountWillPay: populatedCustomer.amountWillPay,
        paidAmount: populatedCustomer.paidAmount,
        createdAt: populatedCustomer.createdAt,
        updatedAt: populatedCustomer.updatedAt,
        referralCount: populatedCustomer.referralCount,
        referrer: populatedCustomer.referrer
          ? {
              id: populatedCustomer.referrer._id.toString(),
              name: populatedCustomer.referrer.name,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    console.error("Error creating customer:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
