"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, Package, Users, XCircle } from "lucide-react";
import MetricCard from "../MetricCard/metriccard";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../../redux/slice/orderSlice";
import { RootState, AppDispatch } from "@/redux/Store";

const KeyMetrics = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [metrics, setMetrics] = useState({
        availablePartners: 0
    });

    const { order } = useSelector((state: RootState) => state.orders);
    
    const fetchData = async () => {
        try {
            const [partnerRes] = await Promise.all([
                axios.get("/api/partners"),
            ]);  

            const partners = partnerRes.data.data;         
            console.log("Partners data:", partners);
 
            setMetrics({
                availablePartners: partners.filter((p: { status: string; }) => p.status === "active").length,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    useEffect(() => {
        dispatch(fetchOrders());
        fetchData();
    }, [dispatch]);


    const orders = order || [];
    console.log("Orders from Redux:", orders);

    const activeOrders = orders.filter((o: { status: string; }) => 
        o.status === "pending" || o.status === "assigned" || o.status === "picked"
    ).length;
    
    const completedOrders = orders.filter((o: { status: string; }) => 
        o.status === "delivered"
    ).length;
    
    const cancelledOrders = orders.filter((o: { status: string; }) => 
        o.status === "cancelled"
    ).length;
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
            <MetricCard 
                icon={<Package className="text-yellow-400" size={28} />} 
                value={activeOrders} 
                label="Active Orders" 
                color="bg-yellow-500" 
            />
            <MetricCard 
                icon={<CheckCircle className="text-green-400" size={28} />} 
                value={completedOrders} 
                label="Completed Orders" 
                color="bg-green-500" 
            />
            <MetricCard 
                icon={<XCircle className="text-red-400" size={28} />} 
                value={cancelledOrders} 
                label="Cancelled Orders" 
                color="bg-red-500" 
            />
            <MetricCard 
                icon={<Users className="text-blue-400" size={28} />} 
                value={metrics.availablePartners} 
                label="Available Partners" 
                color="bg-blue-500" 
            />
        </div>
    );
};

export default KeyMetrics;