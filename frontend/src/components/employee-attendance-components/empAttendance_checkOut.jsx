import React, { useState, useEffect } from "react";
import axios from "axios";

export default function EmpAttendanceCheckOut() {
  const [alreadyCheckedOut, setAlreadyCheckedOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const employeeID = JSON.parse(localStorage.getItem("user"))?.id; // Get employee ID from localStorage

  useEffect(() => {
    const checkIfCheckedOut = async () => {
      if (!employeeID) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/checkout/status/${employeeID}`
        );
        setAlreadyCheckedOut(response.data.checkedOut);
      } catch (error) {
        console.error("Error checking check-out status:", error);
      }
      setLoading(false);
    };

    checkIfCheckedOut();
  }, [employeeID]);

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-6">Attendance</h1>

      <a href={alreadyCheckedOut ? "#" : "./opencamcheckout"}>
        <button
          type="button"
          disabled={alreadyCheckedOut || loading}
          className={`px-6 py-3 mt-6 w-full text-sm rounded-md transition-all focus:ring-2 ${
            alreadyCheckedOut || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 focus:ring-yellow-500 text-white"
          }`}
        >
          {loading
            ? "Checking..."
            : alreadyCheckedOut
            ? "Already Checked Out"
            : "Check Out"}
        </button>
      </a>

      <a href={alreadyCheckedOut ? "#" : "./requestovertime"}>
        <button
          type="button"
          disabled={alreadyCheckedOut || loading}
          className={`px-6 py-3 mt-2 w-full text-sm rounded-md transition-all focus:ring-2 ${
            alreadyCheckedOut || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-700 hover:bg-gray-800 active:bg-gray-900 focus:ring-gray-900 text-white"
          }`}
        >
          {loading
            ? "Checking..."
            : alreadyCheckedOut
            ? "Cannot Request Overtime"
            : "Request Overtime"}
        </button>
      </a>
    </div>
  );
}
