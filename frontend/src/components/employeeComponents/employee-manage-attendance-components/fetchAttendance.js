import { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../../urls/URL";

const useEmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchEmployeeAttendance = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const employeeID = user ? user.id : null;

        if (!employeeID) {
          return;
        }

        const response = await axios.get(
          `${backendURL}/api/attendance?employeeID=${employeeID}`
        );

        setAttendance(response.data);
      } catch (error) {
      }
    };

    fetchEmployeeAttendance();
  }, []);

  return attendance;
};

export default useEmployeeAttendance;
