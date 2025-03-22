// app/api/assignments/metrics/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import AssignmentMetrics from "@/models/Metrics";
import Assignment from "@/models/Assignment";
import Order from "@/models/Order";
import DeliveryPartner from "@/models/Partner";

export async function GET() {
  await connectDB();

  try {
    // Get basic metrics from AssignmentMetrics collection
    let metrics = await AssignmentMetrics.findOne();
    
    // If no metrics record exists yet, create one
    if (!metrics) {
      metrics = await AssignmentMetrics.create({
        totalAssigned: 0,
        successRate: 0,
        averageTime: 0,
        failureReasons: []
      });
    }

    // Compute additional real-time metrics

    // Get total counts
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const assignedOrders = await Order.countDocuments({ status: "assigned" });
    const pickedOrders = await Order.countDocuments({ status: "picked" });
    const deliveredOrders = await Order.countDocuments({ status: "delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    // Get partner efficiency metrics
    const partners = await DeliveryPartner.find({ status: "active" });
    const partnerMetrics = partners.map(partner => ({
      id: partner._id,
      name: partner.name,
      completedOrders: partner.metrics.completedOrders,
      cancelledOrders: partner.metrics.cancelledOrders,
      currentLoad: partner.currentLoad,
      completionRate: partner.metrics.completedOrders + partner.metrics.cancelledOrders > 0 
        ? (partner.metrics.completedOrders / (partner.metrics.completedOrders + partner.metrics.cancelledOrders) * 100).toFixed(2)
        : 0
    }));

    // Get top 5 areas with most orders
    const areaAggregation = await Order.aggregate([
      { $group: { _id: "$area", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const topAreas = areaAggregation.map(area => ({
      area: area._id,
      orderCount: area.count
    }));

    // Get assignment trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyAssignments = await Assignment.aggregate([
      { 
        $match: { 
          timestamp: { $gte: sevenDaysAgo } 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }
          },
          total: { $sum: 1 },
          success: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "success"] }, 1, 0] 
            } 
          },
          failed: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "failed"] }, 1, 0] 
            } 
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);
    
    const dailyTrends = dailyAssignments.map(day => ({
      total: day.total,
      success: day.success,
      failed: day.failed,
      successRate: day.total > 0 ? (day.success / day.total * 100).toFixed(2) : 0
    }));

    // Compile comprehensive metrics response
    const comprehensiveMetrics = {
      overview: {
        totalAssigned: metrics.totalAssigned,
        successRate: metrics.successRate,
        averageAssignmentTime: metrics.averageTime,
        failureReasons: metrics.failureReasons
      },
      orderStatus: {
        total: totalOrders,
        pending: pendingOrders,
        assigned: assignedOrders,
        picked: pickedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      },
      partnerPerformance: partnerMetrics,
      topAreas,
      dailyTrends
    };

    return NextResponse.json({ 
      success: true, 
      data: comprehensiveMetrics 
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching assignment metrics:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error fetching assignment metrics", 
      
    }, { status: 500 });
  }
}