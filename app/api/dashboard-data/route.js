export const dynamic = "force-dynamic";
// app/api/dashboard-data/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// Adjust this path to your actual NextAuth.js configuration file
import { authOptions } from "@/lib/auth";
// Adjust this path to your DB connection utility
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User"; // Your User model
import Customer from "@/models/Customer"; // Your Customer model

export async function GET(req) {
  // 1. Authenticate the request using NextAuth.js session
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Optional: Add role-based authorization if only certain roles can view the dashboard
  // if (session.user.role !== "ADMIN") {
  //   return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
  // }

  try {
    // 2. Connect to the database
    await dbConnect();

    // 3. Fetch KPI Data
    // Total Members (assuming all users are members, or filter by role if applicable)
    const totalMembers = await Customer.countDocuments();

    // Total Revenue (sum of paidAmount from customers - represents "Amount Paid")
    const totalPaidResult = await Customer.aggregate([
      {
        $group: {
          _id: null, // Group all documents
          totalPaid: { $sum: "$paidAmount" },
        },
      },
    ]);
    const totalPaid =
      totalPaidResult.length > 0 ? totalPaidResult[0].totalPaid : 0;

    // Total Amount Will Be Paid (sum of amountWillPay from customers - represents "Amount Due")
    const totalAmountWillPayResult = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalWillPay: { $sum: "$amountWillPay" },
        },
      },
    ]);
    const totalAmountWillPay =
      totalAmountWillPayResult.length > 0
        ? totalAmountWillPayResult[0].totalWillPay
        : 0;

    // Active Referrals (customers with status 'PENDING' or 'PARTIALLY_PAID')
    const activeReferrals = await Customer.countDocuments({
      status: { $in: ["PENDING", "PARTIALLY_PAID"] },
    });

    // --- Define Targets (These can be hardcoded or fetched from a settings collection) ---
    const membersTarget = 100;
    const paidRevenueTarget = 100000; // Target for the actual collected revenue
    const amountWillPayTarget = 100000; // Target for total potential revenue (or amount due)
    const activeReferralsTarget = 75;

    // 4. Fetch Monthly Referrals Data (for chart)
    const monthlyReferralsData = await Customer.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          _id: 0, // Exclude default _id
          month: "$_id.month",
          year: "$_id.year",
          referrals: "$count",
        },
      },
    ]);

    // Format monthly data for chart (e.g., convert month number to name)
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Ensure all 12 months for the current year are present, even if no data
    const currentYear = new Date().getFullYear();
    const formattedMonthlyReferrals = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1; // Month numbers are 1-12
      const existing = monthlyReferralsData.find(
        (d) => d.month === monthNum && d.year === currentYear
      );
      return {
        name: monthNames[i],
        referrals: existing ? existing.referrals : 0,
      };
    });

    // 5. Fetch Recent Activities (combining recent customer updates and new user registrations)
    const recentCustomers = await Customer.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name status createdAt");

    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt");

    const recentActivities = [];

    recentCustomers.forEach((customer) => {
      recentActivities.push({
        id: `cust-${customer._id.toString()}`, // Unique ID for React key
        type: "Customer Status Update", // More descriptive type
        description: `Customer ${customer.name} status updated to: ${customer.status}`,
        date: customer.createdAt.toISOString().split("T")[0], // Format date to YYYY-MM-DD
      });
    });

    recentUsers.forEach((user) => {
      recentActivities.push({
        id: `user-${user._id.toString()}`, // Unique ID for React key
        type: "New User Registration", // More descriptive type
        description: `User ${user.name || user.email} registered.`,
        date: user.createdAt.toISOString().split("T")[0],
      });
    });

    // Sort all activities by date descending and limit to top 10
    recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const finalRecentActivities = recentActivities.slice(0, 10);

    // 6. Construct and return the dashboard data
    const dashboardData = {
      kpis: {
        totalMembers: {
          value: totalMembers,
          target: membersTarget,
          unit: "Members",
          iconColor: "text-blue-400",
        },
        totalRevenue: {
          // This KPI represents "Amount Paid"
          value: totalPaid,
          target: paidRevenueTarget,
          unit: "$",
          iconColor: "text-green-400",
        },
        totalAmountWillBePaid: {
          // This is the new KPI for "Amount Due"
          value: totalAmountWillPay,
          target: amountWillPayTarget,
          unit: "$",
          iconColor: "text-red-400", // Using red for amounts due
        },
        activeReferrals: {
          value: activeReferrals,
          target: activeReferralsTarget,
          unit: "Active",
          iconColor: "text-purple-400",
        },
      },
      monthlyReferrals: formattedMonthlyReferrals,
      recentActivities: finalRecentActivities,
    };

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
