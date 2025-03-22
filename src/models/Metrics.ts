import mongoose from "mongoose";
import { AssignmentMetrics as AssignmentMetricsTypes } from "@/types";
const assignmentMetricsSchema = new mongoose.Schema<AssignmentMetricsTypes>({
    totalAssigned: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
    failureReasons: [{
      reason: { type: String },
      count: { type: Number, default: 0 },
    }],
  });
  
  export default mongoose.models.AssignmentMetrics || mongoose.model<AssignmentMetricsTypes>("AssignmentMetrics", assignmentMetricsSchema);
  