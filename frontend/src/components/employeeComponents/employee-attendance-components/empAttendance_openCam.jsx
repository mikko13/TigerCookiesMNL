import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Webcam from "react-webcam";
import axios from "axios";
import Swal from "sweetalert2";
import * as faceapi from "face-api.js/dist/face-api.min.js";
import { backendURL } from "../../../urls/URL";
import {
  Camera,
  RefreshCw,
  Upload,
  User,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function EmpAttendanceOpenCam() {
  const navigate = useNavigate();
  const location = useLocation();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);
  const [employeeID, setEmployeeID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [shift, setShift] = useState("");
  const [detectionInterval, setDetectionInterval] = useState(null);
  const [shiftAvailable, setShiftAvailable] = useState(true);

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
    // Check shift availability continuously
    const interval = setInterval(() => {
      checkShiftAvailability();
    }, 1000);

    return () => clearInterval(interval);
  }, [shift]);

  const checkShiftAvailability = () => {
    if (!shift) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const shiftKey = shift.toLowerCase();
    const shiftConfig = shiftTimes[shiftKey];

    if (!shiftConfig) {
      setShiftAvailable(false);
      return;
    }

    // Check if current time is after the shift cutoff
    const cutoffPassed =
      currentHour > shiftConfig.cutoff.hour ||
      (currentHour === shiftConfig.cutoff.hour &&
        currentMinute >= shiftConfig.cutoff.minute);

    // Check if current time is within the available window
    const isAvailable =
      !cutoffPassed &&
      (currentHour > shiftConfig.available.hour ||
        (currentHour === shiftConfig.available.hour &&
          currentMinute >= shiftConfig.available.minute));

    setShiftAvailable(isAvailable);

    if (!isAvailable) {
      setMessage(`The ${shift} shift is no longer available for check-in`);
    }
  };

  useEffect(() => {
    // Get the shift from the URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const shiftParam = queryParams.get("shift");
    if (shiftParam) {
      setShift(shiftParam);
    } else {
      navigate("/CheckIn");
    }

    async function loadModels() {
      setMessage("Loading face detection models...");
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ]);
        setMessage("Face detection ready. Please position yourself.");
        startFaceDetection();
      } catch (error) {
        setMessage("Failed to load face detection models");
        console.error("Model loading error:", error);
      }
    }

    // Check user and load models
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setEmployeeID(user.id);
      setUserName(`${user.firstName} ${user.lastName}`);
      checkIfCheckedIn(user.id);
      loadModels();
    } else {
      navigate("/CheckIn");
    }

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [navigate, location.search]);

  const checkIfCheckedIn = async (id) => {
    try {
      const response = await axios.get(
        `${backendURL}/api/checkin/status/${id}`
      );
      if (response.data.checkedIn) {
        navigate("/CheckIn");
      }
    } catch (error) {
      console.error("Check-in status error:", error);
    }
    setLoading(false);
  };

  const startFaceDetection = () => {
    // Clear any existing interval
    if (detectionInterval) {
      clearInterval(detectionInterval);
    }

    const interval = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video) {
        const video = webcamRef.current.video;
        if (video.readyState === 4) {
          try {
            const detections = await faceapi
              .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions();

            // Filter out invalid detections
            const validDetections = detections.filter(
              (det) =>
                det.detection?.box &&
                !Object.values(det.detection.box).some(
                  (val) => val === null || val === undefined
                )
            );

            if (validDetections.length === 1) {
              setFaceDetected(true);
              setMessage("Face detected, you can capture now.");
              drawDetections(validDetections);
            } else {
              setFaceDetected(false);
              setMessage(
                validDetections.length > 1
                  ? "Multiple faces detected. Please position only one person."
                  : "No face detected. Please position yourself."
              );
              // Clear canvas if no valid detections
              const canvas = canvasRef.current;
              if (canvas) {
                const context = canvas.getContext("2d");
                context.clearRect(0, 0, canvas.width, canvas.height);
              }
            }
          } catch (error) {
            console.error("Face detection error:", error);
            setFaceDetected(false);
            setMessage("Face detection error. Please try again.");
          }
        }
      }
    }, 1000);

    setDetectionInterval(interval);
  };

  const drawDetections = (detections) => {
    if (!detections || detections.length === 0 || !webcamRef.current?.video)
      return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Only proceed if we have valid detections
    const validDetections = detections.filter(
      (det) =>
        det.detection?.box &&
        !Object.values(det.detection.box).some(
          (val) => val === null || val === undefined
        )
    );

    if (validDetections.length === 0) return;

    // Resize detections to match video dimensions
    const resizedDetections = faceapi.resizeResults(validDetections, {
      width: video.videoWidth,
      height: video.videoHeight,
    });

    // Draw with mirror effect
    context.save();
    context.scale(-1, 1);
    context.translate(-canvas.width, 0);

    resizedDetections.forEach((detection) => {
      faceapi.draw.drawDetections(context, [detection]);
      faceapi.draw.drawFaceLandmarks(context, [detection]);
      faceapi.draw.drawFaceExpressions(context, [detection]);
    });

    context.restore();
  };

  const capture = () => {
    if (!shiftAvailable) {
      setMessage("This shift is no longer available for check-in");
      return;
    }

    if (faceDetected) {
      const imgSrc = webcamRef.current.getScreenshot();
      setImage(imgSrc);
      setMessage("Image captured successfully!");
    } else {
      setMessage("No face detected! Please try again.");
    }
  };

  const uploadAttendance = async (e) => {
    e.preventDefault();

    if (!shiftAvailable) {
      await Swal.fire({
        title: "Shift Unavailable",
        text: `The ${shift} shift is no longer available for check-in.`,
        icon: "error",
        confirmButtonText: "OK",
      });
      navigate("/CheckIn");
      return;
    }

    if (!image) {
      await Swal.fire({
        title: "No Image Captured",
        text: "Please capture an image before checking in.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!employeeID) {
      await Swal.fire({
        title: "Error",
        text: "Employee ID not found. Please log in again.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!shift) {
      await Swal.fire({
        title: "Error",
        text: "Shift information not found. Please go back and select a shift.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    setMessage("Processing check-in...");

    const currentDateTime = new Date();
    const checkInDate = currentDateTime.toISOString().split("T")[0];
    const checkInTime = currentDateTime.toTimeString().split(" ")[0];

    const blob = await fetch(image).then((res) => res.blob());
    const file = new File([blob], `checkin_${employeeID}.png`, {
      type: "image/png",
    });

    const formData = new FormData();
    formData.append("employeeID", employeeID);
    formData.append("checkInDate", checkInDate);
    formData.append("checkInTime", checkInTime);
    formData.append("checkInPhoto", file);
    formData.append("shift", shift);

    try {
      const response = await axios.post(`${backendURL}/api/checkin`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        await Swal.fire({
          title: "Check-In Successful!",
          text: "You have successfully checked in.",
          icon: "success",
          confirmButtonText: "Proceed",
        });

        navigate("/checkout");
      } else {
        await Swal.fire({
          title: "Check-In Failed",
          text: response.data.message || "An error occurred. Try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: "Failed to check-in. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading attendance system...</p>
      </div>
    );
  }

  if (!shiftAvailable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 py-6 px-6 text-center">
            <Clock className="mx-auto mb-3 text-white" size={48} />
            <h1 className="text-2xl font-bold text-white">Shift Unavailable</h1>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-700 mb-4">
              The {shift} shift is no longer available for check-in.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Please return to the check-in page and select an available shift.
            </p>
            <button
              onClick={() => navigate("/CheckIn")}
              className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-all"
            >
              Return to Check-In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 py-4 px-6">
          <h1 className="text-2xl font-bold text-white text-center">
            Employee Check-In
          </h1>
          <div className="flex justify-between items-center mt-2">
            <div className="text-white text-sm">
              <p>{getCurrentDate()}</p>
              <p>{getCurrentTime()}</p>
            </div>
            <div className="flex items-center text-white text-sm">
              <User size={16} className="mr-1" />
              <span>{userName || "Employee"}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {shift && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
              <p className="font-medium">Selected Shift:</p>
              <p>{shift}</p>
            </div>
          )}

          <div className="relative w-full mb-6 bg-gray-100 rounded-lg overflow-hidden">
            <div className="aspect-w-4 aspect-h-3 w-full">
              {image ? (
                <img
                  src={image}
                  alt="Captured Employee"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/png"
                    className="w-640px h-580px object-cover"
                    mirrored={true}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                  />
                  {!faceDetected && !loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-3">
                        <User size={64} className="text-white opacity-50" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div
              className={`absolute top-4 right-4 flex items-center px-3 py-1 rounded-full ${
                faceDetected ? "bg-green-500" : "bg-yellow-500"
              } text-white text-xs font-medium`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  faceDetected ? "bg-white animate-pulse" : "bg-white"
                }`}
              ></div>
              {faceDetected ? "Face Detected" : "Waiting for Face"}
            </div>
          </div>

          <div className="space-y-3">
            {!image ? (
              <button
                onClick={capture}
                disabled={!faceDetected || !shiftAvailable}
                className={`flex items-center justify-center w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                  faceDetected && shiftAvailable
                    ? "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <Camera size={20} className="mr-2" />
                {faceDetected ? "Capture Photo" : "Position Your Face"}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setImage(null)}
                  className="flex items-center justify-center py-3 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Retake
                </button>
                <button
                  onClick={uploadAttendance}
                  disabled={!shiftAvailable}
                  className={`flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all ${
                    shiftAvailable
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-gray-400 text-gray-700 cursor-not-allowed"
                  }`}
                >
                  <Upload size={18} className="mr-2" />
                  Check In
                </button>
              </div>
            )}
          </div>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg flex items-start ${
                message.includes("successfully")
                  ? "bg-green-50 text-green-700"
                  : message.includes("Error") ||
                    message.includes("failed") ||
                    message.includes("no longer available")
                  ? "bg-red-50 text-red-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Instructions:
            </h3>
            <ul className="text-xs text-gray-500 space-y-1 list-disc pl-5">
              <li>Position yourself clearly in front of the camera</li>
              <li>Ensure good lighting for best results</li>
              <li>Make sure only your face is visible in the frame</li>
              <li>After capturing, verify your image before checking in</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
