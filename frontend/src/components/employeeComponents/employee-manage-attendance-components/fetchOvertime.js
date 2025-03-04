import { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../../urls/URL";

const useEmployeeOvertime = () => {
  const [overtime, setOvertime] = useState([]);

  useEffect(() => {
    const fetchEmployeeOvertime = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const employeeID = user ? user.id : null;

        if (!employeeID) {
          console.error("⚠ No employee ID found in local storage.");
          return;
        }

        console.log(`📡 Fetching overtime records for Employee ID: ${employeeID}`);

        const response = await axios.get(
          `${backendURL}/api/overtime?employeeID=${employeeID}`
        );

        console.log("✅ Employee Overtime Records Fetched:", response.data.length);
        setOvertime(response.data);
      } catch (error) {
        console.error(
          "❌ Error fetching employee overtime records:",
          error.response?.data || error.message
        );
      }
    };

    fetchEmployeeOvertime();
  }, []);

  return overtime;
};

export default useEmployeeOvertime;