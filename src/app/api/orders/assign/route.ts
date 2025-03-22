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
    // Extract order ID and optional partner ID from request
    const body = await request.json();
    const { orderId, partnerId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
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

    let selectedPartner;

    // If a specific partner is requested
    if (partnerId) {
      selectedPartner = await DeliveryPartner.findById(partnerId);
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

      // Check if order scheduled time is within partner's shift
      const isWithinShift = isTimeWithinShift(order.scheduledFor, selectedPartner.shift.start, selectedPartner.shift.end);
      if (!isWithinShift) {
        await createAssignmentRecord(orderId, partnerId, "failed", "Order time outside partner's shift");
        return NextResponse.json({ success: false, message: "Order time outside partner's shift" }, { status: 400 });
      }
    } 
    // Automatic partner selection
    else {
      // Find eligible partners based on criteria
      const eligiblePartners = await DeliveryPartner.find({
        status: "active",
        currentLoad: { $lt: 3 },
        areas: order.area
      });

      if (eligiblePartners.length === 0) {
        await updateAssignmentMetrics("No eligible partners available");
        return NextResponse.json({ success: false, message: "No eligible partners available" }, { status: 404 });
      }

      // Filter partners by shift time
      const availablePartners = eligiblePartners.filter(partner => 
        isTimeWithinShift(order.scheduledFor, partner.shift.start, partner.shift.end)
      );

      if (availablePartners.length === 0) {
        await updateAssignmentMetrics("No partners available for scheduled time");
        return NextResponse.json({ success: false, message: "No partners available for scheduled time" }, { status: 404 });
      }

      // Select partner with lowest current load
      selectedPartner = availablePartners.reduce((prev, current) => 
        prev.currentLoad <= current.currentLoad ? prev : current
      );
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
  return await Assignment.create({
    orderId,
    partnerId,
    status,
    reason,
    timestamp: new Date()
  });
}

async function updateAssignmentMetrics(failureReason: string = "") {
  const metrics = await AssignmentMetrics.findOne() || await AssignmentMetrics.create({});
  
  // Increment total assignments
  metrics.totalAssigned += 1;
  
  // Update success rate
  const assignmentCount = await Assignment.countDocuments();
  const successCount = await Assignment.countDocuments({ status: "success" });
  metrics.successRate = (successCount / assignmentCount) * 100;
  
  // Update average assignment time (placeholder - would need to calculate based on actual data)
  // This would typically measure time from order creation to assignment
  
  // If there's a failure reason, increment or add it
  if (failureReason) {
    const existingReason = metrics.failureReasons.find((r: { reason: string; }) => r.reason === failureReason);
    if (existingReason) {
      existingReason.count += 1;
    } else {
      metrics.failureReasons.push({ reason: failureReason, count: 1 });
    }
  }
  
  await metrics.save();
  return metrics;
}

function isTimeWithinShift(scheduledTime: string, shiftStart: string, shiftEnd: string): boolean {
  // This assumes scheduledTime is in HH:mm format
  // You might need to adjust based on your actual time format
  
  // Convert all times to minutes for easy comparison
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const scheduledMinutes = timeToMinutes(scheduledTime);
  const startMinutes = timeToMinutes(shiftStart);
  const endMinutes = timeToMinutes(shiftEnd);
  
  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    return scheduledMinutes >= startMinutes || scheduledMinutes <= endMinutes;
  }
  
  return scheduledMinutes >= startMinutes && scheduledMinutes <= endMinutes;
}