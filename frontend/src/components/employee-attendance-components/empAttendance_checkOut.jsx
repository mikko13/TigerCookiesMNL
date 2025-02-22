import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../urls/URL";

export default function EmpAttendanceCheckOut() {
  const [alreadyCheckedOut, setAlreadyCheckedOut] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const employeeID = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      if (!employeeID) {
        setLoading(false);
        return;
      }

      try {
        // Fetch check-in status
        const checkInResponse = await axios.get(
          `${backendURL}/api/checkin/status/${employeeID}`
        );
        setHasCheckedIn(checkInResponse.data.checkedIn); // Update check-in state

        // Fetch check-out status only if checked in
        if (checkInResponse.data.checkedIn) {
          const checkOutResponse = await axios.get(
            `${backendURL}/api/checkout/status/${employeeID}`
          );
          setAlreadyCheckedOut(checkOutResponse.data.checkedOut);
        }
      } catch (error) {
        console.error("Error fetching attendance status:", error);
      }
      setLoading(false);
    };

    fetchAttendanceStatus();
  }, [employeeID]);

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-6">Attendance</h1>

      <a href={!hasCheckedIn || alreadyCheckedOut ? "#" : "./opencamcheckout"}>
        <button
          type="button"
          disabled={!hasCheckedIn || alreadyCheckedOut || loading}
          className={`px-6 py-3 mt-6 w-full text-sm rounded-md transition-all focus:ring-2 ${
            !hasCheckedIn || alreadyCheckedOut || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 focus:ring-yellow-500 text-white"
          }`}
        >
          {loading
            ? "Checking..."
            : !hasCheckedIn
            ? "Check In First"
            : alreadyCheckedOut
            ? "Already Checked Out"
            : "Check Out"}
        </button>
      </a>

      <a href={!hasCheckedIn || alreadyCheckedOut ? "#" : "./requestovertime"}>
        <button
          type="button"
          disabled={!hasCheckedIn || alreadyCheckedOut || loading}
          className={`px-6 py-3 mt-2 w-full text-sm rounded-md transition-all focus:ring-2 ${
            !hasCheckedIn || alreadyCheckedOut || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-700 hover:bg-gray-800 active:bg-gray-900 focus:ring-gray-900 text-white"
          }`}
        >
          {loading
            ? "Checking..."
            : !hasCheckedIn
            ? "Check In First"
            : alreadyCheckedOut
            ? "Cannot Request Overtime"
            : "Request Overtime"}
        </button>
      </a>
    </div>
  );
}
