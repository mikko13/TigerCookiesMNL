import React, { useMemo } from "react";
import { 
  Users, 
  CalendarCheck, 
  Clock, 
  AlertCircle,
  CheckCircle,
  TimerOff
} from "lucide-react";

export default function AttendanceSummaryCards({ attendance }) {
  const stats = useMemo(() => {
    if (!attendance || attendance.length === 0) {
      return {
        totalEmployees: 0,
        totalAttendance: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        notCheckedOut: 0
      };
    }

    const uniqueEmployees = new Set(
      attendance.map(record => record.employeeName)
    ).size;

    const totalAttendance = attendance.length;

    const presentCount = attendance.filter(
      record => record.attendanceStatus === "Present"
    ).length;

    const absentCount = attendance.filter(
      record => record.attendanceStatus === "Absent"
    ).length;

    const lateCount = attendance.filter(
      record => record.attendanceStatus === "Late"
    ).length;

    const notCheckedOut = attendance.filter(
      record => record.checkinTime && !record.checkoutTime
    ).length;

    return {
      totalEmployees: uniqueEmployees,
      totalAttendance: totalAttendance,
      presentCount: presentCount,
      absentCount: absentCount,
      lateCount: lateCount,
      notCheckedOut: notCheckedOut
    };
  }, [attendance]);

  const getAttendanceRate = () => {
    if (stats.totalAttendance === 0) return "0%";
    return `${Math.round((stats.presentCount / stats.totalAttendance) * 100)}%`;
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
      title: "Total Records",
      value: stats.totalAttendance,
      icon: <CalendarCheck size={24} />,
      color: "bg-indigo-50 text-indigo-700",
      iconColor: "text-indigo-500"
    },
    {
      title: "Present",
      value: stats.presentCount,
      icon: <CheckCircle size={24} />,
      color: "bg-green-50 text-green-700",
      iconColor: "text-green-500"
    },
    {
      title: "Absent",
      value: stats.absentCount,
      icon: <AlertCircle size={24} />,
      color: "bg-red-50 text-red-700",
      iconColor: "text-red-500"
    },
    {
      title: "Late",
      value: stats.lateCount,
      icon: <Clock size={24} />,
      color: "bg-yellow-50 text-yellow-700",
      iconColor: "text-yellow-500"
    },
    {
      title: "Not Checked Out",
      value: stats.notCheckedOut,
      icon: <TimerOff size={24} />,
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