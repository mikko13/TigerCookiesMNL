import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { backendURL } from "../../../urls/URL";

export default function UpdateAdminAccountForm() {
  const { adminId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "admin",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profilePictureToDelete, setProfilePictureToDelete] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendURL}/api/admins/${adminId}`);

        const adminData = response.data;
        setFormData({
          firstName: adminData.firstName || "",
          lastName: adminData.lastName || "",
          email: adminData.email || "",
          password: "",
          role: adminData.role || "admin",
        });

        if (adminData.profilePicture) {
          setProfilePicture(adminData.profilePicture);
          setProfilePreview(`/admin-profile-pics/${adminData.profilePicture}`);
        }

        setLoading(false);
      } catch (error) {
        showToast("error", "Failed to load admin data");
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [adminId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Please provide a valid email";
    if (changePassword && !formData.password)
      errors.password = "Password is required";

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

    Object.keys(formData).forEach((key) => {
      if (key !== "password" || (key === "password" && changePassword)) {
        formDataToSend.append(key, formData[key]);
      }
    });

    if (profilePicture instanceof File) {
      formDataToSend.append("profilePicture", profilePicture);
    } else if (profilePictureToDelete) {
      formDataToSend.append("profilePicture", "");
    }

    try {
      await axios.put(`${backendURL}/api/admins/${adminId}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("success", "Admin account updated successfully!");

      setTimeout(() => {
        navigate("/ManageAdminAccounts");
      }, 2000);
    } catch (error) {
      showToast("error", "Failed to update admin account.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <UserCircle className="mr-2" size={24} />
          Update Admin Account
        </h2>
        <p className="text-yellow-50 mt-1 opacity-90">Edit admin information</p>
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
                  placeholder="admin@company.com"
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

            <div className="col-span-2">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="changePassword"
                  checked={changePassword}
                  onChange={() => setChangePassword(!changePassword)}
                  className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
                />
                <label
                  htmlFor="changePassword"
                  className="ml-2 text-sm text-gray-700"
                >
                  Change Password
                </label>
              </div>

              {changePassword && (
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                      formErrors.password
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 bg-gray-50"
                    } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all`}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                      {formErrors.password}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/ManageAdminAccounts")}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium transition-all hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium transition-all hover:bg-yellow-600 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Admin"
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
