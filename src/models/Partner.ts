import mongoose from "mongoose";
import type { DeliveryPartner as DeliveryPartnerType } from '@/types';

const deliveryPartnerSchema = new mongoose.Schema<DeliveryPartnerType>({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  status: { type: String, enum: ["active", "inactive"], required: true },
  currentLoad: { type: Number, default: 0, max: 3 },
  areas:{ type: [String], required: true },
  shift: {
    start: { type: String, required: true }, // Format: HH:mm
    end: { type: String, required: true },   // Format: HH:mm
  },   // Format: HH:mm
  metrics: {
    rating: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
  },
}, { timestamps: true });

// const DeliveryPartner = mongoose.model<DeliveryPartnerType>("DeliveryPartner", deliveryPartnerSchema);
// module.exports = DeliveryPartner;

export default mongoose.models.DeliveryPartner || mongoose.model<DeliveryPartnerType>("DeliveryPartner", deliveryPartnerSchema);
