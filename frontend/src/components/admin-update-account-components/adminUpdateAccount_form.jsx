import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminUpdateAccountForm() {
  const { employeeId } = useParams(); // Get the employeeId from the URL parameters
  const history = useNavigate(); // To navigate after successful update
  const [profilePicture, setProfilePicture] = useState(null);

  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    password: "",
    gender: "",
    dateOfBirth: "",
    position: "",
    hiredDate: "",
    status: "",
    ratePerHour: "",
    shift: "",
    profilePicture: "",
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/employees/${employeeId}`
        );
        setEmployee(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    fetchEmployeeData();
  }, [employeeId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prevEmployee) => ({
      ...prevEmployee,
      [name]: value,
    }));
  };

  // Handle file input change for profile picture
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('firstName', employee.firstName);
    formData.append('lastName', employee.lastName);
    formData.append('email', employee.email);
    formData.append('password', employee.password);
    formData.append('address', employee.address);
    formData.append('gender', employee.gender);
    formData.append('dateOfBirth', employee.dateOfBirth);
    formData.append('position', employee.position);
    formData.append('hiredDate', employee.hiredDate);
    formData.append('status', employee.status);
    formData.append('ratePerHour', employee.ratePerHour);
    formData.append('shift', employee.shift);
    
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }
  
    try {
      await axios.put(`http://localhost:5000/api/employees/${employeeId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      history.push("/adminManageAccount");
    } catch (error) {
      console.error("Error updating employee data:", error);
    }
  };
  
  return (
   <div>
      <form
        onSubmit={handleSubmit}
        className="mt-0 md:mt-16 font-[sans-serif] max-w-4xl mx-auto p-4 sm:p-1"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col mr-7 items-center">
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
                className="hidden"
                onChange={handleFileChange} // Ensure file changes are handled
              />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={employee.firstName}
                onChange={handleInputChange}
                className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={employee.lastName}
                onChange={handleInputChange}
                className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={employee.email}
                onChange={handleInputChange}
                className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={employee.password}
                onChange={handleInputChange}
                className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={employee.address}
                onChange={handleInputChange}
                className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Gender</label>
              <select
                name="gender"
                value={employee.gender}
                onChange={handleInputChange}
                className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={employee.dateOfBirth}
                onChange={handleInputChange}
                className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Hired Date</label>
              <input
                type="date"
                name="hiredDate"
                value={employee.hiredDate}
                onChange={handleInputChange}
                className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Position</label>
              <select
                name="position"
                value={employee.position}
                onChange={handleInputChange}
                className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
              >
                <option value="" disabled>
                  Select Position
                </option>
                <option value="Sole Proprietor">Sole Proprietor</option>
                <option value="Business Development Manager">
                  Business Development Manager
                </option>
                <option value="Operations Manager">Operations Manager</option>
                <option value="Branch Manager">Branch Manager</option>
                <option value="Sales Assistant">Sales Assistant</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Status</label>
              <select
                name="status"
                value={employee.status}
                onChange={handleInputChange}
                className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
              >
                <option value="" disabled>
                  Select Status
                </option>
                <option value="N/A">N/A</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="On-Leave">On-Leave</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Rate Per Hour</label>
              <input
                type="number"
                name="ratePerHour"
                placeholder="Rate Per Hour"
                value={employee.ratePerHour}
                onChange={handleInputChange}
                className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Shift</label>
              <select
                name="shift"
                value={employee.shift}
                onChange={handleInputChange}
                className="px-4 py-3 bg-gray-100 text-black w-full text-sm border rounded"
              >
                <option value="" disabled>
                  Select Shift
                </option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Night">Night</option>
              </select>
            </div>
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
    </div>
  );
}
