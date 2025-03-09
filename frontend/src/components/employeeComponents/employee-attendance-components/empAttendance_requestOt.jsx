import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../../urls/URL";
import { Clock, CalendarClock } from "lucide-react";

export default function EmpAttendanceRequestOt() {
  const [overtimeTime, setOvertimeTime] = useState("");
  const [overtimeNote, setOvertimeNote] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lastOvertime, setLastOvertime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const employeeID = JSON.parse(localStorage.getItem("user"))?.id;
  const employeeName = JSON.parse(localStorage.getItem("user"))?.name;

  useEffect(() => {
    const fetchLastOvertime = async () => {
      try {
        const response = await axios.get(
          `${backendURL}/api/overtime/latest?employeeID=${employeeID}`
        );
        setLastOvertime(response.data);
      } catch (err) {
        console.error("Error fetching last overtime request:", err);
      }
    };
    fetchLastOvertime();
  }, [employeeID]);

  const handleRequestOvertime = async () => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (lastOvertime) {
      const lastRequestTime = new Date(lastOvertime.overtimeDate);
      const now = new Date();
      const timeDiff = now - lastRequestTime;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        setError("You can only request one overtime per day.");
        setIsSubmitting(false);
        return;
      }
    }

    if (!overtimeTime) {
      setError("Please specify overtime hours.");
      setIsSubmitting(false);
      return;
    }

    const overtimeData = {
      employeeID,
      overtimeTime,
      overtimeNote,
      overtimeDate: new Date().toISOString(),
      status: "Pending",
    };

    try {
      await axios.post(`${backendURL}/api/overtime`, overtimeData);
      setSuccess("Overtime request submitted successfully!");
      setOvertimeTime("");
      setOvertimeNote("");
      setLastOvertime(overtimeData);

      // Fetch all admins and send email notifications
      const adminsResponse = await axios.get(`${backendURL}/api/admins`);
      const admins = adminsResponse.data;

      for (const admin of admins) {
        await axios.post(`${backendURL}/api/send-overtime-email`, {
          adminEmail: admin.email,
          adminName: `${admin.firstName} ${admin.lastName}`,
          employeeName,
          overtimeTime,
          overtimeNote,
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || "");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "None";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full">
      <h1 className="hidden md:block text-2xl font-semibold text-gray-800 mb-8">
        Request Overtime
      </h1>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-5">
          <div className="flex items-center">
            <Clock size={24} className="text-white" />
            <h2 className="ml-3 text-xl font-medium text-white">
              Overtime Request Form
            </h2>
          </div>
        </div>

        <div className="p-6">
          {lastOvertime && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center mb-2">
                <CalendarClock size={18} className="text-yellow-600" />
                <h3 className="ml-2 font-medium text-gray-700">Summary</h3>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Date:</span> {formatDate(lastOvertime.overtimeDate)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Hours:</span> {lastOvertime.overtimeTime}
              </p>
            </div>
          )}

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>}
          {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">{success}</div>}

          <div className="space-y-6">
            <div>
              <label htmlFor="overtime-hour" className="block text-gray-700 font-medium mb-2">
                Overtime Hours <span className="text-red-500">*</span>
              </label>
              <input
                id="overtime-hour"
                type="number"
                min="1"
                step="0.5"
                placeholder="Enter hours"
                value={overtimeTime}
                onChange={(e) => setOvertimeTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="overtime-note" className="block text-gray-700 font-medium mb-2">
                Reason for Overtime
              </label>
              <textarea
                id="overtime-note"
                rows="4"
                placeholder="Explain why you need overtime hours"
                value={overtimeNote}
                onChange={(e) => setOvertimeNote(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="button"
              onClick={handleRequestOvertime}
              disabled={isSubmitting}
              className={`w-full px-6 py-3 text-sm font-medium rounded-lg transition-all ${isSubmitting ? "bg-yellow-300 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500"} text-white`}
            >
              {isSubmitting ? "Submitting..." : "Request Overtime"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}