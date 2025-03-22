import { FC } from "react";

interface OrderFilterProps {
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
}

const OrderFilter: FC<OrderFilterProps> = ({ statusFilter, setStatusFilter }) => {
  const statuses = ["all", "pending", "assigned", "picked", "delivered", "cancelled"];

  return (
    <div className="mb-4 flex gap-4 flex-wrap">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => setStatusFilter(status === "all" ? null : status)}
          className={`px-4 py-2  rounded-lg transition-all duration-200 ${
            statusFilter === status ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default OrderFilter;
