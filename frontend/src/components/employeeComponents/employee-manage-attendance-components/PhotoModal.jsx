import React from "react";
import { X } from "lucide-react";

const PhotoModal = ({ imageUrl, isOpen, onClose, photoType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">
            {photoType === "checkin" ? "Check In Photo" : "Check Out Photo"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={photoType === "checkin" ? "Check In Photo" : "Check Out Photo"}
            className="max-h-[70vh] max-w-full object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-image.jpg";
              e.target.alt = "Image not available";
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
