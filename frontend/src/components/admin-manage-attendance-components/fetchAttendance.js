import { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../urls/URL";

const useAttendance = () => {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchAdminAttendance = async () => {
      try {
        console.log("📡 Fetching ALL attendance records for Admin...");

        const response = await axios.get(`${backendURL}/api/attendance?isAdmin=true`);

        console.log("✅ Admin Attendance Fetched:", response.data.length);
        setAttendance(response.data);
      } catch (error) {
        console.error("❌ Error fetching admin attendance:", error.response?.data || error.message);
      }
    };

    fetchAdminAttendance();
  }, []);

  return attendance;
};

export default useAttendance;
