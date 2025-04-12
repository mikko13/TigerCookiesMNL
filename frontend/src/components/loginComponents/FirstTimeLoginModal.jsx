import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../urls/URL";

const FirstTimeLoginModal = ({ user, onComplete, onCancel, showToast }) => {
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    gender: "",
    dateOfBirth: "",
    sssNumber: "",
    philhealthNumber: "",
    pagibigNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [changePassword, setChangePassword] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
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
    if (!changePassword) return true;
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
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
      setErrors((prev) => ({
        ...prev,
        password: errorMessages.join(". "),
      }));
      return false;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return false;
    }

    return true;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (!/^(\+63|0)9\d{9}$/.test(formData.phone))
      newErrors.phone = "Please enter a valid Philippine phone number";

    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.gender) newErrors.gender = "Gender is required";

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();

      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        newErrors.dateOfBirth = "You must be at least 18 years old";
      }
    }

    if (!formData.sssNumber) newErrors.sssNumber = "SSS number is required";
    if (!formData.philhealthNumber)
      newErrors.philhealthNumber = "PhilHealth number is required";
    if (!formData.pagibigNumber)
      newErrors.pagibigNumber = "Pag-IBIG number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setStep(2);
    } else {
      showToast("error", "Please complete all required fields correctly");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      handleNextStep();
      return;
    }

    if (!validatePassword()) {
      showToast("error", "Please check your password requirements");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `${backendURL}/api/employees/${user._id}`,
        {
          ...formData,
          isFirstTime: 0,
        },
        { withCredentials: true }
      );

      showToast("success", "Profile updated successfully");

      // Wait a moment before calling onComplete to allow the toast to be seen
      setTimeout(() => {
        onComplete(response.data.employee);
      }, 1000);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message ||
          "An error occurred updating your profile"
      );
      setIsSubmitting(false);
    }
  };

  const passwordStrengthInfo = getPasswordStrength();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div
        className="absolute inset-0 bg-black bg-opacity-60 transition-opacity duration-300"
        onClick={onCancel}
      ></div>

      <div className="relative bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto transition-all duration-300 transform scale-100 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-3 sm:p-4">
          <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold text-center">
            {step === 1 ? "Complete Your Profile" : "Set Your Password"}
          </h3>
          <div className="flex justify-center mt-3 sm:mt-4">
            <div className="flex items-center w-4/5 sm:w-2/3">
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? "bg-white text-yellow-600"
                    : "bg-yellow-200 text-yellow-800"
                } text-xs sm:text-base font-bold`}
              >
                1
              </div>
              <div
                className={`flex-1 h-1 mx-1 ${
                  step >= 2 ? "bg-white" : "bg-yellow-200"
                }`}
              ></div>
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? "bg-white text-yellow-600"
                    : "bg-yellow-200 text-yellow-800"
                } text-xs sm:text-base font-bold`}
              >
                2
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
          <p className="text-yellow-600 text-xs sm:text-sm mb-4 sm:mb-6 text-center">
            {step === 1
              ? "Please provide the following information to complete your account setup"
              : "Create a strong password to secure your account"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-yellow-700 text-xs sm:text-sm font-semibold block mb-1">
                      Phone Number*
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g., 09123456789"
                      className={`w-full text-xs sm:text-sm border ${
                        errors.phone ? "border-red-400" : "border-yellow-200"
                      } px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg outline-yellow-500 bg-yellow-50 focus:bg-white transition-all`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-yellow-700 text-xs sm:text-sm font-semibold block mb-1">
                      Gender*
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full text-xs sm:text-sm border ${
                        errors.gender ? "border-red-400" : "border-yellow-200"
                      } px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg outline-yellow-500 bg-yellow-50 focus:bg-white transition-all`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-yellow-700 text-xs sm:text-sm font-semibold block mb-1">
                    Address*
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your full address"
                    className={`w-full text-xs sm:text-sm border ${
                      errors.address ? "border-red-400" : "border-yellow-200"
                    } px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg outline-yellow-500 bg-yellow-50 focus:bg-white transition-all`}
                    rows="2"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-yellow-700 text-xs sm:text-sm font-semibold block mb-1">
                    Date of Birth*
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`w-full text-xs sm:text-sm border ${
                      errors.dateOfBirth
                        ? "border-red-400"
                        : "border-yellow-200"
                    } px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg outline-yellow-500 bg-yellow-50 focus:bg-white transition-all`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="text-yellow-700 text-xs sm:text-sm font-semibold block mb-1">
                      SSS Number*
                    </label>
                    <input
                      type="text"
                      name="sssNumber"
                      value={formData.sssNumber}
                      onChange={handleChange}
                      placeholder="SSS #"
                      className={`w-full text-xs sm:text-sm border ${
                        errors.sssNumber
                          ? "border-red-400"
                          : "border-yellow-200"
                      } px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg outline-yellow-500 bg-yellow-50 focus:bg-white transition-all`}
                    />
                    {errors.sssNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.sssNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-yellow-700 text-xs sm:text-sm font-semibold block mb-1">
                      PhilHealth*
                    </label>
                    <input
                      type="text"
                      name="philhealthNumber"
                      value={formData.philhealthNumber}
                      onChange={handleChange}
                      placeholder="PhilHealth #"
                      className={`w-full text-xs sm:text-sm border ${
                        errors.philhealthNumber
                          ? "border-red-400"
                          : "border-yellow-200"
                      } px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg outline-yellow-500 bg-yellow-50 focus:bg-white transition-all`}
                    />
                    {errors.philhealthNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.philhealthNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-yellow-700 text-xs sm:text-sm font-semibold block mb-1">
                      Pag-IBIG*
                    </label>
                    <input
                      type="text"
                      name="pagibigNumber"
                      value={formData.pagibigNumber}
                      onChange={handleChange}
                      placeholder="Pag-IBIG #"
                      className={`w-full text-xs sm:text-sm border ${
                        errors.pagibigNumber
                          ? "border-red-400"
                          : "border-yellow-200"
                      } px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg outline-yellow-500 bg-yellow-50 focus:bg-white transition-all`}
                    />
                    {errors.pagibigNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.pagibigNumber}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 sm:mb-6">
                  <label className="inline-flex items-center mb-3 sm:mb-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={changePassword}
                      onChange={() => setChangePassword(!changePassword)}
                      className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600"
                    />
                    <span className="ml-2 text-yellow-700 text-xs sm:text-sm">
                      Change your default password
                    </span>
                  </label>

                  {changePassword && (
                    <>
                      <div className="mb-3 sm:mb-4">
                        <label className="text-yellow-700 text-xs sm:text-sm font-semibold block mb-1">
                          New Password*
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          disabled={!changePassword}
                          className={`w-full text-xs sm:text-sm border ${
                            errors.password
                              ? "border-red-400"
                              : "border-yellow-200"
                          } px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg outline-yellow-500 bg-yellow-50 focus:bg-white transition-all`}
                        />

                        {formData.password && (
                          <div className="mt-2 sm:mt-3">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-gray-600">
                                Password Strength:
                              </span>
                              <span className="text-xs font-semibold">
                                {passwordStrengthInfo.text}
                              </span>
                            </div>
                            <div className="w-full h-1 sm:h-1.5 bg-gray-200 rounded overflow-hidden">
                              <div
                                className={`h-full ${passwordStrengthInfo.color} transition-all duration-300`}
                                style={{
                                  width: `${
                                    (passwordStrengthInfo.strength / 5) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {errors.password && (
                          <p className="text-red-500 text-xs mt-2">
                            {errors.password}
                          </p>
                        )}

                        <div className="mt-2 sm:mt-3 text-xs text-gray-600">
                          <p>Password requirements:</p>
                          <ul className="list-disc pl-4 sm:pl-5 mt-1 space-y-0.5 sm:space-y-1">
                            <li
                              className={
                                formData.password?.length >= 8
                                  ? "text-green-600"
                                  : ""
                              }
                            >
                              At least 8 characters
                            </li>
                            <li
                              className={
                                /[A-Z]/.test(formData.password)
                                  ? "text-green-600"
                                  : ""
                              }
                            >
                              One uppercase letter
                            </li>
                            <li
                              className={
                                /[a-z]/.test(formData.password)
                                  ? "text-green-600"
                                  : ""
                              }
                            >
                              One lowercase letter
                            </li>
                            <li
                              className={
                                /[0-9]/.test(formData.password)
                                  ? "text-green-600"
                                  : ""
                              }
                            >
                              One number
                            </li>
                            <li
                              className={
                                /[^A-Za-z0-9]/.test(formData.password)
                                  ? "text-green-600"
                                  : ""
                              }
                            >
                              One special character
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <label className="text-yellow-700 text-xs sm:text-sm font-semibold block mb-1">
                          Confirm Password*
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          disabled={!changePassword}
                          className={`w-full text-xs sm:text-sm border ${
                            errors.confirmPassword
                              ? "border-red-400"
                              : "border-yellow-200"
                          } px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg outline-yellow-500 bg-yellow-50 focus:bg-white transition-all`}
                        />
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-between gap-3 sm:gap-4 mt-6 sm:mt-8">
              {step === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium border border-yellow-400 text-yellow-700 hover:bg-yellow-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg"
                  >
                    Next
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium border border-yellow-400 text-yellow-700 hover:bg-yellow-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg disabled:opacity-70"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Complete Setup"}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeLoginModal;
