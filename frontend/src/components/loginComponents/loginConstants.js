import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backendURL } from "../../urls/URL";

export function useLoginState() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();

  // Only check session on initial load
  useEffect(() => {
    const checkSession = async () => {
      setIsCheckingSession(true);
      try {
        const res = await axios.get(`${backendURL}/api/login/session`, {
          withCredentials: true,
        });
        if (res.data.user) {
          if (res.data.user.isActive === 0) {
            await axios.post(
              `${backendURL}/api/login/logout`,
              {},
              { withCredentials: true }
            );
            setIsCheckingSession(false);
            return;
          }

          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));

          // Only navigate if we're on the login page
          const isLoginPage =
            window.location.pathname === "/" ||
            window.location.pathname === "/login";

          if (isLoginPage) {
            if (res.data.user.role === "admin") {
              navigate("/ManageEmployeeAccounts");
            } else {
              navigate("/checkin");
            }
          }
        }
      } catch (error) {
        // Session check failed, do nothing
      } finally {
        setIsCheckingSession(false);
      }
    };
    checkSession();
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const checkResponse = await axios.post(
        `${backendURL}/api/employees/check-email`,
        { email }
      );
      if (checkResponse.data.exists) {
        const accountResponse = await axios.post(
          `${backendURL}/api/employees/check-status`,
          { email },
          { withCredentials: true }
        );

        if (accountResponse.data.isActive === 0) {
          setError("Access Denied: Your account has been deactivated");
          return;
        }
      }

      const response = await axios.post(
        `${backendURL}/api/login`,
        { email, password },
        { withCredentials: true }
      );

      // Double-check isActive status from login response
      if (response.data.user && response.data.user.isActive === 0) {
        setError("Access Denied: Your account has been deactivated");

        await axios.post(
          `${backendURL}/api/login/logout`,
          {},
          { withCredentials: true }
        );
        return;
      }

      setSuccess(response.data.message);
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.role === "admin") {
        setTimeout(() => navigate("/ManageEmployeeAccounts"), 1000);
      } else {
        setTimeout(() => navigate("/checkin"), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      setTimeout(() => setError(""), 5000);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    setError,
    success,
    setSuccess,
    user,
    setUser,
    navigate,
    togglePasswordVisibility,
    handleLogin,
    isCheckingSession,
  };
}
