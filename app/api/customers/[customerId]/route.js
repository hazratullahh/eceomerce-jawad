export const dynamic = "force-dynamic";
// app/api/customers/[customerId]/route.js
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Customer from "@/models/Customer";
import { z } from "zod";
import mongoose from "mongoose";

// Schema for updating a customer (can be partial)
const customerUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  amountWillPay: z
    .number()
    .min(700, "Amount to pay must be at least $700")
    .refine((val) => !isNaN(val), {
      message: "Amount to pay must be a valid number",
    })
    .optional(),
  paidAmount: z
    .number()
    .refine((val) => !isNaN(val), {
      message: "Paid amount must be a valid number",
    })
    .optional(),
  referrer: z.string().optional().nullable(),
});

async function authenticateAndConnect(session) {
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  return null;
}

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  const authError = await authenticateAndConnect(session);
  if (authError) return authError;

  const { customerId } = params;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return NextResponse.json(
      { message: "Invalid Customer ID format" },
      { status: 400 }
    );
  }

  try {
    const customer = await Customer.findById(customerId)
      .populate({
        path: "referrer",
        model: "Customer",
        select: "name",
      })
      .lean();

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    const serializedCustomer = {
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
    };

    return NextResponse.json(serializedCustomer);
  } catch (error) {
    console.error(`Error fetching customer ${customerId}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  const authError = await authenticateAndConnect(session);
  if (authError) return authError;

  const { customerId } = await params;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return NextResponse.json(
      { message: "Invalid Customer ID format" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const validatedData = customerUpdateSchema.parse(body);

    const originalCustomer = await Customer.findById(customerId);
    if (!originalCustomer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    const oldReferrerId = originalCustomer.referrer
      ? originalCustomer.referrer.toString()
      : null;
    let newReferrerObjectId = null;

    if (Object.prototype.hasOwnProperty.call(validatedData, "referrer")) {
      if (
        typeof validatedData.referrer === "string" &&
        validatedData.referrer !== ""
      ) {
        if (!mongoose.Types.ObjectId.isValid(validatedData.referrer)) {
          return NextResponse.json(
            { message: "Invalid Referrer ID format" },
            { status: 400 }
          );
        }
        const referrerExists = await Customer.findById(validatedData.referrer);
        if (!referrerExists) {
          return NextResponse.json(
            { message: "Referrer not found" },
            { status: 404 }
          );
        }
        if (validatedData.referrer === customerId) {
          return NextResponse.json(
            { message: "Customer cannot refer themselves" },
            { status: 400 }
          );
        }
        newReferrerObjectId = new mongoose.Types.ObjectId(
          validatedData.referrer
        );
      } else if (
        validatedData.referrer === null ||
        validatedData.referrer === ""
      ) {
        newReferrerObjectId = null;
      }
    } else {
      newReferrerObjectId = originalCustomer.referrer;
    }

    if (
      newReferrerObjectId &&
      oldReferrerId !== newReferrerObjectId?.toString()
    ) {
      if (oldReferrerId) {
        await Customer.findByIdAndUpdate(oldReferrerId, {
          $inc: { referralCount: -1 },
        });
      }
      await Customer.findByIdAndUpdate(newReferrerObjectId, {
        $inc: { referralCount: 1 },
      });
    } else if (oldReferrerId && !newReferrerObjectId) {
      await Customer.findByIdAndUpdate(oldReferrerId, {
        $inc: { referralCount: -1 },
      });
    } else if (!oldReferrerId && newReferrerObjectId) {
      await Customer.findByIdAndUpdate(newReferrerObjectId, {
        $inc: { referralCount: 1 },
      });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { ...validatedData, referrer: newReferrerObjectId },
      { new: true, runValidators: true }
    ).populate("referrer", "name");

    if (!updatedCustomer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    const serializedUpdatedCustomer = {
      id: updatedCustomer._id.toString(),
      name: updatedCustomer.name,
      amountWillPay: updatedCustomer.amountWillPay,
      paidAmount: updatedCustomer.paidAmount,
      referralCount: updatedCustomer.referralCount,
      createdAt: updatedCustomer.createdAt,
      updatedAt: updatedCustomer.updatedAt,
      referrer: updatedCustomer.referrer
        ? {
            id: updatedCustomer.referrer._id.toString(),
            name: updatedCustomer.referrer.name,
          }
        : null,
    };

    return NextResponse.json(
      {
        message: "Customer updated successfully!",
        customer: serializedUpdatedCustomer,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error(`Error updating customer ${customerId}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  const authError = await authenticateAndConnect(session);
  if (authError) return authError;

  const { customerId } = await params;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return NextResponse.json(
      { message: "Invalid Customer ID format" },
      { status: 400 }
    );
  }

  try {
    const customerToDelete = await Customer.findById(customerId);

    if (!customerToDelete) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    if (customerToDelete.referrer) {
      await Customer.findByIdAndUpdate(customerToDelete.referrer, {
        $inc: { referralCount: -1 },
      });
    }

    const deletedCustomer = await Customer.findByIdAndDelete(customerId);

    return NextResponse.json(
      { message: "Customer deleted successfully!", id: customerId },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting customer ${customerId}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
