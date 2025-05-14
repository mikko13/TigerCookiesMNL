import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backendURL } from "../../../urls/URL";
import {
  Clock,
  CheckCircle,
  Loader,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function EmpAttendanceCheckIn() {
  const navigate = useNavigate();
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState("");
  const [showShiftSelection, setShowShiftSelection] = useState(false);
  const [availableShifts, setAvailableShifts] = useState({
    morning: false,
    afternoon: false,
  });
  const employeeID = JSON.parse(localStorage.getItem("user"))?.id;

  // Define shift times (24-hour format)
  const shiftTimes = {
    morning: {
      start: { hour: 9, minute: 0 }, // 9:00 AM
      available: { hour: 8, minute: 30 }, // 8:30 AM (30 min before)
      cutoff: { hour: 18, minute: 1 }, // 6:01 PM (cutoff time)
    },
    afternoon: {
      start: { hour: 13, minute: 0 }, // 1:00 PM
      available: { hour: 12, minute: 30 }, // 12:30 PM (30 min before)
      cutoff: { hour: 22, minute: 1 }, // 10:01 PM (cutoff time)
    },
  };

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
      } catch (error) {}
      setLoading(false);
    };

    checkIfCheckedIn();

    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check if shifts are available based on current time
      updateShiftAvailability(now);
    }, 1000);

    return () => clearInterval(interval);
  }, [employeeID]);

  const updateShiftAvailability = (now) => {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if current time is after the morning shift cutoff (6:01 PM)
    const morningCutoffPassed =
      currentHour > shiftTimes.morning.cutoff.hour ||
      (currentHour === shiftTimes.morning.cutoff.hour &&
        currentMinute >= shiftTimes.morning.cutoff.minute);

    // Check if current time is after the afternoon shift cutoff (10:01 PM)
    const afternoonCutoffPassed =
      currentHour > shiftTimes.afternoon.cutoff.hour ||
      (currentHour === shiftTimes.afternoon.cutoff.hour &&
        currentMinute >= shiftTimes.afternoon.cutoff.minute);

    // Check morning shift availability (available from 8:30 AM until 6:01 PM)
    const morningAvailable =
      !morningCutoffPassed &&
      (currentHour > shiftTimes.morning.available.hour ||
        (currentHour === shiftTimes.morning.available.hour &&
          currentMinute >= shiftTimes.morning.available.minute));

    // Check afternoon shift availability (available from 12:30 PM until 10:01 PM)
    const afternoonAvailable =
      !afternoonCutoffPassed &&
      (currentHour > shiftTimes.afternoon.available.hour ||
        (currentHour === shiftTimes.afternoon.available.hour &&
          currentMinute >= shiftTimes.afternoon.available.minute));

    setAvailableShifts({
      morning: morningAvailable,
      afternoon: afternoonAvailable,
    });
  };

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

  const handleCheckInClick = () => {
    // Only show shift selection if at least one shift is available
    if (availableShifts.morning || availableShifts.afternoon) {
      setShowShiftSelection(true);
    }
  };

  const handleShiftSelect = (shift) => {
    setSelectedShift(shift);
    navigate(`/opencam?shift=${encodeURIComponent(shift)}`);
  };

  const getTimeUntilAvailable = (shiftKey) => {
    const now = new Date();
    const availableHour = shiftTimes[shiftKey].available.hour;
    const availableMinute = shiftTimes[shiftKey].available.minute;

    // Create a date object for when the shift becomes available
    let availableTime = new Date(now);
    availableTime.setHours(availableHour, availableMinute, 0);

    // If the time has already passed today, it's not available
    if (now > availableTime) {
      return null;
    }

    // Calculate the difference in minutes
    const diffMs = availableTime - now;
    const diffMinutes = Math.ceil(diffMs / 60000);

    if (diffMinutes <= 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours} hour${hours !== 1 ? "s" : ""} ${
        minutes > 0 ? `and ${minutes} minute${minutes !== 1 ? "s" : ""}` : ""
      }`;
    }
  };

  const getMorningShiftMessage = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const cutoffHour = shiftTimes.morning.cutoff.hour;
    const cutoffMinute = shiftTimes.morning.cutoff.minute;

    const morningCutoffPassed =
      currentHour > cutoffHour ||
      (currentHour === cutoffHour && currentMinute >= cutoffMinute);

    if (morningCutoffPassed) {
      return "Morning shift is no longer available after 6:01 PM";
    } else {
      return `Available in ${getTimeUntilAvailable("morning")}`;
    }
  };

  const getAfternoonShiftMessage = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const cutoffHour = shiftTimes.afternoon.cutoff.hour;
    const cutoffMinute = shiftTimes.afternoon.cutoff.minute;

    const afternoonCutoffPassed =
      currentHour > cutoffHour ||
      (currentHour === cutoffHour && currentMinute >= cutoffMinute);

    if (afternoonCutoffPassed) {
      return "Afternoon shift is no longer available after 10:01 PM";
    } else {
      return `Available in ${getTimeUntilAvailable("afternoon")}`;
    }
  };

  const anyShiftAvailable =
    availableShifts.morning || availableShifts.afternoon;

  return (
    <div className="w-full max-w-lg px-6 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-8 text-white">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Clock className="mr-3" size={28} />
            Attendance Check-In
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
                  <Loader
                    className="animate-spin text-yellow-500 mb-2"
                    size={32}
                  />
                  <p className="text-gray-600">Checking status...</p>
                </div>
              ) : alreadyCheckedIn ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="text-green-500 mb-2" size={48} />
                  <p className="text-xl font-semibold text-green-600">
                    You're already checked in
                  </p>
                  <p className="text-gray-600 mt-1">Have a productive day!</p>
                </div>
              ) : showShiftSelection ? (
                <div className="text-center w-full">
                  <div className="flex items-center justify-center mb-4">
                    <Calendar className="text-yellow-500 mr-2" size={24} />
                    <h3 className="text-xl font-semibold text-gray-700">
                      Select Your Shift
                    </h3>
                  </div>

                  <div className="space-y-3 mt-4">
                    <button
                      onClick={() => handleShiftSelect("Morning")}
                      disabled={!availableShifts.morning}
                      className={`w-full py-3 px-4 bg-white border rounded-lg text-left transition-all focus:outline-none ${
                        availableShifts.morning
                          ? "border-gray-300 hover:bg-yellow-50 hover:border-yellow-300 focus:ring-2 focus:ring-yellow-500"
                          : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-70"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">
                            Morning Shift
                          </p>
                          <p className="text-sm text-gray-500">
                            9:00 AM - 6:00 PM
                          </p>
                        </div>
                        {!availableShifts.morning && (
                          <div className="flex items-center text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            <Clock size={12} className="mr-1" />
                            <span>{getMorningShiftMessage()}</span>
                          </div>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => handleShiftSelect("Afternoon")}
                      disabled={!availableShifts.afternoon}
                      className={`w-full py-3 px-4 bg-white border rounded-lg text-left transition-all focus:outline-none ${
                        availableShifts.afternoon
                          ? "border-gray-300 hover:bg-yellow-50 hover:border-yellow-300 focus:ring-2 focus:ring-yellow-500"
                          : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-70"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">
                            Afternoon Shift
                          </p>
                          <p className="text-sm text-gray-500">
                            1:00 PM - 10:00 PM
                          </p>
                        </div>
                        {!availableShifts.afternoon && (
                          <div className="flex items-center text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            <Clock size={12} className="mr-1" />
                            <span>{getAfternoonShiftMessage()}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowShiftSelection(false)}
                    className="mt-4 text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Go back
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    Ready to start your day?
                  </p>
                  <p className="text-gray-600 mb-4">
                    Click the button below to check in
                  </p>
                  {!anyShiftAvailable && (
                    <div className="flex items-center justify-center text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg mt-2">
                      <AlertCircle size={18} className="mr-2" />
                      <p className="text-sm">
                        No shifts available yet. Morning shift opens at 8:30 AM
                        until 6:01 PM and Afternoon shift at 12:30 PM until
                        10:01 PM.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {!loading && !alreadyCheckedIn && !showShiftSelection && (
            <button
              type="button"
              onClick={handleCheckInClick}
              disabled={!anyShiftAvailable}
              className={`px-6 py-4 w-full rounded-lg text-white font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                anyShiftAvailable
                  ? "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 focus:ring-yellow-500"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {anyShiftAvailable ? "Check In Now" : "No Shifts Available Yet"}
            </button>
          )}

          {!loading && !alreadyCheckedIn && !showShiftSelection && (
            <p className="text-center text-gray-500 text-sm mt-4">
              {anyShiftAvailable
                ? "Your check-in will be recorded with the current timestamp"
                : "Morning shift is available from 8:30 AM to 6:01 PM. Afternoon shift from 12:30 PM to 10:01 PM."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
