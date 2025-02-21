import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import axios from "axios";
import Swal from "sweetalert2";
import * as faceapi from "face-api.js/dist/face-api.min.js";
import { backendURL } from "../../urls/URL";

export default function EmpAttendanceOpenCam() {
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

      console.log("Face API models loaded!");

      setTimeout(() => startFaceDetection(), 500);
    }

    loadModels();

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setEmployeeID(user.id);
      checkIfCheckedIn(user.id);
    } else {
      navigate("/CheckIn");
    }
  }, []);

  const checkIfCheckedIn = async (id) => {
    try {
      const response = await axios.get(
        `${backendURL}/api/checkin/status/${id}`
      );
      if (response.data.checkedIn) {
        navigate("/CheckIn");
      }
    } catch (error) {
      console.error("Error checking attendance status:", error);
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
    e.preventDefault();

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

    try {
      const response = await axios.post(
        `${backendURL}/api/checkin`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Server Response:", response.data);

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
      console.error("Error submitting attendance:", error);

      await Swal.fire({
        title: "Error",
        text: "Failed to check-in. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-semibold mb-4">
        Take A Picture to Check In
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
          <>
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
          </>
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
