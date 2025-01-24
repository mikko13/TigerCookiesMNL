import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function useLoginState() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/employees/login",
        { email, password }
      );

      setSuccess(response.data.message);
      console.log("Logged-in user details:", response.data.account);

      setTimeout(() => setSuccess(""), 5000);

      setTimeout(() => {
        navigate("/checkin");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");

      setTimeout(() => setError(""), 5000);
    }
  };

  return {
    email, setEmail, password, setPassword, showPassword, setShowPassword, 
    error, setError, success, setSuccess, navigate, togglePasswordVisibility, handleLogin
  };
}
