// import type { NextApiRequest} from "next";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";
import DeliveryPartner from "@/models/Partner";
import Assignment from "@/models/Assignment";
import AssignmentMetrics from "@/models/Metrics";


const isPartnerAvailable = (partner: { shift: { start: string; end: string; }; }, scheduledTime: string): boolean => {
  const scheduledDate = new Date(`2000-01-01 ${scheduledTime}`);
  const startDate = new Date(`2000-01-01 ${partner.shift.start}`);
  const endDate = new Date(`2000-01-01 ${partner.shift.end}`);

  if (startDate > endDate) {
    return scheduledDate >= startDate || scheduledDate <= endDate;
  } else {
    return scheduledDate >= startDate && scheduledDate <= endDate;
  }
};

export async function POST() {
 

  try {
    await connectDB();
    const pendingOrders = await Order.find({ status: "pending" });

    if (!pendingOrders.length) {
      return NextResponse.json({
        success: true,
        message: "No pending orders to assign",
        data: { assignedCount: 0 },
      });
    }

    let successCount = 0;
    let failureCount = 0;
    const failureReasons: Record<string, number> = {};

    for (const order of pendingOrders) {
      const availablePartners = await DeliveryPartner.find({
        status: "active",
        currentLoad: { $lt: 3 },
        areas: order.area,
      });

      if (!availablePartners.length) {
        await Assignment.create({ orderId: order._id, partnerId: null, status: "failed", reason: "No available partners for this area" });
        failureCount++;
        failureReasons["No available partners for this area"] = (failureReasons["No available partners for this area"] || 0) + 1;
        continue;
      }

      const timeAvailablePartners = availablePartners.filter((partner) => isPartnerAvailable(partner, order.scheduledFor));

      if (!timeAvailablePartners.length) {
        await Assignment.create({ orderId: order._id, partnerId: null, status: "failed", reason: "No partners available at scheduled time" });
        failureCount++;
        failureReasons["No partners available at scheduled time"] = (failureReasons["No partners available at scheduled time"] || 0) + 1;
        continue;
      }

      timeAvailablePartners.sort((a, b) => a.currentLoad - b.currentLoad);
      const selectedPartner = timeAvailablePartners[0];

      order.status = "assigned";
      order.assignedTo = selectedPartner._id;
      await order.save();

      selectedPartner.currentLoad += 1;
      await selectedPartner.save();

      await Assignment.create({ orderId: order._id, partnerId: selectedPartner._id, status: "success", reason: "" });
      successCount++;
    }

    const totalAssigned = successCount + failureCount;
    const successRate = totalAssigned > 0 ? (successCount / totalAssigned) * 100 : 0;

    const formattedFailureReasons = Object.entries(failureReasons).map(([reason, count]) => ({ reason, count }));

    let metrics = await AssignmentMetrics.findOne();
    if (!metrics) {
      metrics = new AssignmentMetrics({
        totalAssigned,
        successRate,
        failureReasons: formattedFailureReasons,
      });
    } else {
      metrics.totalAssigned += totalAssigned;
      metrics.successRate = ((metrics.successRate * (metrics.totalAssigned - totalAssigned)) + (successRate * totalAssigned)) / metrics.totalAssigned;
      formattedFailureReasons.forEach(({ reason, count }) => {
        const existingReason = metrics.failureReasons.find((r: { reason: string; }) => r.reason === reason);
        if (existingReason) {
          existingReason.count += count;
        } else {
          metrics.failureReasons.push({ reason, count });
        }
      });
    }

    await metrics.save();

    return NextResponse.json({
      success: true,
      message: "Assignment process completed",
      data: { totalProcessed: totalAssigned, successCount, failureCount, failureReasons },
    });
  } catch (error) {
    console.error("Assignment process error:", error);
    return NextResponse.json({
      success: false,
      message: "An error occurred during assignment process",
      data: { error: (error as Error).message },
    });
  }
}

// export { post };
