"use client";
import { Package } from "lucide-react";
import { Order } from "../../../redux/slice/orderSlice";

interface PendingOrdersProps {
  orders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order) => void;
}

const PendingOrders: React.FC<PendingOrdersProps> = ({ orders, selectedOrder, onSelectOrder }) => {
  return (
    <div className="bg-[#1E1E2E] border border-[#2A2A3A] rounded-xl p-4">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
        <Package className="mr-2 text-yellow-500" size={20} />
        Pending Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-400 p-4 text-center">No pending orders available</p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`p-3 border border-[#2A2A3A] rounded-lg cursor-pointer transition-all ${
                selectedOrder?._id === order._id ? "bg-[#353549] border-blue-500" : "hover:bg-[#252537]"
              }`}
              onClick={() => onSelectOrder(order)}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">{order.orderNumber}</span>
                <span className="text-yellow-500 text-sm">{order.status}</span>
              </div>
              <div className="text-gray-300 text-sm mt-1">Customer: {order.customer.name}</div>
              <div className="text-gray-300 text-sm">Area: {order.area}</div>
              <div className="text-gray-300 text-sm">Scheduled: {order.scheduledFor}</div>
              <div className="text-gray-300 text-sm">Amount: {order.totalAmount}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingOrders;
