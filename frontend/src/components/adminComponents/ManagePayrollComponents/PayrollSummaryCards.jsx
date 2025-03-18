import React, { useMemo } from "react";
import { 
  Users, 
  CalendarClock, 
  TrendingUp, 
  TrendingDown,
  BanknoteIcon, 
  Clock
} from "lucide-react";

export default function PayrollSummaryCards({ payrolls }) {
  const stats = useMemo(() => {
    if (!payrolls || payrolls.length === 0) {
      return {
        totalEmployees: 0,
        totalPaid: 0,
        averageSalary: 0,
        highestPaid: 0,
        totalHours: 0,
        pendingPayrolls: 0
      };
    }

    const uniqueEmployees = new Set(
      payrolls.map(p => p.employeeID._id)
    ).size;

    const totalPaid = payrolls.reduce(
      (sum, record) => sum + record.netPay, 
      0
    );

    const averageSalary = totalPaid / payrolls.length;

    const highestPaid = Math.max(...payrolls.map(p => p.netPay));

    const totalHours = payrolls.reduce(
      (sum, record) => sum + record.regularHours, 
      0
    );

    const pendingPayrolls = payrolls.filter(p => !p.isPublished).length;

    return {
      totalEmployees: uniqueEmployees,
      totalPaid: totalPaid,
      averageSalary: averageSalary,
      highestPaid: highestPaid,
      totalHours: totalHours,
      pendingPayrolls: pendingPayrolls
    };
  }, [payrolls]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const cards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: <Users size={24} />,
      color: "bg-blue-50 text-blue-700",
      iconColor: "text-blue-500"
    },
    {
      title: "Total Payroll",
      value: formatCurrency(stats.totalPaid),
      icon: <BanknoteIcon size={24} />,
      color: "bg-green-50 text-green-700",
      iconColor: "text-green-500"
    },
    {
      title: "Average Salary",
      value: formatCurrency(stats.averageSalary),
      icon: <TrendingUp size={24} />,
      color: "bg-purple-50 text-purple-700",
      iconColor: "text-purple-500"
    },
    {
      title: "Highest Pay",
      value: formatCurrency(stats.highestPaid),
      icon: <TrendingUp size={24} />,
      color: "bg-yellow-50 text-yellow-700",
      iconColor: "text-yellow-500"
    },
    {
      title: "Total Hours",
      value: `${stats.totalHours} hrs`,
      icon: <Clock size={24} />,
      color: "bg-indigo-50 text-indigo-700",
      iconColor: "text-indigo-500"
    },
    {
      title: "Pending Payrolls",
      value: stats.pendingPayrolls,
      icon: <CalendarClock size={24} />,
      color: "bg-orange-50 text-orange-700",
      iconColor: "text-orange-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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