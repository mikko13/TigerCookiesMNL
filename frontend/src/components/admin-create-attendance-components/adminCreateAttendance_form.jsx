import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ToastStyles.css";
import { errorToast, successToast } from "./toastMessages";
import { backendURL } from "../../urls/URL";

export default function AdminCreateAttendanceForm() {
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

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/employees`);
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePictureChange = (e, setPicture) => {
    const file = e.target.files[0];
    if (file) {
      setPicture(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
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
      await axios.post(`${backendURL}/api/attendance/post`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setToast({ type: "success", message: "Attendance recorded successfully!" });
    } catch (error) {
      setToast({ type: "error", message: "Failed to record attendance." });
    }
  };
  

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mt-0 md:mt-16 font-[sans-serif] max-w-4xl mx-auto p-4 sm:p-1"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700">Employee Name</label>
            <select
              name="employeeID"
              value={formData.employeeID}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
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
          </div>
          <div>
            <label className="text-sm text-gray-700">Attendance Date</label>
            <input
              type="date"
              name="attendanceDate"
              value={formData.attendanceDate}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Check-In Time</label>
            <input
              type="time"
              name="checkInTime"
              value={formData.checkInTime}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Check-Out Time</label>
            <input
              type="time"
              name="checkOutTime"
              value={formData.checkOutTime}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Check-In Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePictureChange(e, setCheckInPhoto)}
              className="px-4 py-2 bg-gray-100 text-black w-full text-sm border rounded"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Check-Out Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePictureChange(e, setCheckOutPhoto)}
              className="px-4 py-2 bg-gray-100 text-black w-full text-sm border rounded"
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 text-sm bg-yellow-300 hover:bg-yellow-400 text-white rounded transition-all"
          >
            Submit
          </button>
        </div>
      </form>
      {toast?.type === "error" && (
        <div className="z-50 fixed bottom-4 left-4">{errorToast}</div>
      )}
      {toast?.type === "success" && (
        <div className="z-50 fixed bottom-4 left-4">{successToast}</div>
      )}
    </div>
  );
}
