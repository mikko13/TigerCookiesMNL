import { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../../urls/URL";

const useAttendance = () => {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchAdminAttendance = async () => {
      try {
        const response = await axios.get(
          `${backendURL}/api/attendance?isAdmin=true`
        );
        setAttendance(response.data);
      } catch (error) {}
    };

    fetchAdminAttendance();
  }, []);

  return attendance;
};

export default useAttendance;
