type MetricCardProps = {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    color: string;
  };

function MetricCard({ icon, value, label, color }: MetricCardProps) {
    return (
        <div className="bg-[#1E1E2E] border border-[#2A2A3A] shadow-md hover:shadow-lg hover:shadow-gray-700 transition-all duration-200 rounded-2xl p-5 flex items-center space-x-4">
            {/* Icon Wrapper */}
            <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
                {icon}
            </div>

            {/* Metric Details */}
            <div>
                <h2 className="text-2xl font-bold text-white">{value}</h2>
                <p className="text-gray-400 text-sm">{label}</p>
            </div>
        </div>
    );
}
  
export default MetricCard;
  