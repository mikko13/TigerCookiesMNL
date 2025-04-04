import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Camera,
  X,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
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
    checkOutPhoto: "",
  });

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
        employeeID: record.employeeID || "",
        attendanceDate: record.attendanceDate || "",
        checkInTime: record.checkinTime || "",
        checkOutTime: record.checkoutTime || "",
        shift: record.shift || "",
      });
      setExistingPhotos({
        checkInPhoto: record.checkInPhoto || "",
        checkOutPhoto: record.checkOutPhoto || "",
      });

      if (record.checkInPhoto) {
        setCheckInPreview(`/employee-checkin-photos/${record.checkInPhoto}`);
      }
      if (record.checkOutPhoto) {
        setCheckOutPreview(`/employee-checkout-photos/${record.checkOutPhoto}`);
      }
    }
  }, [location.state]);

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

    if (checkInPhoto) {
      formDataToSend.append("checkInPhoto", checkInPhoto);
    }

    if (checkOutPhoto) {
      formDataToSend.append("checkOutPhoto", checkOutPhoto);
    }

    try {
      const response = await axios.put(
        `${backendURL}/api/attendance/update/${location.state.record._id}`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      showToast("success", "Attendance updated successfully!");

      setTimeout(() => {
        navigate("/ManageEmployeeAttendance");
      }, 2000);
    } catch (error) {
      console.error("Update error:", error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to update attendance."
      );
    } finally {
      setLoading(false);
    }
  };

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
                <option value="" disabled>
                  Select Employee
                </option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              {formErrors.employeeID && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                  {formErrors.employeeID}
                </p>
              )}
            </div>
          </div>

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
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              {formErrors.attendanceDate && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                  {formErrors.attendanceDate}
                </p>
              )}
            </div>
          </div>

          {/* Added Shift Selection */}
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
                <option disabled>Select Shift</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              {formErrors.shift && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" /> {formErrors.shift}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-In Time
            </label>
            <div className="relative">
              <input
                type="time"
                name="checkInTime"
                value={formData.checkInTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>

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
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      handlePictureChange(
                        e,
                        setCheckOutPhoto,
                        setCheckOutPreview
                      )
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
