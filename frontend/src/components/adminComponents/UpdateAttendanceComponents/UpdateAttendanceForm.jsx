import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import {
  Camera,
  X,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Watch,
  Sun,
  Sunset
} from "lucide-react";
import { backendURL } from "../../../urls/URL";

export default function UpdateAttendanceForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeID: "",
    attendanceDate: "",
    checkInTime: "",
    checkOutTime: "",
    shift: "",
    startOT: "",
    endOT: ""
  });

  const [checkInPhoto, setCheckInPhoto] = useState(null);
  const [checkOutPhoto, setCheckOutPhoto] = useState(null);
  const [checkInPreview, setCheckInPreview] = useState(null);
  const [checkOutPreview, setCheckOutPreview] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [existingPhotos, setExistingPhotos] = useState({
    checkInPhoto: "",
    checkOutPhoto: ""
  });
  const [estimatedTotalHours, setEstimatedTotalHours] = useState(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/employees`);
        setEmployees(response.data);
      } catch (error) {
        showToast("error", "Failed to load employees data.");
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (location.state && location.state.record) {
      const { record } = location.state;
      setFormData({
        employeeID: record.employeeID?._id || record.employeeID || "",
        attendanceDate: record.attendanceDate || "",
        checkInTime: record.checkInTime || record.checkinTime || "",
        checkOutTime: record.checkOutTime || record.checkoutTime || "",
        shift: record.shift || "",
        startOT: record.startOT || "",
        endOT: record.endOT || ""
      });
      
      setExistingPhotos({
        checkInPhoto: record.checkInPhoto || "",
        checkOutPhoto: record.checkOutPhoto || ""
      });

      if (record.checkInPhoto) {
        setCheckInPreview(
          record.checkInPhoto.startsWith("blob:") 
            ? record.checkInPhoto 
            : `/employee-checkin-photos/${record.checkInPhoto}`
        );
      }
      if (record.checkOutPhoto) {
        setCheckOutPreview(
          record.checkOutPhoto.startsWith("blob:") 
            ? record.checkOutPhoto 
            : `/employee-checkout-photos/${record.checkOutPhoto}`
        );
      }
    }
  }, [location.state]);

  // Improved time calculation that matches backend logic
  useEffect(() => {
    if (formData.checkInTime && formData.checkOutTime && formData.shift) {
      try {
        let checkIn = DateTime.fromFormat(formData.checkInTime, "HH:mm");
        const checkOut = DateTime.fromFormat(formData.checkOutTime, "HH:mm");

        // Determine shift start time
        let shiftStart;
        switch (formData.shift.toLowerCase()) {
          case "afternoon":
            shiftStart = DateTime.fromFormat("13:00", "HH:mm");
            break;
          case "morning":
          default:
            shiftStart = DateTime.fromFormat("09:00", "HH:mm");
        }

        // Adjust check-in time if before shift start
        checkIn = checkIn < shiftStart ? shiftStart : checkIn;

        // Calculate lateness penalty
        let latenessHours = 0;
        if (checkIn > shiftStart) {
          const minutesLate = checkIn.diff(shiftStart, "minutes").minutes;
          latenessHours = minutesLate > 0 ? Math.ceil(minutesLate / 60) : 0;
        }

        // Calculate total hours worked
        let diff = checkOut.diff(checkIn, "hours").hours;
        if (diff < 0) {
          diff = checkOut.plus({ days: 1 }).diff(checkIn, "hours").hours;
        }

        const totalHours = Math.max(0, Math.round((diff - latenessHours) * 100) / 100);
        setEstimatedTotalHours(totalHours);
      } catch (error) {
        console.error("Error calculating hours:", error);
        setEstimatedTotalHours(0);
      }
    } else {
      setEstimatedTotalHours(0);
    }
  }, [formData.checkInTime, formData.checkOutTime, formData.shift]);

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

  // Enhanced validation
  const validateForm = () => {
    const errors = {};
    const requiredFields = ['employeeID', 'attendanceDate', 'checkInTime', 'shift'];
    
    requiredFields.forEach(field => {
      if (!formData[field]) errors[field] = "This field is required";
    });

    // Validate overtime times if either is provided
    if (formData.startOT || formData.endOT) {
      if (!formData.startOT) errors.startOT = "Start time required if entering overtime";
      if (!formData.endOT) errors.endOT = "End time required if entering overtime";
      
      if (formData.startOT && formData.endOT) {
        const start = DateTime.fromFormat(formData.startOT, "HH:mm");
        const end = DateTime.fromFormat(formData.endOT, "HH:mm");
        if (end <= start) {
          errors.endOT = "Overtime end must be after start";
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateOvertimeHours = () => {
    if (!formData.startOT || !formData.endOT) return 0;
    
    try {
      const start = DateTime.fromFormat(formData.startOT, "HH:mm");
      const end = DateTime.fromFormat(formData.endOT, "HH:mm");
      
      let diff = end.diff(start, "hours").hours;
      if (diff < 0) {
        diff = end.plus({ days: 1 }).diff(start, "hours").hours;
      }
      
      return Math.max(0, Math.round(diff * 100) / 100);
    } catch (error) {
      return 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("error", "Please fix the errors in the form");
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();

    // Format dates/times consistently with backend
    const formattedData = {
      ...formData,
      attendanceDate: DateTime.fromISO(formData.attendanceDate).toISODate(),
      // Times are already in HH:mm format which matches backend expectation
    };

    Object.entries(formattedData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });

    if (checkInPhoto) formDataToSend.append("checkInPhoto", checkInPhoto);
    if (checkOutPhoto) formDataToSend.append("checkOutPhoto", checkOutPhoto);

    try {
      await axios.put(
        `${backendURL}/api/attendance/update/${location.state.record._id}`,
        formDataToSend,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${localStorage.getItem('token')}` // Add auth if needed
          },
        }
      );

      showToast("success", "Attendance updated successfully!");
      setTimeout(() => navigate("/ManageEmployeeAttendance"), 2000);
    } catch (error) {
      console.error("Update error:", error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      "Failed to update attendance";
      showToast("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderHoursCalculation = () => (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-medium text-blue-800 flex items-center">
        <Watch className="mr-2" size={18} />
        Hours Calculation
      </h3>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-blue-600">Regular Hours:</p>
          <p className="text-lg font-semibold">
            {estimatedTotalHours.toFixed(2)} hours
          </p>
        </div>
        {formData.startOT && formData.endOT && (
          <div>
            <p className="text-sm text-blue-600">Overtime Hours:</p>
            <p className="text-lg font-semibold">
              {calculateOvertimeHours().toFixed(2)} hours
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Clock className="mr-2" size={24} />
          Update Employee Attendance
        </h2>
        <p className="text-yellow-50 mt-1 opacity-90">
          Edit attendance record for employees
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="employeeID"
                value={formData.employeeID}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formErrors.employeeID
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all appearance-none`}
              >
                <option value="" disabled>Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
              {formErrors.employeeID && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {formErrors.employeeID}
                </p>
              )}
            </div>
          </div>

          {/* Attendance Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendance Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="attendanceDate"
                value={formData.attendanceDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formErrors.attendanceDate
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all`}
              />
              {formErrors.attendanceDate && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {formErrors.attendanceDate}
                </p>
              )}
            </div>
          </div>

          {/* Shift Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="shift"
                value={formData.shift}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formErrors.shift
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all appearance-none`}
              >
                <option value="" disabled>Select Shift</option>
                <option value="Morning">Morning (9AM-5PM)</option>
                <option value="Afternoon">Afternoon (1PM-9PM)</option>
              </select>
              {formErrors.shift && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {formErrors.shift}
                </p>
              )}
            </div>
          </div>

          {/* Check-In Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-In Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                name="checkInTime"
                value={formData.checkInTime}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formErrors.checkInTime
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all`}
              />
              {formErrors.checkInTime && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {formErrors.checkInTime}
                </p>
              )}
            </div>
          </div>

          {/* Check-Out Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-Out Time
            </label>
            <div className="relative">
              <input
                type="time"
                name="checkOutTime"
                value={formData.checkOutTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              />
            </div>
          </div>

          {/* Start Overtime */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Overtime
            </label>
            <div className="relative">
              <input
                type="time"
                name="startOT"
                value={formData.startOT}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formErrors.startOT
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all`}
              />
              {formErrors.startOT && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {formErrors.startOT}
                </p>
              )}
            </div>
          </div>

          {/* End Overtime */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Overtime
            </label>
            <div className="relative">
              <input
                type="time"
                name="endOT"
                value={formData.endOT}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formErrors.endOT
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all`}
              />
              {formErrors.endOT && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-In Photo
              {existingPhotos.checkInPhoto && !checkInPhoto && (
                <span className="text-xs text-gray-500 ml-2">(Existing photo will be kept if not changed)</span>
              )}
            </label>
            <div className={`border-2 border-dashed rounded-lg ${
              checkInPreview ? "border-yellow-400 bg-yellow-50" : "border-gray-300 bg-gray-50"
            } p-4 flex flex-col items-center justify-center h-48 relative overflow-hidden transition-all hover:border-yellow-500`}>
              {checkInPreview ? (
                <div className="relative w-full h-full">
                  <img src={checkInPreview} alt="Check-in" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setCheckInPhoto(null);
                      setCheckInPreview(existingPhotos.checkInPhoto 
                        ? `/employee-checkin-photos/${existingPhotos.checkInPhoto}` 
                        : null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 transition-all hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePictureChange(e, setCheckInPhoto, setCheckInPreview)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>

          {/* Check-Out Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-Out Photo
              {existingPhotos.checkOutPhoto && !checkOutPhoto && (
                <span className="text-xs text-gray-500 ml-2">(Existing photo will be kept if not changed)</span>
              )}
            </label>
            <div className={`border-2 border-dashed rounded-lg ${
              checkOutPreview ? "border-yellow-400 bg-yellow-50" : "border-gray-300 bg-gray-50"
            } p-4 flex flex-col items-center justify-center h-48 relative overflow-hidden transition-all hover:border-yellow-500`}>
              {checkOutPreview ? (
                <div className="relative w-full h-full">
                  <img src={checkOutPreview} alt="Check-out" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setCheckOutPhoto(null);
                      setCheckOutPreview(existingPhotos.checkOutPhoto 
                        ? `/employee-checkout-photos/${existingPhotos.checkOutPhoto}` 
                        : null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 transition-all hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePictureChange(e, setCheckOutPhoto, setCheckOutPreview)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>
        </div>


        {/* Form Actions */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/ManageEmployeeAttendance")}
            className="px-6 py-2.5 text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
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
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Update
              </>
            )}
          </button>
        </div>
      </form>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center ${
          toast.type === "success" 
            ? "bg-green-100 text-green-800 border-l-4 border-green-500" 
            : "bg-red-100 text-red-800 border-l-4 border-red-500"
        }`}>
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