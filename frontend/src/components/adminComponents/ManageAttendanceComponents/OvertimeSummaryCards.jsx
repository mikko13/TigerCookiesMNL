import React, { useMemo } from "react";
import { 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle,
  Clock3,
  AlertCircle
} from "lucide-react";

export default function OvertimeSummaryCards({ overtime }) {
  const stats = useMemo(() => {
    if (!overtime || overtime.length === 0) {
      return {
        totalEmployees: 0,
        totalRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        pendingRequests: 0,
        totalHours: 0
      };
    }

    const uniqueEmployees = new Set(
      overtime.map(record => record.employeeID)
    ).size;

    const totalRequests = overtime.length;

    const approvedRequests = overtime.filter(
      record => record.status === "Approved"
    ).length;

    const rejectedRequests = overtime.filter(
      record => record.status === "Rejected"
    ).length;

    const pendingRequests = overtime.filter(
      record => !record.status || record.status === "Pending"
    ).length;

    const totalHours = overtime.reduce(
      (sum, record) => sum + (parseFloat(record.overtimeTime) || 0), 
      0
    );

    return {
      totalEmployees: uniqueEmployees,
      totalRequests: totalRequests,
      approvedRequests: approvedRequests,
      rejectedRequests: rejectedRequests,
      pendingRequests: pendingRequests,
      totalHours: totalHours.toFixed(1)
    };
  }, [overtime]);

  const cards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: <Users size={24} />,
      color: "bg-blue-50 text-blue-700",
      iconColor: "text-blue-500"
    },
    {
      title: "Total Requests",
      value: stats.totalRequests,
      icon: <Clock size={24} />,
      color: "bg-purple-50 text-purple-700",
      iconColor: "text-purple-500"
    },
    {
      title: "Approved",
      value: stats.approvedRequests,
      icon: <CheckCircle size={24} />,
      color: "bg-green-50 text-green-700",
      iconColor: "text-green-500"
    },
    {
      title: "Rejected",
      value: stats.rejectedRequests,
      icon: <XCircle size={24} />,
      color: "bg-red-50 text-red-700",
      iconColor: "text-red-500"
    },
    {
      title: "Pending",
      value: stats.pendingRequests,
      icon: <AlertCircle size={24} />,
      color: "bg-yellow-50 text-yellow-700",
      iconColor: "text-yellow-500"
    },
    {
      title: "Total OT Hours",
      value: `${stats.totalHours} hrs`,
      icon: <Clock3 size={24} />,
      color: "bg-indigo-50 text-indigo-700",
      iconColor: "text-indigo-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="p-5 flex items-center">
            <div className={`rounded-full p-3 mr-4 ${card.color}`}>
              <div className={card.iconColor}>{card.icon}</div>
            </div>
            <div>
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="text-2xl font-semibold text-gray-800">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}