import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";

export async function GET() {
  await connectDB();

  try {
    const orders = await Order.find();
    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}


// this for populating data in the backend
export async function POST(req: Request) {
  await connectDB();

  try {
    const body = await req.json();
    const { customer, area, items, scheduledFor, totalAmount } = body;

    // Validate required fields
    if (!customer?.name || !customer?.phone || !customer?.address || !area || !items?.length || !scheduledFor || !totalAmount) {
     
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create new order
    const newOrder = await Order.create({
      orderNumber,
      customer,
      area,
      items,
      scheduledFor,
      totalAmount,
      status: "pending",
    });

    return NextResponse.json(
      { success: true, data: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, message: "Server Error"},
      { status: 500 }
    );
  }
}
