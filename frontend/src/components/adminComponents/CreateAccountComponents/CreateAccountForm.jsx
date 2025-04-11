import { useState, useEffect } from "react";
import {
  UserCircle,
  Camera,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Mail,
  Lock,
  User,
  Briefcase,
  PhilippinePeso,
  Calendar,
  EyeIcon,
  EyeOff,
  RefreshCw,
  Hash,
} from "lucide-react";
import { backendURL } from "../../../urls/URL";

export default function CreateAccountForm({ onRoleChange }) {
  const [formData, setFormData] = useState({
    role: "Employee",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    employeeID: "",
    hiredDate: "",
    position: "",
    ratePerHour: "",
    overtimeRate: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [usingDefaultPassword, setUsingDefaultPassword] = useState(true);

  useEffect(() => {
    // Auto-generate password when firstName or lastName changes
    if (usingDefaultPassword && formData.firstName && formData.lastName) {
      const generatedPassword = `${formData.firstName}${formData.lastName}@123`;
      setFormData((prev) => ({
        ...prev,
        password: generatedPassword,
      }));
    }
  }, [formData.firstName, formData.lastName, usingDefaultPassword]);

  const toggleDefaultPassword = () => {
    setUsingDefaultPassword(!usingDefaultPassword);
    if (!usingDefaultPassword) {
      // Switching back to default password
      if (formData.firstName && formData.lastName) {
        const generatedPassword = `${formData.firstName}${formData.lastName}@123`;
        setFormData((prev) => ({
          ...prev,
          password: generatedPassword,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          password: "",
        }));
      }
    } else {
      // Switching to manual password - clear it
      setFormData((prev) => ({
        ...prev,
        password: "",
      }));
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
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
    const password = formData.password;
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "role" && onRoleChange) {
      onRoleChange(value);
    }

    setFormData({ ...formData, [name]: value });

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const validateDates = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (formData.role.toLowerCase() === "employee") {
      if (formData.hiredDate) {
        const hiredDate = new Date(formData.hiredDate);

        if (isNaN(hiredDate.getTime())) {
          errors.hiredDate = "Invalid date format";
        } else {
          const maxPastDate = new Date();
          maxPastDate.setFullYear(maxPastDate.getFullYear() - 50);
          if (hiredDate < maxPastDate) {
            errors.hiredDate = "Hired date cannot be more than 50 years ago";
          }

          const maxFutureDate = new Date();
          maxFutureDate.setDate(maxFutureDate.getDate() + 14);
          if (hiredDate > maxFutureDate) {
            errors.hiredDate =
              "Hired date cannot be more than 2 weeks in the future";
          }
        }
      }
    }

    return errors;
  };

  const validateForm = () => {
    const errors = {};
    const isAdmin = formData.role.toLowerCase() === "admin";

    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";

    if (!validatePassword()) {
      return false;
    }

    if (!isAdmin) {
      if (!formData.employeeID) errors.employeeID = "Employee ID is required";
      if (!formData.position) errors.position = "Position is required";
      if (!formData.hiredDate) errors.hiredDate = "Hired date is required";

      const dateErrors = validateDates();
      Object.assign(errors, dateErrors);
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // In your CreateAccountForm component
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) {
    showToast("error", "Please correct the errors in the form.");
    return;
  }
  setLoading(true);

  try {
    const formDataToSend = new FormData();
    const isAdmin = formData.role.toLowerCase() === "admin";

    // Append all form data
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    if (profilePicture) {
      formDataToSend.append("profilePicture", profilePicture);
    }

    const endpoint = isAdmin ? "admins" : "employees";
    const response = await fetch(`${backendURL}/api/${endpoint}`, {
      method: "POST",
      body: formDataToSend,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create account");
    }

    showToast("success", 
      isAdmin 
        ? "Admin account created successfully!" 
        : "Employee account created successfully! Welcome email sent."
    );
    
    resetForm();
  } catch (error) {
    showToast("error", error.message || "Failed to create account.");
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setFormData({
      role: "Employee",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      employeeID: "",
      hiredDate: "",
      position: "",
      ratePerHour: "",
      overtimeRate: "",
    });

    if (onRoleChange) {
      onRoleChange("Employee");
    }

    setProfilePicture(null);
    setProfilePreview(null);
    setFormErrors({});
    setUsingDefaultPassword(true);
  };

  useEffect(() => {
    if (onRoleChange) {
      onRoleChange(formData.role);
    }
  }, []);

  const isAdmin = formData.role.toLowerCase() === "admin";
  const passwordStrength = getPasswordStrength();

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <UserCircle className="mr-2" size={24} />
          {isAdmin ? "Create Admin Account" : "Create Employee Account"}
        </h2>
        <p className="text-yellow-50 mt-1 opacity-90">
          {isAdmin
            ? "Add a new admin to the system"
            : "Add a new employee to the system"}
        </p>
      </div>

      <div className="p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
        >
          <option value="Employee">Employee</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture
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
                    onClick={() => {
                      setProfilePicture(null);
                      setProfilePreview(null);
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
                    onChange={handlePictureChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>

          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee ID field - moved BEFORE firstName for employees only */}
            {!isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="employeeID"
                    value={formData.employeeID}
                    onChange={handleInputChange}
                    placeholder="Enter employee ID"
                    className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                      formErrors.employeeID
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 bg-gray-50"
                    } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all`}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Hash className="w-4 h-4 text-gray-500" />
                  </div>
                  {formErrors.employeeID && (
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                      {formErrors.employeeID}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                    formErrors.firstName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all`}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-4 h-4 text-gray-500" />
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
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                    formErrors.lastName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all`}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-4 h-4 text-gray-500" />
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
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@company.com"
                  className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                    formErrors.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all`}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-500" />
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
              <label className="flex justify-between items-center text-sm font-medium text-gray-700 mb-1">
                <span>
                  Password <span className="text-red-500">*</span>
                </span>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={toggleDefaultPassword}
                    className={`flex items-center text-xs px-2 py-1 rounded ${
                      usingDefaultPassword
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    {usingDefaultPassword ? "Auto" : "Manual"}
                  </button>
                </div>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (usingDefaultPassword) setUsingDefaultPassword(false);
                    if (formErrors.password) {
                      setFormErrors({ ...formErrors, password: null });
                    }
                  }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pl-10 pr-12 rounded-lg border ${
                    formErrors.password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all`}
                  disabled={usingDefaultPassword}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
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
              </div>

              {formData.password && (
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

              {usingDefaultPassword &&
                formData.firstName &&
                formData.lastName && (
                  <p className="mt-1 text-xs text-green-600">
                    Default password: {formData.firstName}
                    {formData.lastName}@123
                  </p>
                )}
            </div>

            {/* Employee-specific fields - Hired Date moved here */}
            {!isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hired Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="hiredDate"
                    value={formData.hiredDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                      formErrors.hiredDate
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 bg-gray-50"
                    } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all`}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                  {formErrors.hiredDate && (
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                      {formErrors.hiredDate}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Employee-specific fields section */}
        {!isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                    formErrors.position
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all appearance-none`}
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
                  <Briefcase className="w-4 h-4 text-gray-500" />
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
                  value={formData.ratePerHour}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <PhilippinePeso className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="overtimeRate"
                  value={formData.overtimeRate}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <PhilippinePeso className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2.5 text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Reset
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
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create
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
