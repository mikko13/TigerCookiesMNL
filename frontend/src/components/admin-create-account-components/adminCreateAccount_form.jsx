import React, { useState } from "react";
import { initialFormData } from "./formConstants";
import { handleSubmitForm } from "./utils";
import "./ToastStyles.css";
import { errorToast, successToast } from "./toastMessages";

export default function AdminCreateAccountForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [profilePicture, setProfilePicture] = useState(null);
  const [toast, setToast] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSubmitForm(formData, profilePicture, setToast);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="font-[sans-serif] max-w-4xl mx-auto p-4 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-300 bg-gray-200">
              {profilePicture ? (
                <img
                  src={URL.createObjectURL(profilePicture)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-500">
                  No Picture
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <label
                htmlFor="profilePicture"
                className="px-4 py-2 bg-yellow-300 text-white text-sm rounded cursor-pointer hover:bg-yellow-400 transition-all"
              >
                {profilePicture
                  ? "Change Profile Picture"
                  : "Add Profile Picture"}
              </label>
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            >
              <option value="" disabled>
                Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            />
            <input
              type="date"
              name="hiredDate"
              value={formData.hiredDate}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            />
            <select
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            >
              <option value="" disabled>
                Position
              </option>
              <option value="Sole Proprietor">Sole Proprietor</option>
              <option value="Business Development Manager">
                Business Development Manager
              </option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="Branch Manager">Branch Manager</option>
              <option value="Sales Assistant">Sales Assistant</option>
            </select>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            >
              <option value="" disabled>
                Status
              </option>
              <option value="N/A">N/A</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="On-Leave">On-Leave</option>
            </select>
            <input
              type="number"
              name="ratePerHour"
              placeholder="Rate Per Hour"
              value={formData.ratePerHour}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            />
            <select
              name="shift"
              value={formData.shift}
              onChange={handleInputChange}
              className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
            >
              <option value="" disabled>
                Shift
              </option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Night">Night</option>
            </select>
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
