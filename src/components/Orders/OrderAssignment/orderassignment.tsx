"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import { Order } from "../../../redux/slice/orderSlice";
import { CheckCircle, Package, Users, AlertCircle } from "lucide-react";

interface Partner {
  _id: string;
  name: string;
  phone: string;
  email: string;
  areas: string[];
  shift: { start: string; end: string };
  status: string;
  currentLoad: number;
}

const OrderAssignment = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending orders
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await axios.get("/api/orders?status=pending");
        setOrders(response.data.data);
      } catch (err) {
        setError("Failed to load pending orders");
        console.error(err);
      }
    };

    fetchPendingOrders();
  }, []);

  // Fetch partners when an order is selected
  useEffect(() => {
    if (!selectedOrder) return;

    const fetchEligiblePartners = async () => {
      try {
        // Fetch partners that serve the order's area
        const response = await axios.get(`/api/partners?area=${selectedOrder.area}`);
        setPartners(response.data.data);
      } catch (err) {
        setError("Failed to load eligible partners");
        console.error(err);
      }
    };

    fetchEligiblePartners();
  }, [selectedOrder]);

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setSelectedPartner("");
    setSuccess(null);
    setError(null);
  };

  const handleAssignOrder = async (automatic: boolean) => {
    if (!selectedOrder) {
      setError("Please select an order first");
      return;
    }

    // For manual assignment, a partner must be selected
    if (!automatic && !selectedPartner) {
      setError("Please select a partner for manual assignment");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post("/api/orders/assign", {
        orderId: selectedOrder._id, // Using _id instead of id
        // Only include partnerId for manual assignment
        ...(automatic ? {} : { partnerId: selectedPartner })
      });

      if (response.data.success) {
        setSuccess(`Order ${selectedOrder.orderNumber} assigned successfully to ${response.data.data.partner.name}`);
        
        // Remove the assigned order from the list
        setOrders(orders.filter(order => order._id !== selectedOrder._id));
        setSelectedOrder(null);
        setSelectedPartner("");
      }
    } catch (err) {
      setError( "Failed to assign order");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isPartnerEligible = (partner: Partner): boolean => {
    if (!selectedOrder) return false;
    
    // Check if partner is active
    if (partner.status !== "active") return false;
    
    // Check if partner has capacity
    if (partner.currentLoad >= 3) return false;
    
    // Check if partner serves the order area
    if (!partner.areas.includes(selectedOrder.area)) return false;
    
    // Check if order scheduled time is within partner's shift
    const isWithinShift = checkTimeWithinShift(
      selectedOrder.scheduledFor, 
      partner.shift.start, 
      partner.shift.end
    );
    
    return isWithinShift;
  };

  const checkTimeWithinShift = (scheduledTime: string, shiftStart: string, shiftEnd: string): boolean => {
    // Convert all times to minutes for comparison
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
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Order Assignment</h1>
      
      {/* Status messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-white rounded-lg flex items-center">
          <AlertCircle className="mr-2" size={20} />
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-900 text-white rounded-lg flex items-center">
          <CheckCircle className="mr-2" size={20} />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders Section */}
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
                    selectedOrder?._id === order._id 
                      ? "bg-[#353549] border-blue-500" 
                      : "hover:bg-[#252537]"
                  }`}
                  onClick={() => handleOrderSelect(order)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">{order.orderNumber}</span>
                    <span className="text-yellow-500 text-sm">{order.status}</span>
                  </div>
                  <div className="text-gray-300 text-sm mt-1">
                    Customer: {order.customer.name}
                  </div>
                  <div className="text-gray-300 text-sm">Area: {order.area}</div>
                  <div className="text-gray-300 text-sm">Scheduled: {order.scheduledFor}</div>
                  <div className="text-gray-300 text-sm">Amount: {order.totalAmount}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Partners and Assignment Section */}
        <div>
          {/* Order details */}
          {selectedOrder && (
            <div className="bg-[#1E1E2E] border border-[#2A2A3A] rounded-xl p-4 mb-4">
              <h2 className="text-lg font-semibold mb-2 text-white">Selected Order Details</h2>
              <p className="text-gray-300">Order: <span className="text-white">{selectedOrder.orderNumber}</span></p>
              <p className="text-gray-300">Area: <span className="text-white">{selectedOrder.area}</span></p>
              <p className="text-gray-300">Scheduled Time: <span className="text-white">{selectedOrder.scheduledFor}</span></p>
              <p className="text-gray-300">Customer: <span className="text-white">{selectedOrder.customer.name}</span></p>
              <p className="text-gray-300">Amount: <span className="text-white">{selectedOrder.totalAmount}</span></p>
            </div>
          )}

          {/* Partners list */}
          {selectedOrder && (
            <div className="bg-[#1E1E2E] border border-[#2A2A3A] rounded-xl p-4 mb-4">
              <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
                <Users className="mr-2 text-blue-500" size={20} />
                Available Partners
              </h2>
              
              {partners.length === 0 ? (
                <p className="text-gray-400 p-4 text-center">No eligible partners found for this area</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {partners.map((partner) => {
                    const eligible = isPartnerEligible(partner);
                    return (
                      <div
                        key={partner._id}
                        className={`p-3 border border-[#2A2A3A] rounded-lg transition-all ${
                          !eligible ? "opacity-50" : "cursor-pointer"
                        } ${
                          selectedPartner === partner._id 
                            ? "bg-[#353549] border-blue-500" 
                            : eligible ? "hover:bg-[#252537]" : ""
                        }`}
                        onClick={() => eligible && setSelectedPartner(partner._id)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-white">{partner.name}</span>
                          <span className={`text-sm ${partner.status === "active" ? "text-green-500" : "text-red-500"}`}>
                            {partner.status}
                          </span>
                        </div>
                        <div className="text-gray-300 text-sm mt-1">
                          Load: {partner.currentLoad}/3
                        </div>
                        <div className="text-gray-300 text-sm">
                          Shift: {partner.shift.start} - {partner.shift.end}
                        </div>
                        <div className="text-gray-300 text-sm">
                          Areas: {partner.areas.join(", ")}
                        </div>
                        {!eligible && (
                          <div className="mt-1 text-red-400 text-xs">
                            {partner.status !== "active" ? "Partner inactive" : 
                             partner.currentLoad >= 3 ? "At maximum capacity" :
                             !partner.areas.includes(selectedOrder.area) ? "Doesn't serve this area" :
                             "Outside shift hours"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Assignment buttons */}
          {selectedOrder && (
            <div className="flex space-x-4">
              <button
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all flex justify-center items-center"
                onClick={() => handleAssignOrder(false)}
                disabled={loading || !selectedPartner}
              >
                {loading ? "Assigning..." : "Assign Manually"}
              </button>
              <button
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all flex justify-center items-center"
                onClick={() => handleAssignOrder(true)}
                disabled={loading}
              >
                {loading ? "Assigning..." : "Auto-Assign"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderAssignment;