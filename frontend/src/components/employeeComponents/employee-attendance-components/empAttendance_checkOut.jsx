import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../../urls/URL";
import { Clock, CheckCircle, Loader, LogOut } from "lucide-react";

export default function EmpAttendanceCheckOut() {
  const [alreadyCheckedOut, setAlreadyCheckedOut] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
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
        setHasCheckedIn(checkInResponse.data.checkedIn);

        // Fetch check-out status only if checked in
        if (checkInResponse.data.checkedIn) {
          const checkOutResponse = await axios.get(
            `${backendURL}/api/checkout/status/${employeeID}`
          );
          setAlreadyCheckedOut(checkOutResponse.data.checkedOut);
        }
      } catch (error) {
      }
      setLoading(false);
    };

    fetchAttendanceStatus();

    // Update current time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [employeeID]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full max-w-lg px-6 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-8 text-white">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <LogOut className="mr-3" size={28} />
            Attendance Check-Out
          </h1>
          <p className="opacity-80">Record your daily attendance</p>
        </div>

        <div className="p-6">
          <div className="mb-8 text-center">
            <p className="text-gray-500 mb-1">Current Time</p>
            <div className="text-3xl font-mono font-semibold text-gray-800">
              {formatTime(currentTime)}
            </div>
            <p className="text-gray-600 mt-2">{formatDate(currentTime)}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-5 mb-6">
            <div className="flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center">
                  <Loader className="animate-spin text-yellow-500 mb-2" size={32} />
                  <p className="text-gray-600">Checking status...</p>
                </div>
              ) : !hasCheckedIn ? (
                <div className="flex flex-col items-center">
                  <Clock className="text-amber-500 mb-2" size={48} />
                  <p className="text-xl font-semibold text-amber-600">You need to check in first</p>
                  <p className="text-gray-600 mt-1">Please check in before checking out</p>
                </div>
              ) : alreadyCheckedOut ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="text-green-500 mb-2" size={48} />
                  <p className="text-xl font-semibold text-green-600">You're already checked out</p>
                  <p className="text-gray-600 mt-1">See you tomorrow!</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-700 mb-2">Ready to end your day?</p>
                  <p className="text-gray-600 mb-4">Click the button below to check out</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <a 
              href={!hasCheckedIn || alreadyCheckedOut ? "#" : "./opencamcheckout"} 
              className={`block w-full ${
                !hasCheckedIn || alreadyCheckedOut || loading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <button
                type="button"
                disabled={!hasCheckedIn || alreadyCheckedOut || loading}
                className={`px-6 py-4 w-full rounded-lg text-white font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  !hasCheckedIn || alreadyCheckedOut || loading
                    ? "bg-gray-400"
                    : "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 focus:ring-yellow-500"
                }`}
              >
                {loading
                  ? "Checking..."
                  : !hasCheckedIn
                  ? "Check In First"
                  : alreadyCheckedOut
                  ? "Already Checked Out"
                  : "Check Out Now"}
              </button>
            </a>
            
            <a 
              href={!hasCheckedIn || alreadyCheckedOut ? "#" : "./requestovertime"} 
              className={`block w-full ${
                !hasCheckedIn || alreadyCheckedOut || loading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <button
                type="button"
                disabled={!hasCheckedIn || alreadyCheckedOut || loading}
                className={`px-6 py-4 w-full rounded-lg text-white font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  !hasCheckedIn || alreadyCheckedOut || loading
                    ? "bg-gray-400"
                    : "bg-gray-700 hover:bg-gray-800 active:bg-gray-900 focus:ring-gray-700"
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
          
          {!loading && hasCheckedIn && !alreadyCheckedOut && (
            <p className="text-center text-gray-500 text-sm mt-4">
              Your check-out will be recorded with the current timestamp
            </p>
          )}
        </div>
      </div>
    </div>
  );
}