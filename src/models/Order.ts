import mongoose from "mongoose";
import {Order as OrderTypes} from "@/types"

const orderSchema = new mongoose.Schema<OrderTypes>({
    orderNumber: { type: String, unique: true, required: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    area: { type: String, required: true },
    items: [{
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }],
    status: { type: String, enum: ["pending", "assigned", "picked", "delivered","cancelled"], default: "pending" },
    scheduledFor: { type: String, required: true }, 
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryPartner" },
    totalAmount: { type: Number, required: true },
  }, { timestamps: true });
  
//   const Order = mongoose.model<OrderTypes>("Order", orderSchema);
//   module.exports = Order;

export default mongoose.models.Order || mongoose.model<OrderTypes>("Order", orderSchema);
  