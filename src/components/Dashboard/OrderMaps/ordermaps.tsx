"use client"
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../../redux/slice/orderSlice";
import { RootState, AppDispatch } from "@/redux/Store";
import geocodeAddress from "@/lib/geocode";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const OrderMap = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { order, loading } = useSelector((state: RootState) => state.orders);
  const [ordersWithCoords, setOrdersWithCoords] = useState<{ lat: number; lng: number; area: string; status: string }[]>([]);
  const [customIcon, setCustomIcon] = useState<L.Icon<L.IconOptions> | null>(null);


  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (order.length > 0) {
        const updatedOrders = await Promise.all(
          order.map(async (order) => {
            try {
              const { lat, lng } = await geocodeAddress(order.area);
              return { lat: lat ?? 0, lng: lng ?? 0, area: order.area, status: order.status };
            } catch (error) {
              console.error(`Failed to geocode ${order.area}:`, error);
              return { lat: 0, lng: 0, area: order.area, status: order.status };
            }
          })
        );
        setOrdersWithCoords(updatedOrders);
      }
    };

    fetchCoordinates();
  }, [order]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (async () => {
        const L = await import("leaflet");
        const markerIcon = (await import("leaflet/dist/images/marker-icon.png")).default as unknown as string;
        const markerRetina = (await import("leaflet/dist/images/marker-icon-2x.png")).default as unknown as string;
        const markerShadow = (await import("leaflet/dist/images/marker-shadow.png")).default as unknown as string;
        

        const icon = new L.Icon({
          iconUrl: markerIcon,
          iconRetinaUrl: markerRetina,
          shadowUrl: markerShadow,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        setCustomIcon(icon);
      })();
    }
  }, []);

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden">
      {loading ? (
        <p className="text-center p-4">Loading map...</p>
      ) : (
        <MapContainer center={[19.076, 72.8777]} zoom={12} className="w-full h-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {customIcon &&
            ordersWithCoords.map((order, index) =>
              order.lat !== 0 && order.lng !== 0 ? (
                <Marker key={index} position={[order.lat, order.lng]} icon={customIcon}>
                  <Popup>
                    <p><strong>Area:</strong> {order.area}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                  </Popup>
                </Marker>
              ) : null
            )}
        </MapContainer>
      )}
    </div>
  );
};

export default OrderMap;
