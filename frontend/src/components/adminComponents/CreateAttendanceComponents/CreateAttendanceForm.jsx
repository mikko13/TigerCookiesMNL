import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Camera,
  X,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sun,
  Sunset,
  Watch,
} from "lucide-react";
import { backendURL } from "../../../urls/URL";

export default function AdminCreateAttendanceForm() {
  const [formData, setFormData] = useState({
    employeeID: "",
    attendanceDate: "",
    checkInTime: "",
    checkOutTime: "",
    shift: "",
    startOT: "",  
    endOT: "",    
  });
  

  const [checkInPhoto, setCheckInPhoto] = useState(null);
  const [checkOutPhoto, setCheckOutPhoto] = useState(null);
  const [checkInPreview, setCheckInPreview] = useState(null);
  const [checkOutPreview, setCheckOutPreview] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [estimatedTotalHours, setEstimatedTotalHours] = useState(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/employees`);
        const activeEmployees = response.data.filter(
          (emp) => emp.isActive === 1
        );
        setEmployees(activeEmployees);
      } catch (error) {
        showToast("error", "Failed to load employees data.");
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (formData.checkInTime && formData.checkOutTime) {
      try {
        const checkInTime = new Date(`2000-01-01T${formData.checkInTime}`);
        const checkOutTime = new Date(`2000-01-01T${formData.checkOutTime}`);

        let diff = checkOutTime - checkInTime;

        if (diff < 0) {
          checkOutTime.setDate(checkOutTime.getDate() + 1);
          diff = checkOutTime - checkInTime;
        }

        const hours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
        setEstimatedTotalHours(hours);
      } catch (error) {
        setEstimatedTotalHours(0);
      }
    } else {
      setEstimatedTotalHours(0);
    }
  }, [formData.checkInTime, formData.checkOutTime]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handlePictureChange = (e, setPicture, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", "Image size should be less than 5MB");
        return;
      }

      setPicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.employeeID) errors.employeeID = "Employee is required";
    if (!formData.attendanceDate) errors.attendanceDate = "Date is required";
    if (!formData.checkInTime) errors.checkInTime = "Check-in time is required";
    if (!formData.shift) errors.shift = "Shift is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      showToast("error", "Please fill all required fields.");
      return;
    }
  
    setLoading(true);
    const formDataToSend = new FormData();
  
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });
  
    if (checkInPhoto) formDataToSend.append("checkInPhoto", checkInPhoto);
    if (checkOutPhoto) formDataToSend.append("checkOutPhoto", checkOutPhoto);
  
    try {
      await axios.post(`${backendURL}/api/attendance/post`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      showToast("success", "Attendance recorded successfully!");
      resetForm();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to record attendance."
      );
    } finally {
      setLoading(false);
    }
  };  

  const resetForm = () => {
    setFormData({
      employeeID: "",
      attendanceDate: "",
      checkInTime: "",
      checkOutTime: "",
      shift: "",
      startOT: "",
      endOT: ""

    });
    setCheckInPhoto(null);
    setCheckOutPhoto(null);
    setCheckInPreview(null);
    setCheckOutPreview(null);
    setFormErrors({});
    setEstimatedTotalHours(0);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-xl">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Clock className="mr-3" size={24} />
          Create Employee Attendance
        </h2>
        <p className="text-yellow-50 mt-1 opacity-90 text-lg">
          Create a new attendance record for employees
        </p>
      </div>
  
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  
          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="employeeID"
                value={formData.employeeID}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border shadow-sm ${
                  formErrors.employeeID
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all`}
              >
                <option value="" disabled>
                  Select Employee
                </option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
              {formErrors.employeeID && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                  {formErrors.employeeID}
                </p>
              )}
            </div>
          </div>
  
          {/* Attendance Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attendance Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="attendanceDate"
                value={formData.attendanceDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border shadow-sm ${
                  formErrors.attendanceDate
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all`}
              />
              {formErrors.attendanceDate && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                  {formErrors.attendanceDate}
                </p>
              )}
            </div>
          </div>
  
          {/* Shift Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shift <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="shift"
                value={formData.shift}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border shadow-sm ${
                  formErrors.shift
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all`}
              >
                <option value="" disabled>
                  Select Shift
                </option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
              </select>
              {formErrors.shift && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" /> {formErrors.shift}
                </p>
              )}
            </div>
          </div>
  
          {/* Check-In Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-In Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                name="checkInTime"
                value={formData.checkInTime}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border shadow-sm ${
                  formErrors.checkInTime
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all`}
              />
              {formErrors.checkInTime && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                  {formErrors.checkInTime}
                </p>
              )}
            </div>
          </div>
  
          {/* Check-Out Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-Out Time
            </label>
            <div className="relative">
              <input
                type="time"
                name="checkOutTime"
                value={formData.checkOutTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border shadow-sm border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
              />
            </div>
          </div>
  
          {/* Start Overtime */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Overtime <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                name="startOT"
                value={formData.startOT}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border shadow-sm ${
                  formErrors.startOT
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all`}
              />
              {formErrors.startOT && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                  {formErrors.startOT}
                </p>
              )}
            </div>
          </div>
  
          {/* End Overtime */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Overtime <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                name="endOT"
                value={formData.endOT}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border shadow-sm ${
                  formErrors.endOT
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all`}
              />
              {formErrors.endOT && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                  {formErrors.endOT}
                </p>
              )}
            </div>
          </div>
  
        </div>
  
        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Check-In Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-In Photo
            </label>
            <div
              className={`border-2 border-dashed rounded-lg ${
                checkInPreview
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-300 bg-gray-50"
              } p-4 flex flex-col items-center justify-center h-48 relative overflow-hidden transition-all hover:border-yellow-500`}
            >
              {checkInPreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={checkInPreview}
                    alt="Check-in"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCheckInPhoto(null);
                      setCheckInPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 transition-all hover:bg-red-600"
                    aria-label="Remove photo"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    <span className="font-medium">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handlePictureChange(e, setCheckInPhoto, setCheckInPreview)
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>
  
          {/* Check-Out Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-Out Photo
            </label>
            <div
              className={`border-2 border-dashed rounded-lg ${
                checkOutPreview
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-300 bg-gray-50"
              } p-4 flex flex-col items-center justify-center h-48 relative overflow-hidden transition-all hover:border-yellow-500`}
            >
              {checkOutPreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={checkOutPreview}
                    alt="Check-out"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCheckOutPhoto(null);
                      setCheckOutPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 transition-all hover:bg-red-600"
                    aria-label="Remove photo"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    <span className="font-medium">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handlePictureChange(e, setCheckOutPhoto, setCheckOutPreview)
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>
        </div>
  
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2.5 text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 text-sm font-medium bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all flex items-center ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create
              </>
            )}
          </button>
        </div>
      </form>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center ${
            toast.type === "success"
              ? "bg-green-100 text-green-800 border-l-4 border-green-500"
              : "bg-red-100 text-red-800 border-l-4 border-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertTriangle className="w-5 h-5 mr-2" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}