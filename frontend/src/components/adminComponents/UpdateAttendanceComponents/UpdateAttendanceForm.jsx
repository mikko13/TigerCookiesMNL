import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  UserCircle,
  Camera,
  X,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  User,
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
  });
  
  const [checkInPhoto, setCheckInPhoto] = useState(null);
  const [checkOutPhoto, setCheckOutPhoto] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState({
    checkInPhoto: "",
    checkOutPhoto: "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendURL}/api/employees`);
        setEmployees(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setLoading(false);
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
      });
      setExistingPhotos({
        checkInPhoto: record.checkInPhoto || "",
        checkOutPhoto: record.checkOutPhoto || "",
      });
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePictureChange = (e, setPicture) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", "Image size should be less than 5MB");
        return;
      }
      setPicture(file);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeID || !formData.attendanceDate) {
      showToast("error", "Employee and attendance date are required");
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("employeeID", formData.employeeID);
    formDataToSend.append("attendanceDate", formData.attendanceDate);
    formDataToSend.append("checkInTime", formData.checkInTime);
    formDataToSend.append("checkOutTime", formData.checkOutTime);

    if (checkInPhoto) {
      formDataToSend.append("checkInPhoto", checkInPhoto);
    }
    if (checkOutPhoto) {
      formDataToSend.append("checkOutPhoto", checkOutPhoto);
    }

    try {
      await axios.put(
        `${backendURL}/api/attendance/update/${location.state.record._id}`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      showToast("success", "Attendance updated successfully!");
      
      setTimeout(() => {
        navigate("/ManageEmployeeAttendance");
      }, 2000);
      
    } catch (error) {
      console.error("Error updating attendance:", error);
      showToast("error", "Failed to update attendance");
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <UserCircle className="mr-2" size={24} />
          Update Attendance Record
        </h2>
        <p className="text-yellow-50 mt-1 opacity-90">
          Edit employee attendance information
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
                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all appearance-none"
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
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="w-4 h-4 text-gray-500" />
              </div>
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
                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
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
                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-In Photo
            </label>
            {existingPhotos.checkInPhoto && (
              <div className="mb-2">
                <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={`/employee-checkin-photos/${existingPhotos.checkInPhoto}`}
                    alt="Check-In"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePictureChange(e, setCheckInPhoto)}
                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Camera className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-Out Photo
            </label>
            {existingPhotos.checkOutPhoto && (
              <div className="mb-2">
                <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={`/employee-checkout-photos/${existingPhotos.checkOutPhoto}`}
                    alt="Check-Out"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePictureChange(e, setCheckOutPhoto)}
                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Camera className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/ManageAttendance")}
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
                Processing...
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
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-xl ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white flex items-center justify-between max-w-md animate-fadeIn`}
        >
          <div className="flex items-center">
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            )}
            <p className="text-sm">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-4 text-white hover:text-gray-100 focus:outline-none"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
  
    </div>
  );
}