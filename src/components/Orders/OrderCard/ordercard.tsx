
"use client"
import { useEffect, useState } from "react";

import { CheckCircle, XCircle, Clock, Calendar, Package, MapPin, User, Users, DollarSign } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../../redux/slice/orderSlice";
import { RootState, AppDispatch } from "@/redux/Store";
import OrderFilter from "../OrderFilter/orderfilter";


const OrderCard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { order } = useSelector((state: RootState) => state.orders);
    useEffect(()=>{
          dispatch(fetchOrders());
  
      },[dispatch]);
     

      const[statusFilter,setStatusFilter]=useState<string | null>(null);
      const filteredOrders = statusFilter ? order.filter((o) => o.status.toLowerCase() === statusFilter) : order;
  return (
    <div >
        <div className="flex justify-center">
        <OrderFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

        </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {filteredOrders.map((order) => (
        <div
          key={order.orderNumber}
          className="flex-col bg-[#1E1E2E] border border-[#2A2A3A] shadow-md hover:shadow-lg hover:shadow-gray-700 transition-all duration-200 rounded-2xl p-5 space-y-3"
        >
          {/* Order ID and Status Icon */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-800 rounded-xl">
              <Package
                size={32}
                className={
                  order.status === "Delivered"
                    ? "text-green-500"
                    : order.status === "Cancelled"
                    ? "text-red-500"
                    : "text-yellow-500"
                }
              />
            </div>
            <div className="flex flex-row items-center space-x-4">
            
              <p className="text-white font-semibold">{order.orderNumber}</p>
            </div>
          </div>

          {/* Area */}
          <div className="flex items-center space-x-4">
            <MapPin className="text-blue-400" size={20} />
            <p className="text-gray-300 text-md font-semibold">Area:</p>
            <p className="text-white font-bold">{order.area}</p>
          </div>

          {/* Customer */}
          <div className="flex items-center space-x-4">
            <User className="text-yellow-400" size={20} />
            <p className="text-gray-300 text-md font-semibold">Customer:</p>
            <p className="text-white font-bold">{order.customer.name}</p>
          </div>

         
          {/* Status */}
          <div className="flex items-center space-x-4">
  {order.status.toLowerCase() === "delivered" && <CheckCircle className="text-green-500" size={20} />}
  {order.status.toLowerCase() === "pending" && <Clock className="text-yellow-500" size={20} />}
  {order.status.toLowerCase() === "cancelled" && <XCircle className="text-red-500" size={20} />}
  {order.status.toLowerCase() === "assigned" && <Users className="text-blue-500" size={20} />}
  {order.status.toLowerCase() === "picked" && <Package className="text-purple-500" size={20} />}
  
  <p className="text-gray-300 text-md font-semibold">Status:</p>
  <p className="text-white">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
</div>


          {/* Schedule */}
          <div className="flex items-center space-x-4">
            <Calendar className="text-gray-400" size={20} />
            <p className="text-gray-300 text-md font-semibold">Schedule:</p>
            <p className="text-white">{order.scheduledFor}</p>
          </div>

          {/* Total Cost */}
          <div className="flex items-center space-x-4">
            <DollarSign className="text-purple-400" size={20} />
            <p className="text-gray-300 text-md font-semibold">Total Cost:</p>
            <p className="text-white font-bold">{order.totalAmount}</p>
          </div>
        </div>
      ))}
    </div>
    </div>
    
  );
};

export default OrderCard;