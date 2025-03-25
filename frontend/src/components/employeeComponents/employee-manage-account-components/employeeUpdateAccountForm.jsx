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
  Phone,
  Lock,
  Home,
  User,
  EyeIcon,
  EyeOff,
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
    phone: "",
    password: "",
    address: "",
    gender: "",
    dateOfBirth: "",
    hiredDate: "",
    position: "",
    ratePerHour: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profilePictureToDelete, setProfilePictureToDelete] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = () => {
    const password = user.password;
    if (!password) return { strength: 0, text: "", color: "bg-gray-200" };

    const validations = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];

    const strength = validations.filter(Boolean).length;

    const strengthMap = {
      1: { text: "Very Weak", color: "bg-red-500" },
      2: { text: "Weak", color: "bg-red-400" },
      3: { text: "Fair", color: "bg-yellow-500" },
      4: { text: "Good", color: "bg-blue-500" },
      5: { text: "Strong", color: "bg-green-500" },
    };

    return {
      strength,
      text: strengthMap[strength]?.text || "",
      color: strengthMap[strength]?.color || "",
    };
  };

  const validatePassword = () => {
    const password = user.password;
    if (!changePassword) return true;

    if (!password) {
      setFormErrors((prev) => ({ ...prev, password: "Password is required" }));
      return false;
    }

    const validationRules = {
      length: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    };

    const errorMessages = [];
    if (!validationRules.length)
      errorMessages.push("Must be at least 8 characters long");
    if (!validationRules.hasUppercase)
      errorMessages.push("Must include an uppercase letter");
    if (!validationRules.hasLowercase)
      errorMessages.push("Must include a lowercase letter");
    if (!validationRules.hasNumber) errorMessages.push("Must include a number");
    if (!validationRules.hasSpecialChar)
      errorMessages.push("Must include a special character");

    if (errorMessages.length > 0) {
      setFormErrors((prev) => ({
        ...prev,
        password: errorMessages.join(". "),
      }));
      return false;
    }

    return true;
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = () => {
    const errors = {};

    if (!user.firstName) errors.firstName = "First name is required";
    if (!user.lastName) errors.lastName = "Last name is required";
    if (!user.email) errors.email = "Email is required";
    if (!user.phone) errors.phone = "Phone number is required";
    else if (!/^(\+63|0)9\d{9}$/.test(user.phone))
      errors.phone = "Phone number is invalid";

    if (changePassword && !validatePassword()) {
      return false;
    }

    if (!user.position) errors.position = "Position is required";
    if (!user.hiredDate) errors.hiredDate = "Hired date is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));

    if (employeeId) {
      fetchEmployeeData(employeeId);
    } else if (loggedInUser && loggedInUser.id) {
      fetchEmployeeData(loggedInUser.id);
    } else {
      checkSession();
    }
  }, [employeeId]);

  const checkSession = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendURL}/api/employees/session`);
      if (response.data && response.data.user) {
        fetchEmployeeData(response.data.user.id);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      setLoading(false);
    } catch (error) {
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

      if (employeeData.profilePicture) {
        setProfilePicture(employeeData.profilePicture);
        setProfilePreview(
          `/employee-profile-pics/${employeeData.profilePicture}`
        );
      }

      setLoading(false);
    } catch (error) {
      showToast("error", "Failed to load employee data");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });

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
      showToast("error", "Failed to update account.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={user.phone}
                  onChange={handleInputChange}
                  placeholder="e.g., 09171234567"
                  className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                    formErrors.phone
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all `}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Phone className="w-4 h-4 text-gray-500" />
                </div>
                {formErrors.phone && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                    {formErrors.phone}
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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={(e) => {
                    setUser({ ...user, password: e.target.value });
                    if (formErrors.password) {
                      setFormErrors({ ...formErrors, password: null });
                    }
                  }}
                  disabled={!changePassword}
                  placeholder="Enter new password"
                  className={`w-full px-4 py-3 pl-10 pr-12 rounded-lg border ${
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
                {changePassword && (
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                )}
              </div>

              {changePassword && user.password && (
                <div className="space-y-1 mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength * 20}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      {passwordStrength.text}
                    </span>
                    <span className="text-gray-500">
                      {passwordStrength.strength < 5 &&
                        "Use 8+ chars, uppercase, lowercase, numbers & symbols"}
                    </span>
                  </div>
                </div>
              )}

              {formErrors.password && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                  {formErrors.password}
                </p>
              )}
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
