import mongoose from "mongoose";
import { Assignment as AssignmentTypes } from "@/types";

const assignmentSchema = new mongoose.Schema<AssignmentTypes>({
  orderId: { type: String, ref: "Order", required: true },
  partnerId: { type: String, ref: "DeliveryPartner", required: false },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["success", "failed"], required: true },
  reason: { type: String, default: "" },
});


export default mongoose.models.Assignment || mongoose.model<AssignmentTypes>("Assignment", assignmentSchema);
