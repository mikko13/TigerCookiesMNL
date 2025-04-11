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
  const [facePositionValid, setFacePositionValid] = useState(false);
  const [webcamDimensions, setWebcamDimensions] = useState({
    width: 640,
    height: 480,
  });

  // Define oval dimensions (relative to 640x480 canvas)
  const ovalParams = {
    centerX: 320,
    centerY: 240,
    radiusX: 120,
    radiusY: 160,
  };

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

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Face detection models loaded successfully",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });

        setMessage("Face detection ready. Please position yourself.");
        startFaceDetection();
      } catch (error) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Failed to load face detection models",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });

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

  // Handle webcam video loaded - set dimensions for canvas
  const handleVideoLoad = () => {
    if (webcamRef.current && webcamRef.current.video) {
      const video = webcamRef.current.video;
      setWebcamDimensions({
        width: video.videoWidth || 640,
        height: video.videoHeight || 480,
      });
    }
  };

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

  // Check if face is within the oval boundaries
  const isFaceInOval = (detection) => {
    const box = detection.detection.box;
    if (!box) return false;

    // Get face center coordinates
    const faceCenterX = box.x + box.width / 2;
    const faceCenterY = box.y + box.height / 2;

    // Check if face center is within oval
    const normalizedX = (faceCenterX - ovalParams.centerX) / ovalParams.radiusX;
    const normalizedY = (faceCenterY - ovalParams.centerY) / ovalParams.radiusY;
    const distance = normalizedX * normalizedX + normalizedY * normalizedY;

    // Check if face size is appropriate (not too small or too large)
    const faceArea = box.width * box.height;
    const minFaceArea = 0.2 * ovalParams.radiusX * ovalParams.radiusY * Math.PI;
    const maxFaceArea = 0.8 * ovalParams.radiusX * ovalParams.radiusY * Math.PI;

    return distance <= 1 && faceArea >= minFaceArea && faceArea <= maxFaceArea;
  };

  const drawDetections = (detections, isInOval) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Remove all faceapi drawing calls from startFaceDetection
  const startFaceDetection = () => {
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

            const validDetections = detections.filter((det) => {
              const box = det.detection?.box;
              return (
                box &&
                typeof box.x === "number" &&
                typeof box.y === "number" &&
                typeof box.width === "number" &&
                typeof box.height === "number" &&
                box.width > 0 &&
                box.height > 0
              );
            });

            if (validDetections.length === 1) {
              const isInOval = isFaceInOval(validDetections[0]);
              setFacePositionValid(isInOval);
              setFaceDetected(true);
              setMessage(
                isInOval
                  ? "Face detected and properly positioned. You can capture now."
                  : "Face detected but not properly positioned. Center your face in the oval."
              );
            } else {
              setFaceDetected(false);
              setFacePositionValid(false);
              setMessage(
                validDetections.length > 1
                  ? "Multiple faces detected. Please position only one person."
                  : "No face detected. Please position yourself."
              );
            }
          } catch (error) {
            console.error("Face detection error:", error);
            setFaceDetected(false);
            setFacePositionValid(false);
            setMessage("Face detection error. Please try again.");
          }
        }
      }
    }, 1000);

    setDetectionInterval(interval);
  };

  const capture = () => {
    if (!shiftAvailable) {
      setMessage("This shift is no longer available for check-in");
      return;
    }

    if (faceDetected && facePositionValid && webcamRef.current) {
      // Ensure canvas dimensions match the video stream dimensions
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = webcamDimensions.width;
        canvas.height = webcamDimensions.height;
      }

      const imgSrc = webcamRef.current.getScreenshot();
      setImage(imgSrc);
      setMessage("Image captured successfully!");

      // Photo captured successfully toast
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Photo captured successfully",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } else if (!facePositionValid) {
      setMessage(
        "Please position your face properly within the oval before capturing."
      );
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

    // Processing Check-In toast
    const processingToast = Swal.fire({
      title: "Processing Check-In",
      html: "Please wait while we process your check-in...",
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
    });

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

      await processingToast.close();

      if (response.data.success) {
        // Check-in successful toast
        await Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Check-in successful",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

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
      await processingToast.close();
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2">
            <div className="text-white text-sm mb-2 sm:mb-0">
              <p>{getCurrentDate()}</p>
              <p>{getCurrentTime()}</p>
            </div>
            <div className="flex items-center text-white text-sm">
              <User size={16} className="mr-1" />
              <span>{userName || "Employee"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {shift && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
              <p className="font-medium">Selected Shift:</p>
              <p>{shift}</p>
            </div>
          )}

          {image ? (
            <div className="relative w-full max-w-[90vw] sm:max-w-[640px] min-h-[240px] sm:min-h-[480px] aspect-[4/3] mb-4 mx-auto">
              <img
                src={image}
                alt="Captured"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="relative w-full max-w-[90vw] sm:max-w-[640px] min-h-[240px] sm:min-h-[480px] aspect-[4/3] mb-4 mx-auto">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/png"
                mirrored={true}
                className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                videoConstraints={{
                  facingMode: "user",
                  width: 640,
                  height: 480,
                }}
                onUserMedia={handleVideoLoad}
              />

              <canvas
                ref={canvasRef}
                width={webcamDimensions.width}
                height={webcamDimensions.height}
                className="absolute top-0 left-0 w-full h-full z-20"
                style={{ display: "none" }}
              />

              <div className="absolute top-0 left-0 w-full h-full z-30 pointer-events-none">
                <div className="w-full h-full bg-black bg-opacity-50">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 640 480"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <mask id="mask">
                        <rect
                          x="0"
                          y="0"
                          width="100%"
                          height="100%"
                          fill="white"
                        />
                        <ellipse
                          cx={ovalParams.centerX}
                          cy={ovalParams.centerY}
                          rx={ovalParams.radiusX}
                          ry={ovalParams.radiusY}
                          fill="black"
                        />
                      </mask>
                    </defs>
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      fill="black"
                      fillOpacity="0.6"
                      mask="url(#mask)"
                    />
                    <ellipse
                      cx={ovalParams.centerX}
                      cy={ovalParams.centerY}
                      rx={ovalParams.radiusX}
                      ry={ovalParams.radiusY}
                      fill="none"
                      stroke="white"
                      strokeDasharray="6 6"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
                <div className="absolute bottom-4 w-full text-center text-white px-4">
                  <p className="text-xs sm:text-sm font-medium drop-shadow-md">
                    Please place your face inside the oval and ensure it's
                    properly centered
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {!image ? (
              <button
                onClick={capture}
                disabled={!facePositionValid || !shiftAvailable}
                className={`flex items-center justify-center w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                  facePositionValid && shiftAvailable
                    ? "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <Camera size={20} className="mr-2" />
                {faceDetected
                  ? facePositionValid
                    ? "Capture Photo"
                    : "Position Your Face Properly"
                  : "Position Your Face"}
              </button>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  : message.includes("properly positioned")
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-m font-medium text-gray-500 mb-2">
              Instructions:
            </h3>
            <ul className="text-sm text-gray-500 space-y-1 list-disc pl-5">
              <li>Position yourself clearly in front of the camera</li>
              <li>Ensure good lighting for best results</li>
              <li>Align your face within the oval guide</li>
              <li>Make sure only your face is visible in the frame</li>
              <li>After capturing, verify your image before checking in</li>
              <li>Background must be visible and at the SHOP</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
