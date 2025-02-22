import { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../urls/URL";

const useEmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchEmployeeAttendance = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const employeeID = user ? user.id : null;

        if (!employeeID) {
          console.error("⚠ No employee ID found in local storage.");
          return;
        }

        console.log(`📡 Fetching attendance for Employee ID: ${employeeID}`);

        const response = await axios.get(
          `${backendURL}/api/attendance?employeeID=${employeeID}`
        );

        console.log("✅ Employee Attendance Fetched:", response.data.length);
        setAttendance(response.data);
      } catch (error) {
        console.error(
          "❌ Error fetching employee attendance:",
          error.response?.data || error.message
        );
      }
    };

    fetchEmployeeAttendance();
  }, []);

  return attendance;
};

export default useEmployeeAttendance;
