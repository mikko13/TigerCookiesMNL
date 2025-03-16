import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import axios from "axios";
import Swal from "sweetalert2";
import * as faceapi from "face-api.js/dist/face-api.min.js";
import { backendURL } from "../../../urls/URL";
import { Camera, RefreshCw, Upload, User, AlertCircle } from "lucide-react";

export default function EmpAttendanceOpenCamCheckOut() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);
  const [employeeID, setEmployeeID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function loadModels() {
      setMessage("Loading face detection models...");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);

      setMessage("Face detection ready. Please position yourself.");

      setTimeout(() => startFaceDetection(), 500);
    }

    loadModels();

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setEmployeeID(user.id);
      setUserName(`${user.firstName} ${user.lastName}`);
      checkAttendanceStatus(user.id);
    } else {
      navigate("/CheckOut");
    }
  }, []);

  const checkAttendanceStatus = async (id) => {
    try {
      // Check if user has checked in
      const checkInResponse = await axios.get(
        `${backendURL}/api/checkin/status/${id}`
      );

      if (!checkInResponse.data.checkedIn) {
        navigate("/CheckOut");
        return;
      }

      // Check if user has already checked out
      const checkOutResponse = await axios.get(
        `${backendURL}/api/checkout/status/${id}`
      );

      if (checkOutResponse.data.checkedOut) {
        navigate("/CheckOut");
        return;
      }
    } catch (error) {
      navigate("/CheckOut");
    }
    setLoading(false);
  };

  const startFaceDetection = () => {
    setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video) {
        const video = webcamRef.current.video;
        if (video.readyState === 4) {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          if (detections.length === 1) {
            setFaceDetected(true);
            setMessage("Face detected, you can capture now.");
            drawDetections(detections);
          } else {
            setFaceDetected(false);
            setMessage(
              detections.length > 1
                ? "Multiple faces detected. Please position only one person."
                : "No face detected. Please position yourself."
            );
          }
        }
      }
    }, 1000);
  };

  const drawDetections = (detections) => {
    if (!detections || detections.length === 0) return;

    const video = webcamRef.current.video;
    if (!video) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    faceapi.matchDimensions(canvas, {
      width: video.videoWidth,
      height: video.videoHeight,
    });

    const resized = faceapi.resizeResults(detections, {
      width: video.videoWidth,
      height: video.videoHeight,
    });

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.scale(-1, 1);
    context.translate(-canvas.width, 0);

    faceapi.draw.drawDetections(context, resized);
    faceapi.draw.drawFaceLandmarks(context, resized);
    faceapi.draw.drawFaceExpressions(context, resized);

    context.restore();
  };

  const capture = () => {
    if (faceDetected) {
      const imgSrc = webcamRef.current.getScreenshot();
      setImage(imgSrc);
      setMessage("Image captured successfully!");
    } else {
      setMessage("No face detected! Please try again.");
    }
  };

  const uploadAttendance = async (e) => {
    if (e) e.preventDefault();

    if (!image) {
      await Swal.fire({
        title: "No Image Captured",
        text: "Please capture an image before checking out.",
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

    setMessage("Processing check-out...");

    const currentDateTime = new Date();
    const checkOutDate = currentDateTime.toISOString().split("T")[0];
    const checkOutTime = currentDateTime.toTimeString().split(" ")[0];

    const blob = await fetch(image).then((res) => res.blob());
    const file = new File([blob], `checkout_${employeeID}.png`, {
      type: "image/png",
    });

    const formData = new FormData();
    formData.append("employeeID", employeeID);
    formData.append("checkOutDate", checkOutDate);
    formData.append("checkOutTime", checkOutTime);
    formData.append("checkOutPhoto", file);

    try {
      const response = await axios.post(
        `${backendURL}/api/checkout`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        await Swal.fire({
          title: "Check Out Successful!",
          text: "You have successfully checked out.",
          icon: "success",
          confirmButtonText: "Proceed",
        });

        navigate("/CheckIn"); // Navigate only AFTER alert
      } else {
        await Swal.fire({
          title: "Check-Out Failed",
          text: response.data.message || "An error occurred. Try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {

      await Swal.fire({
        title: "Error",
        text: "Error checking out. Please try again later.",
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 py-4 px-6">
          <h1 className="text-2xl font-bold text-white text-center">
            Employee Check-Out
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
                    className="w-full h-full object-cover"
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

            {/* Status indicator */}
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
                disabled={!faceDetected}
                className={`flex items-center justify-center w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                  faceDetected
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
                  className="flex items-center justify-center py-3 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-all"
                >
                  <Upload size={18} className="mr-2" />
                  Check Out
                </button>
              </div>
            )}
          </div>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg flex items-start ${
                message.includes("successfully")
                  ? "bg-green-50 text-green-700"
                  : message.includes("Error") || message.includes("failed")
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
              <li>After capturing, verify your image before checking out</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
