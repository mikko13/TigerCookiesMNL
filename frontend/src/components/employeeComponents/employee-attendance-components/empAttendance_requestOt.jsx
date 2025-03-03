import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../../urls/URL";

export default function EmpAttendanceRequestOt() {
  const [overtimeTime, setOvertimeTime] = useState("");
  const [overtimeNote, setOvertimeNote] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lastOvertime, setLastOvertime] = useState(null);
  const employeeID = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    const fetchLastOvertime = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/overtime/latest?employeeID=${employeeID}`);
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

    if (lastOvertime) {
      const lastRequestTime = new Date(lastOvertime.overtimeDate);
      const now = new Date();
      const timeDiff = now - lastRequestTime;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        setError("You can only request one overtime request at a time.");
        return;
      }
    }

    if (!overtimeTime) {
      setError("Overtime hours are required.");
      return;
    }

    const overtimeData = {
      employeeID,
      overtimeTime,
      overtimeNote,
      overtimeDate: new Date().toISOString(),
    };

    try {
      await axios.post(`${backendURL}/api/overtime`, overtimeData);
      setSuccess("Overtime request submitted successfully");
      setOvertimeTime("");
      setOvertimeNote("");
      setLastOvertime(overtimeData);
    } catch (error) {
      console.error("Error submitting overtime request:", error);
      setError(
        error.response?.data?.message || "Failed to submit overtime request."
      );
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-6">Request Overtime</h1>
      <div className="max-w-md mx-auto">
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <div className="mb-4">
          <label htmlFor="overtime-hour" className="block text-gray-700 font-medium mb-2">
            Input Overtime Hour
          </label>
          <input
            id="overtime-hour"
            type="number"
            placeholder="Enter hours"
            value={overtimeTime}
            onChange={(e) => setOvertimeTime(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="overtime-note" className="block text-gray-700 font-medium mb-2">
            Input Overtime Note
          </label>
          <textarea
            id="overtime-note"
            rows="4"
            placeholder="Enter your note"
            value={overtimeNote}
            onChange={(e) => setOvertimeNote(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          ></textarea>
        </div>
        <div className="flex space-x-4">
          <a href="./checkout">
            <button
              type="button"
              className="px-6 py-3 w-full text-sm bg-gray-700 hover:bg-gray-800 text-white rounded-md active:bg-gray-900 focus:ring-2 focus:ring-gray-900 transition-all"
            >
              Back
            </button>
          </a>
          <button
            type="button"
            onClick={handleRequestOvertime}
            className="px-6 py-3 w-full text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded-md active:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 transition-all"
          >
            Request Overtime
          </button>
        </div>
      </div>
    </div>
  );
}
