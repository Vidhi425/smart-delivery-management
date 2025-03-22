import KeyMetrics from "@/components/Dashboard/KeyMetrics/keymetrics";
import OrdersMap from "@/components/Dashboard/OrderMaps/ordermaps";


export default function Dashboard() {
  return (
    <>
    {/* <Sidebar/> */}
    <KeyMetrics/>
    <OrdersMap />
    </>
   
  );
}