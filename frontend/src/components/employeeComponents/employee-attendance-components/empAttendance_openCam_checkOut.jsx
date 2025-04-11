import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Webcam from "react-webcam";
import axios from "axios";
import Swal from "sweetalert2";
import * as faceapi from "face-api.js/dist/face-api.min.js";
import { backendURL } from "../../../urls/URL";
import { Camera, RefreshCw, Upload, User, AlertCircle } from "lucide-react";

export default function EmpAttendanceOpenCamCheckOut() {
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
  const [detectionInterval, setDetectionInterval] = useState(null);
  const [facePositionValid, setFacePositionValid] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
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
          position: 'top-end',
          icon: 'success',
          title: 'Face detection models loaded successfully',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });

        setMessage("Face detection ready. Please position yourself.");
        startFaceDetection();
      } catch (error) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Failed to load face detection models',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });

        setMessage("Failed to load face detection models");
        console.error("Model loading error:", error);
      }
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setEmployeeID(user.id);
      setUserName(`${user.firstName} ${user.lastName}`);
      checkAttendanceStatus(user.id);
      loadModels();
    } else {
      navigate("/CheckOut");
    }

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [navigate, location.search]);

  const checkAttendanceStatus = async (id) => {
    try {
      const checkInResponse = await axios.get(
        `${backendURL}/api/checkin/status/${id}`
      );

      if (!checkInResponse.data.checkedIn) {
        await Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'warning',
          title: 'You need to check in first',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        navigate("/CheckOut");
        return;
      }

      const checkOutResponse = await axios.get(
        `${backendURL}/api/checkout/status/${id}`
      );

      if (checkOutResponse.data.checkedOut) {
        await Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'You have already checked out',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        navigate("/CheckOut");
        return;
      }
    } catch (error) {
      await Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Error checking attendance status',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      navigate("/CheckOut");
    }
    setLoading(false);
  };

  const ovalParams = {
    centerX: 320,
    centerY: 240,
    radiusX: 120,
    radiusY: 160
  };

  const isFaceInOval = (detection) => {
    const box = detection.detection.box;
    if (!box) return false;

    const faceCenterX = box.x + box.width / 2;
    const faceCenterY = box.y + box.height / 2;

    const normalizedX = (faceCenterX - ovalParams.centerX) / ovalParams.radiusX;
    const normalizedY = (faceCenterY - ovalParams.centerY) / ovalParams.radiusY;
    const distance = normalizedX * normalizedX + normalizedY * normalizedY;

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
  
            const validDetections = detections.filter(det => {
              const box = det.detection?.box;
              return box && 
                    typeof box.x === 'number' && 
                    typeof box.y === 'number' &&
                    typeof box.width === 'number' && 
                    typeof box.height === 'number' &&
                    box.width > 0 && 
                    box.height > 0;
            });
  
            if (validDetections.length === 1) {
              const isInOval = isFaceInOval(validDetections[0]);
              setFacePositionValid(isInOval);
              setFaceDetected(true);
              setMessage(isInOval 
                ? "Face detected and properly positioned. You can capture now." 
                : "Face detected but not properly positioned. Center your face in the oval.");
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
    if (faceDetected && facePositionValid) {
      const imgSrc = webcamRef.current.getScreenshot();
      setImage(imgSrc);
      setMessage("Image captured successfully!");
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Photo captured successfully',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } else if (!facePositionValid) {
      setMessage("Please position your face properly within the oval before capturing.");
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

    const processingToast = Swal.fire({
      title: 'Processing Check-Out',
      html: 'Please wait while we process your check-out...',
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const currentDateTime = new Date();
    const checkOutDate = currentDateTime.toISOString().split("T")[0];
    const checkOutTime = currentDateTime.toTimeString().split(" ")[0];

    try {
      const blob = await fetch(image).then((res) => res.blob());
      const file = new File([blob], `checkout_${employeeID}.png`, {
        type: "image/png",
      });

      const formData = new FormData();
      formData.append("employeeID", employeeID);
      formData.append("checkOutDate", checkOutDate);
      formData.append("checkOutTime", checkOutTime);
      formData.append("checkOutPhoto", file);

      const response = await axios.post(
        `${backendURL}/api/checkout`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      await processingToast.close();

      if (response.data.success) {
        await Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Check-out successful!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        await Swal.fire({
          title: "Check Out Successful!",
          text: "You have successfully checked out.",
          icon: "success",
          confirmButtonText: "Proceed",
        });

        navigate("/CheckIn");
      } else {
        await Swal.fire({
          title: "Check-Out Failed",
          text: response.data.message || "An error occurred. Try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      await processingToast.close();
      
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
          <div className="flex flex-col md:flex-row justify-between items-center mt-2 space-y-2 md:space-y-0">
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
            {image ? (
              <div className="relative w-full h-auto">
                <img 
                  src={image} 
                  alt="Captured" 
                  className="w-full h-auto max-h-[480px] object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="relative" style={{ paddingBottom: '75%' }}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/png"
                  mirrored={true}
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                  videoConstraints={{
                    width: 640,
                    height: 480,
                    facingMode: "user",
                  }}
                  forceScreenshotSourceSize={true}
                />

                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full z-20"
                  style={{ display: 'none' }}
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
                          <rect x="0" y="0" width="100%" height="100%" fill="white" />
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
                    <p className="text-sm font-medium drop-shadow-md">
                      Please place your face inside the oval and ensure it's properly centered
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {!image ? (
              <button
                onClick={capture}
                disabled={!facePositionValid}
                className={`flex items-center justify-center w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                  facePositionValid
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
            <h3 className="text-m font-medium text-gray-500 mb-2">
              Instructions:
            </h3>
            <ul className="text-sm text-gray-500 space-y-1 list-disc pl-5">
              <li>Position yourself clearly in front of the camera</li>
              <li>Ensure good lighting for best results</li>
              <li>Make sure only your face is visible in the frame</li>
              <li>After capturing, verify your image before checking out</li>
              <li>Background must be at the SHOP</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}