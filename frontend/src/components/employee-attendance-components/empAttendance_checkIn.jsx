import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../urls/URL";

export default function EmpAttendanceCheckIn() {
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const employeeID = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    const checkIfCheckedIn = async () => {
      if (!employeeID) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${backendURL}/api/checkin/status/${employeeID}`
        );
        setAlreadyCheckedIn(response.data.checkedIn);
      } catch (error) {
        console.error("Error checking attendance status:", error);
      }
      setLoading(false);
    };

    checkIfCheckedIn();
  }, [employeeID]);

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-6">Attendance</h1>
      <a href={alreadyCheckedIn ? "#" : "./opencam"}>
        <button
          type="button"
          disabled={alreadyCheckedIn || loading}
          className={`px-6 py-3 mt-6 w-full text-sm rounded-md transition-all focus:ring-2 ${
            alreadyCheckedIn || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 focus:ring-yellow-500 text-white"
          }`}
        >
          {loading
            ? "Checking..."
            : alreadyCheckedIn
            ? "Already Checked In"
            : "Check In"}
        </button>
      </a>
    </div>
  );
}
