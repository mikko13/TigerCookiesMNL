import React, { useState, useEffect } from "react";
import {
  UserCircle,
  Camera,
  X,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Upload,
  DollarSign,
  Briefcase,
  Mail,
  Lock,
  Home,
  User,
} from "lucide-react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { backendURL } from "../../../urls/URL";

export default function UpdateAccountForm() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState({
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
  const [profilePreview, setProfilePreview] = useState(null);
  const [profilePictureToDelete, setProfilePictureToDelete] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // First check localStorage for logged-in user data
    const loggedInUser = JSON.parse(localStorage.getItem("user"));

    // If we have employee ID in URL params, prioritize fetching that specific employee
    if (employeeId) {
      fetchEmployeeData(employeeId);
    }
    // Otherwise use the logged-in user data from localStorage
    else if (loggedInUser && loggedInUser.id) {
      fetchEmployeeData(loggedInUser.id);
    } else {
      // If no params and no localStorage, check session
      checkSession();
    }
  }, [employeeId]);

  const checkSession = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendURL}/api/employees/session`);
      if (response.data && response.data.user) {
        // If we get session data, fetch the full employee details
        fetchEmployeeData(response.data.user.id);
        // Also update localStorage
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      setLoading(false);
    } catch (error) {
      console.error("Session check failed:", error);
      showToast("error", "Unable to verify your session");
      setLoading(false);
    }
  };

  const fetchEmployeeData = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendURL}/api/employees/${id}`);

      const employeeData = response.data;
      setUser(employeeData);

      // Handle profile picture
      if (employeeData.profilePicture) {
        setProfilePicture(employeeData.profilePicture);
        setProfilePreview(
          `/employee-profile-pics/${employeeData.profilePicture}`
        );
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      showToast("error", "Failed to load employee data");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });

    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", "Image size should be less than 5MB");
        return;
      }

      setProfilePicture(file);
      setProfilePictureToDelete(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePicture = () => {
    setProfilePictureToDelete(true);
    setProfilePicture(null);
    setProfilePreview(null);
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const validateForm = () => {
    const errors = {};

    if (!user.firstName) errors.firstName = "First name is required";
    if (!user.lastName) errors.lastName = "Last name is required";
    if (!user.email) errors.email = "Email is required";
    if (changePassword && !user.password)
      errors.password = "Password is required";
    if (!user.position) errors.position = "Position is required";
    if (!user.hiredDate) errors.hiredDate = "Hired date is required";

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

    const idToUse = employeeId || JSON.parse(localStorage.getItem("user"))?.id;

    if (!idToUse) {
      showToast("error", "No employee ID found for update.");
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();

    Object.entries(user).forEach(([key, value]) => {
      if (key !== "password" || (key === "password" && changePassword)) {
        formDataToSend.append(key, value);
      }
    });

    if (profilePicture instanceof File) {
      formDataToSend.append("profilePicture", profilePicture);
    } else if (profilePictureToDelete) {
      formDataToSend.append("profilePicture", "");
    }

    try {
      const response = await axios.put(
        `${backendURL}/api/employees/${idToUse}`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      if (loggedInUser && loggedInUser.id === idToUse) {
        loggedInUser.firstName = user.firstName;
        loggedInUser.lastName = user.lastName;
        loggedInUser.email = user.email;
        localStorage.setItem("user", JSON.stringify(loggedInUser));
      }

      showToast("success", "Account updated successfully!");

      setTimeout(() => {
        navigate("/ManageEmployeeAccounts");
      }, 2000);
    } catch (error) {
      console.error("Error updating employee:", error);
      showToast("error", "Failed to update account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <UserCircle className="mr-2" size={24} />
          Update Account
        </h2>
        <p className="text-yellow-50 mt-1 opacity-90">
          Edit your account information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture <span className="text-red-500">*</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-lg ${
                profilePreview
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-300 bg-gray-50"
              } p-4 flex flex-col items-center justify-center h-64 relative overflow-hidden transition-all hover:border-yellow-500`}
            >
              {profilePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={profilePreview}
                    alt="Profile"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleDeletePicture}
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
                    onChange={handlePictureChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>

          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  value={user.firstName}
                  disabled="true"
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  className={`w-full px-4 py-3 pl-10 rounded-lg border text-gray-400 ${
                    formErrors.firstName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all cursor-not-allowed`}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                {formErrors.firstName && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                    {formErrors.firstName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={user.lastName}
                  disabled="true"
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  className={`w-full px-4 py-3 pl-10 rounded-lg border  text-gray-400 ${
                    formErrors.lastName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all cursor-not-allowed`}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                {formErrors.lastName && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                    {formErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  disabled="true"
                  onChange={handleInputChange}
                  placeholder="employee@company.com"
                  className={`w-full px-4 py-3 pl-10 rounded-lg border  text-gray-400 ${
                    formErrors.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all cursor-not-allowed`}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                    {formErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Password
                {changePassword && <span className="text-red-500 ml-1">*</span>}
                <div className="ml-auto">
                  <input
                    type="checkbox"
                    id="changePassword"
                    checked={changePassword}
                    onChange={() => setChangePassword(!changePassword)}
                    className="mr-2"
                  />
                  <label
                    htmlFor="changePassword"
                    className="text-xs text-gray-500"
                  >
                    Change password
                  </label>
                </div>
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={!changePassword}
                  className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                    formErrors.password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
                    !changePassword ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
                {formErrors.password && changePassword && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                    {formErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={user.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Home className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <div className="relative">
                <select
                  name="gender"
                  value={user.gender || ""}
                  disabled="true"
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pl-10 rounded-lg border  text-gray-400 border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all appearance-none cursor-not-allowed"
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
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
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={user.dateOfBirth || ""}
                  disabled="true"
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pl-10 rounded-lg border text-gray-400 border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all cursor-not-allowed"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hired Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="hiredDate"
                  value={user.hiredDate || ""}
                  disabled="true"
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pl-10 rounded-lg border  text-gray-400 ${
                    formErrors.hiredDate
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all cursor-not-allowed`}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                {formErrors.hiredDate && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                    {formErrors.hiredDate}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <div className="relative">
              <select
                name="position"
                value={user.position || ""}
                disabled="true"
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pl-10 rounded-lg border  text-gray-400 ${
                  formErrors.position
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all appearance-none cursor-not-allowed`}
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
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Briefcase className="w-4 h-4 text-gray-400" />
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
              {formErrors.position && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                  {formErrors.position}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <select
                name="status"
                value={user.status || ""}
                disabled="true"
                onChange={handleInputChange}
                className="w-full px-4 py-3 pl-10 rounded-lg border  text-gray-400 border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all appearance-none cursor-not-allowed"
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
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="w-4 h-4 text-gray-400" />
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
              Rate Per Hour
            </label>
            <div className="relative">
              <input
                type="number"
                name="ratePerHour"
                value={user.ratePerHour || ""}
                disabled="true"
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full px-4 py-3 pl-10 rounded-lg border  text-gray-400 border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all cursor-not-allowed"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift
            </label>
            <div className="relative">
              <select
                name="shift"
                value={user.shift || ""}
                disabled="true"
                onChange={handleInputChange}
                className="w-full px-4 py-3 pl-10 rounded-lg border  text-gray-400 border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all appearance-none cursor-not-allowed"
              >
                <option value="" disabled>
                  Select Shift
                </option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Night">Night</option>
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Clock className="w-4 h-4 text-gray-400" />
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
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/ManageEmployeeAccounts")}
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
