import React, { useState } from "react";

export default function AdminCreateAccountForm() {
  const [profilePicture, setProfilePicture] = useState(null);

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfilePicture(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
  };

  return (
    <form className="font-[sans-serif] max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-300 bg-[#f0f1f2]">
            {profilePicture ? (
              <img
                src={profilePicture}
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
              {profilePicture ? "Change Profile Picture" : "Add Profile Picture"}
            </label>
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={handlePictureChange}
              className="hidden"
            />
            {profilePicture && (
              <button
                type="button"
                onClick={removeProfilePicture}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-all"
              >
                Remove Profile Picture
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 grid sm:grid-cols-2 gap-4">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="First Name"
              className="px-4 py-3 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Last Name"
              className="px-4 py-3 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
          </div>

          <div className="relative flex items-center">
            <input
              type="email"
              placeholder="Email"
              className="px-4 py-3 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
          </div>

          <div className="relative flex items-center">
            <input
              type="password"
              placeholder="Password"
              className="px-4 py-3 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
          </div>

          <div className="relative flex items-center col-span-2">
            <input
              type="text"
              placeholder="Address"
              className="px-4 py-3 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
          </div>

          <div className="relative flex items-center">
            <select
              className="px-4 py-3 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            >
              <option value="" disabled selected>
                Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="relative flex items-center">
            <input
              type="date"
              placeholder="Date of Birth"
              className="px-4 py-3 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Position"
              className="px-4 py-3 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
          </div>

          <div className="relative flex items-center">
            <select
              className="px-4 py-3 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            >
              <option value="" disabled selected>
                Status
              </option>
              <option value="N/A">N/A</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="On-Leave">On-Leave</option>
            </select>
          </div>

          <div className="relative flex items-center">
            <input
              type="number"
              placeholder="Rate Per Hour"
              className="px-4 py-3 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
          </div>

          <div className="relative flex items-center">
            <select
              className="px-4 py-3 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            >
              <option value="" disabled selected>
                Shift
              </option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="night">Night</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          className="px-6 py-2.5 text-sm bg-yellow-300 hover:bg-yellow-400 text-white rounded transition-all"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
