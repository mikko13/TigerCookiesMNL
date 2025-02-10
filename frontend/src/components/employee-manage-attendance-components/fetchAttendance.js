import { useState, useEffect } from "react";
import axios from "axios";

const useAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const fetchAttendance = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/attendance?employeeID=${user.id}`
          );
          console.log("Fetched Attendance Data:", response.data);
          setAttendance(response.data);
        } catch (error) {
          console.error("Error fetching attendance data:", error);
        }
      };

      fetchAttendance();
    }
  }, [user]);

  return attendance;
};

export default useAttendance;
