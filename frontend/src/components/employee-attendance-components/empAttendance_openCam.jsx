import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import * as faceapi from 'face-api.js/dist/face-api.min.js';

export default function EmpAttendanceOpenCam() {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);

  // Load face detection models when component mounts
  useEffect(() => {
    async function loadModels() {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      setMessage("Face detection models loaded.");
      startFaceDetection();
    }
    loadModels();
  }, []);

  // Function to detect face in webcam feed
  const startFaceDetection = async () => {
    setInterval(async () => {
      if (webcamRef.current) {
        const video = webcamRef.current.video;
        if (video && video.readyState === 4) {
          const detections = await faceapi.detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions()
          );

          if (detections) {
            setFaceDetected(true);
            setMessage("Face detected, you can capture.");
          } else {
            setFaceDetected(false);
            setMessage("No face detected. Please position yourself.");
          }
        }
      }
    }, 1000);
  };

  // Capture image from webcam only if a face is detected
  const capture = () => {
    if (faceDetected) {
      const imgSrc = webcamRef.current.getScreenshot();
      setImage(imgSrc);
      setMessage("Image captured successfully!");
    } else {
      setMessage("No face detected! Please try again.");
    }
  };

  // Upload the captured image to the backend
  const uploadImage = async () => {
    if (!image) {
      alert("Please capture an image first!");
      return;
    }

    // Convert base64 to Blob
    const blob = await fetch(image).then((res) => res.blob());
    const formData = new FormData();
    formData.append("image", blob, "employee_picture.png");

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setMessage("Face verified successfully!");
      } else {
        setMessage("No matching face found. Try again.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage("Error processing the image.");
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-4">Facial Recognition</h1>

      {/* Webcam Preview or Captured Image */}
      <div className="mb-6">
        {image ? (
          <img
            src={image}
            alt="Captured Employee"
            className="mx-auto w-auto h-80 object-cover rounded-md border-4 border-gray-300"
          />
        ) : (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/png"
            className="mx-auto w-auto h-80 object-cover rounded-md border-4 border-gray-300"
          />
        )}
      </div>

      <div className="max-w-md w-full">
        {!image ? (
          <button
            onClick={capture}
            disabled={!faceDetected}
            className={`px-6 py-3 w-full text-sm ${
              faceDetected ? "bg-yellow-400 hover:bg-yellow-500" : "bg-gray-400 cursor-not-allowed"
            } text-white rounded-md active:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 transition-all`}
          >
            {faceDetected ? "Capture Picture" : "Position Your Face"}
          </button>
        ) : (
          <>
            <button
              onClick={uploadImage}
              className="px-6 py-3 w-full text-sm bg-green-500 hover:bg-green-600 text-white rounded-md active:bg-green-700 focus:ring-2 focus:ring-green-600 transition-all"
            >
              Upload Picture
            </button>
            <button
              onClick={() => setImage(null)}
              className="px-6 py-3 mt-2 w-full text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md active:bg-gray-700 focus:ring-2 focus:ring-gray-700 transition-all"
            >
              Retake Picture
            </button>
          </>
        )}

        <a href="./shift">
          <button
            type="button"
            className="px-6 py-3 mt-2 w-full text-sm bg-gray-700 hover:bg-gray-800 text-white rounded-md active:bg-gray-900 focus:ring-2 focus:ring-gray-900 transition-all"
          >
            Back
          </button>
        </a>

        {message && <p className="mt-4 text-lg font-semibold text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
