// app/api/orders/assign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";
import DeliveryPartner from "@/models/Partner";
import Assignment from "@/models/Assignment";
import AssignmentMetrics from "@/models/Metrics";

export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const body = await request.json();
    const { orderId, partnerId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    if (!partnerId) {
      return NextResponse.json({ success: false, message: "Partner ID is required" }, { status: 400 });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // If order is already assigned
    if (order.status !== "pending") {
      return NextResponse.json({ 
        success: false, 
        message: `Order is already ${order.status}` 
      }, { status: 400 });
    }

    // Find the partner
    const selectedPartner = await DeliveryPartner.findById(partnerId);
    if (!selectedPartner) {
      return NextResponse.json({ success: false, message: "Delivery partner not found" }, { status: 404 });
    }

    // Check if partner is active
    if (selectedPartner.status !== "active") {
      await createAssignmentRecord(orderId, partnerId, "failed", "Partner is inactive");
      return NextResponse.json({ success: false, message: "Partner is inactive" }, { status: 400 });
    }

    // Check if partner has capacity
    if (selectedPartner.currentLoad >= 3) {
      await createAssignmentRecord(orderId, partnerId, "failed", "Partner at maximum capacity");
      return NextResponse.json({ success: false, message: "Partner at maximum capacity" }, { status: 400 });
    }

    // Check if partner serves the order area
    if (!selectedPartner.areas.includes(order.area)) {
      await createAssignmentRecord(orderId, partnerId, "failed", "Partner does not serve this area");
      return NextResponse.json({ success: false, message: "Partner does not serve this area" }, { status: 400 });
    }

    // Assign order to selected partner
    selectedPartner.currentLoad += 1;
    await selectedPartner.save();

    // Update order status
    order.status = "assigned";
    order.assignedTo = selectedPartner._id;
    await order.save();

    // Create successful assignment record
    await createAssignmentRecord(orderId, selectedPartner._id.toString(), "success");

    // Update assignment metrics
    await updateAssignmentMetrics();

    return NextResponse.json({ 
      success: true, 
      message: "Order assigned successfully", 
      data: {
        order,
        partner: {
          id: selectedPartner._id,
          name: selectedPartner.name,
          phone: selectedPartner.phone
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error assigning order:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error assigning order", 
    }, { status: 500 });
  }
}

// Helper functions
async function createAssignmentRecord(orderId: string, partnerId: string, status: "success" | "failed", reason: string = "") {
  const order = await Order.findById(orderId);
  const orderNumber = order?.orderNumber;
  return await Assignment.create({
    orderId,
    partnerId,
    status,
    reason,
    timestamp: new Date(),
    orderNumber,
  });
}

async function updateAssignmentMetrics() {
  const metrics = await AssignmentMetrics.findOne() || await AssignmentMetrics.create({});
  
  // Increment total assignments
  metrics.totalAssigned += 1;
  
  // Update success rate
  const assignmentCount = await Assignment.countDocuments();
  const successCount = await Assignment.countDocuments({ status: "success" });
  metrics.successRate = (successCount / assignmentCount) * 100;
  
  await metrics.save();
  return metrics;
}