import React, { useMemo } from "react";
import { 
  Users, 
  UserCheck, 
  UserX,
  Clock,
  Calendar,
  UserPlus
} from "lucide-react";

export default function EmployeeSummaryCards({ employees }) {
  const stats = useMemo(() => {
    if (!employees || employees.length === 0) {
      return {
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        recentHires: 0,
        averageRate: 0,
        morningShift: 0
      };
    }

    const totalEmployees = employees.length;
    
    const activeEmployees = employees.filter(
      employee => employee.isActive === 1
    ).length;
    
    const inactiveEmployees = employees.filter(
      employee => employee.isActive === 0
    ).length;
    
    // Consider employees hired in the last 30 days as recent
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentHires = employees.filter(employee => {
      if (!employee.hiredDate) return false;
      const hireDate = new Date(employee.hiredDate);
      return hireDate >= thirtyDaysAgo;
    }).length;
    
    // Calculate average hourly rate
    const totalRate = employees.reduce(
      (sum, employee) => sum + (parseFloat(employee.ratePerHour) || 0),
      0
    );
    const averageRate = totalEmployees > 0 ? (totalRate / totalEmployees).toFixed(2) : 0;
    
    // Count employees in morning shift
    const morningShift = employees.filter(
      employee => employee.shift && employee.shift.toLowerCase().includes("morning")
    ).length;

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      recentHires,
      averageRate,
      morningShift
    };
  }, [employees]);

  const cards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: <Users size={24} />,
      color: "bg-blue-50 text-blue-700",
      iconColor: "text-blue-500"
    },
    {
      title: "Active Employees",
      value: stats.activeEmployees,
      icon: <UserCheck size={24} />,
      color: "bg-green-50 text-green-700",
      iconColor: "text-green-500"
    },
    {
      title: "Inactive Employees", 
      value: stats.inactiveEmployees,
      icon: <UserX size={24} />,
      color: "bg-red-50 text-red-700",
      iconColor: "text-red-500"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
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