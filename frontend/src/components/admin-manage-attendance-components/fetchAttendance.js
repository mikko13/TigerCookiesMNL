import { useState, useEffect } from "react";
import axios from "axios";

const useAttendance = () => {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/attendance"
        );
        console.log("Fetched Attendance Data:", response.data);
        setAttendance(response.data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchAttendance();
  }, []);

  return attendance;
};

export default useAttendance;
