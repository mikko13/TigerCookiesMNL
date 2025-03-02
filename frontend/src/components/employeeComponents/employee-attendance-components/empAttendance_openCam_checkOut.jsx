import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import axios from "axios";
import Swal from "sweetalert2";
import * as faceapi from "face-api.js/dist/face-api.min.js";
import { backendURL } from "../../../urls/URL";

export default function EmpAttendanceOpenCamCheckOut() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);
  const [employeeID, setEmployeeID] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);
      startFaceDetection();
    }
    loadModels();

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setEmployeeID(user.id);
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
      console.error("Error fetching attendance status:", error);
      navigate("/CheckOut");
    }
    setLoading(false);
  };

  const startFaceDetection = () => {
    setInterval(async () => {
      if (webcamRef.current) {
        const video = webcamRef.current.video;
        if (video && video.readyState === 4) {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          if (detections.length === 1) {
            setFaceDetected(true);
            setMessage("Face detected, you can capture.");
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
    const video = webcamRef.current.video;
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

  const uploadAttendance = async () => {
    if (!image) {
      setMessage("No image captured.");
      return;
    }

    if (!employeeID) {
      setMessage("Employee ID not found. Please log in again.");
      return;
    }

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
          text: "Try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);

      await Swal.fire({
        title: "Error",
        text: "Error checking out. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  if (loading) {
    return (
      <p className="text-center text-lg font-semibold">Checking status...</p>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-semibold mb-4">
        Take A Picture to Check Out
      </h1>
      <div className="relative w-full max-w-2xl mb-6">
        {image ? (
          <img
            src={image}
            alt="Captured Employee"
            className="mx-auto w-full h-auto max-h-80 object-cover rounded-md border-4 border-gray-300"
          />
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/png"
              className="mx-auto w-full h-auto max-h-[400px] object-cover rounded-md border-4 border-gray-300"
              mirrored={true}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </>
        )}
      </div>
      <div className="w-full max-w-2xl">
        {!image ? (
          <button
            onClick={capture}
            disabled={!faceDetected}
            className={`px-6 py-3 w-full text-sm ${
              faceDetected
                ? "bg-yellow-400 hover:bg-yellow-500"
                : "bg-gray-400 cursor-not-allowed"
            } text-white rounded-md active:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 transition-all`}
          >
            {faceDetected ? "Capture Picture" : "Position Your Face"}
          </button>
        ) : (
          <>
            <button
              onClick={uploadAttendance}
              className="px-6 py-3 w-full text-sm bg-green-500 hover:bg-green-600 text-white rounded-md active:bg-green-700 focus:ring-2 focus:ring-green-600 transition-all"
            >
              Upload Attendance
            </button>
            <button
              onClick={() => setImage(null)}
              className="px-6 py-3 mt-2 w-full text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md active:bg-gray-700 focus:ring-2 focus:ring-gray-700 transition-all"
            >
              Retake Picture
            </button>
          </>
        )}
      </div>
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
