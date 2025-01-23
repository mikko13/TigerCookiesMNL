import React, { useState } from "react";

export default function AdminCreateAccountForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    address: "",
    gender: "",
    dateOfBirth: "",
    hiredDate: "",
    position: "",
    status: "",
    ratePerHour: "",
    shift: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);

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

    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }
    if (profilePicture) {
      form.append("profilePicture", profilePicture);
    }

    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        const data = await response.json();
        alert("Account created successfully!");
        console.log(data);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="font-[sans-serif] max-w-4xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-300 bg-[#f0f1f2]">
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

        <div className="flex-1 grid sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
            className="px-4 py-3 bg-[#f0f1f2] text-black w-full text-sm border rounded transition-all"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
            className="px-4 py-3 bg-[#f0f1f2] text-black w-full text-sm border rounded transition-all"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="px-4 py-3 bg-[#f0f1f2] text-black w-full text-sm border rounded transition-all"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="px-4 py-3 bg-[#f0f1f2] text-black w-full text-sm border rounded transition-all"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleInputChange}
            className="px-4 py-3 bg-[#f0f1f2] text-black w-full text-sm border rounded transition-all"
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="px-4 py-3 bg-[#f0f1f2] text-black w-full text-sm border rounded transition-all"
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
            className="px-4 py-3 bg-[#f0f1f2] text-black w-full text-sm border rounded transition-all"
          />
          <input
            type="date"
            name="hiredDate"
            value={formData.hiredDate}
            onChange={handleInputChange}
            className="px-4 py-3 bg-[#f0f1f2] text-black w-full text-sm border rounded transition-all"
          />
          <select
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            className="px-4 py-3 bg-[#f0f1f2] text-black w-full text-sm border rounded transition-all"
          >
            <option value="" disabled>
              Position
            </option>
            <option value="Sole proprietor">Sole Proprietor</option>
            <option value="Business development manager">
              Business Development Manager
            </option>
            <option value="Operations manager">Operations Manager</option>
            <option value="Branch manager">Branch Manager</option>
            <option value="Sales assistant">Sales Assistant</option>
          </select>

          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="px-4 py-3 bg-[#f0f1f2] text-black w-full text-sm border rounded transition-all"
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
            className="px-4 py-3 bg-[#f0f1f2] text-black w-full text-sm border rounded transition-all"
          />
          <select
            name="shift"
            value={formData.shift}
            onChange={handleInputChange}
            className="px-4 py-3 bg-[#f0f1f2] text-black w-full text-sm border rounded transition-all"
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
  );
}
