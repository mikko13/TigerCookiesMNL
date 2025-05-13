import React, { useState, useEffect } from "react";
import { useLoginState } from "./loginConstants";
import PrivacyPolicyModal from "./privacypolicyModal";
import FirstTimeLoginModal from "./FirstTimeLoginModal";
import axios from "axios";
import { backendURL } from "../../urls/URL";
import { Link } from "react-router-dom";

export default function LoginForm({ showToast }) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    togglePasswordVisibility,
    handleLogin,
    error,
    success,
    user,
    setUser,
    navigate,
    isCheckingSession,
  } = useLoginState();

  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [fadeEffect, setFadeEffect] = useState(false);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [firstTimeUser, setFirstTimeUser] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (error) {
      showToast("error", error);
    }
  }, [error, showToast]);

  useEffect(() => {
    if (success) {
      showToast("success", "Login Successful");
    }
  }, [success, showToast]);

  const openModal = () => {
    setShowPrivacyPolicy(true);
    setTimeout(() => setFadeEffect(true), 50);
  };

  const closeModal = () => {
    setFadeEffect(false);
    setTimeout(() => setShowPrivacyPolicy(false), 300);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      // First check if this is a valid account
      const checkResponse = await axios.post(
        `${backendURL}/api/employees/check-email`,
        { email }
      );

      if (!checkResponse.data.exists) {
        // If account doesn't exist, proceed with normal login to get proper error
        await handleLogin(e);
        setIsLoggingIn(false);
        return;
      }

      // If account exists, check status and if first-time login
      const statusResponse = await axios.post(
        `${backendURL}/api/employees/check-status`,
        { email }
      );

      if (statusResponse.data.isActive === 0) {
        showToast("error", "Access Denied: Your account has been deactivated");
        setIsLoggingIn(false);
        return;
      }

      // Perform login attempt
      const loginResponse = await axios.post(
        `${backendURL}/api/login`,
        { email, password },
        { withCredentials: true }
      );

      // If login successful, check if this is first-time login for employee
      if (
        loginResponse.data.user &&
        loginResponse.data.user.role === "employee"
      ) {
        // Fetch full employee data to check isFirstTime flag
        const employeeResponse = await axios.get(
          `${backendURL}/api/employees/${loginResponse.data.user.id}`,
          { withCredentials: true }
        );

        if (employeeResponse.data.isFirstTime === 1) {
          // Store the user and show first-time login modal
          setFirstTimeUser(employeeResponse.data);
          setUser(loginResponse.data.user); // Set user state to maintain session
          localStorage.setItem("user", JSON.stringify(loginResponse.data.user));
          setShowFirstTimeModal(true);
          setIsLoggingIn(false);
          return;
        }
      }

      // For admin or non-first-time employee, proceed normally
      showToast("success", "Login Successful");
      setUser(loginResponse.data.user);
      localStorage.setItem("user", JSON.stringify(loginResponse.data.user));

      // Add a 1-second delay, then refresh the page
      setTimeout(() => {
        if (loginResponse.data.user.role === "admin") {
          navigate("/ManageEmployeeAccounts", { replace: true });
        } else {
          navigate("/checkin", { replace: true });
        }
      }, 1000);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFirstTimeComplete = (updatedUser) => {
    setShowFirstTimeModal(false);
    showToast("success", "Profile updated successfully! Redirecting...");

    // Important: Update the local user state with the updated user data
    setUser({
      ...user,
      ...updatedUser,
      isFirstTime: 0,
    });

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...user,
        ...updatedUser,
        isFirstTime: 0,
      })
    );

    // Use replace to prevent back navigation to login
    setTimeout(() => {
      navigate("/checkin", { replace: true });
      // Add page refresh after navigation
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }, 1500);
  };

  const handleFirstTimeCancel = () => {
    setShowFirstTimeModal(false);
    // Log out the user since they canceled the first-time setup
    axios
      .post(`${backendURL}/api/login/logout`, {}, { withCredentials: true })
      .then(() => {
        localStorage.removeItem("user");
        setUser(null);
        showToast("info", "Setup canceled. Please login again when ready.");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  // If checking session, show loading or nothing
  if (isCheckingSession) {
    return null; // Or a loading spinner
  }

  return (
    <div className="bg-white mt-0 md:mt-20 p-6 max-w-md shadow-lg rounded-lg border-t-4 border-yellow-400 transition-all duration-300 hover:shadow-2xl">
      <form className="space-y-6" onSubmit={handleFormSubmit}>
        <div className="text-center mb-8">
          <h3 className="text-yellow-800 text-3xl font-bold tracking-wide">
            Welcome Back!
          </h3>
          <p className="text-yellow-600 text-sm mt-4 font-medium">
            Sign in to your Tiger Cookies account
          </p>
        </div>

        <div className="transform transition-all duration-300 hover:scale-102">
          <label
            htmlFor="email"
            className="text-yellow-700 text-sm mb-2 block font-semibold"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm text-yellow-900 border border-yellow-200 pl-12 pr-4 py-3.5 rounded-lg outline-yellow-500 bg-yellow-50 focus:bg-white transition-all duration-300 focus:shadow-md"
              placeholder="Enter your email address"
            />
          </div>
        </div>

        <div className="transform transition-all duration-300 hover:scale-102">
          <label
            htmlFor="password"
            className="text-yellow-700 text-sm mb-2 block font-semibold"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm text-yellow-900 border border-yellow-200 pl-12 pr-12 py-3.5 rounded-lg outline-yellow-500 bg-yellow-50 focus:bg-white transition-all duration-300 focus:shadow-md"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-500 hover:text-yellow-700 transition-colors duration-300"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={openModal}
            className="text-sm text-yellow-600 hover:text-yellow-800 hover:underline transition-all duration-300 font-medium"
          >
            Privacy Policy
          </button>

          <div className="text-sm">
  <Link
    to="/ForgotPassword"
    className="text-yellow-600 hover:text-yellow-800 hover:underline font-semibold transition-all duration-300"
  >
    Forgot your password?
  </Link>
</div>
        </div>

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full py-3.5 px-4 mt-6 text-base tracking-wide rounded-lg text-yellow-900 font-bold 
          bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:from-yellow-500 hover:via-yellow-400 hover:to-yellow-500
          transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-70"
        >
          {isLoggingIn ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        show={showPrivacyPolicy}
        fadeEffect={fadeEffect}
        closeModal={closeModal}
      />

      {/* First Time Login Modal */}
      {showFirstTimeModal && firstTimeUser && (
        <FirstTimeLoginModal
          user={firstTimeUser}
          onComplete={handleFirstTimeComplete}
          onCancel={handleFirstTimeCancel}
          showToast={showToast}
        />
      )}
    </div>
  );
}
