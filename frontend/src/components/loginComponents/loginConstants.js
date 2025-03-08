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
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/login/session`, { withCredentials: true });
        setUser(res.data.user);
        if (res.data.user.role === "admin") {
          navigate("/ManageEmployeeAccounts");
        } else {
          navigate("/checkin");
        }
      } catch (error) {
        console.log("Not logged in");
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
      const response = await axios.post(`${backendURL}/api/login`, { email, password }, { withCredentials: true });
      setSuccess(response.data.message);
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      if (response.data.user.role === "admin") {
        setTimeout(() => navigate("/ManageEmployeeAccounts"), 2000);
      } else {
        setTimeout(() => navigate("/checkin"), 2000);
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
  };
}
