// app/api/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";
import DeliveryPartner from "@/models/Partner";
import AssignmentMetrics from "@/models/Metrics";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  try {
    const id = (await params).id;
    if (!id) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ success: false, message: "Status is required" }, { status: 400 });
    }

    // Validate status value
    const validStatuses = ["pending", "assigned", "picked", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      }, { status: 400 });
    }

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Update order status
    order.status = status;
    const updatedOrder = await order.save();

    // If the order is assigned to a delivery partner, update partner metrics
    if (order.assignedTo) {
      const partner = await DeliveryPartner.findById(order.assignedTo);
      
      if (partner) {
        if (status === "delivered") {
          partner.currentLoad = Math.max(0, partner.currentLoad - 1);
          partner.metrics.completedOrders += 1;
        } else if (status === "cancelled") {
          partner.currentLoad = Math.max(0, partner.currentLoad - 1);
          partner.metrics.cancelledOrders += 1;

    
          await AssignmentMetrics.updateOne(
            {},
            { $inc: { "failureReasons.$[elem].count": 1 } },
            { 
              arrayFilters: [{ "elem.reason": "Order Cancelled" }],
              upsert: true
            }
          );
        }
        
        await partner.save();
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Order status updated successfully", 
      data: updatedOrder 
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error updating order status", 
     
    }, { status: 500 });
  }
}

