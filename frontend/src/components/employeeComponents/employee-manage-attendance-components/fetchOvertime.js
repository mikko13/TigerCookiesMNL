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
          return;
        }

        const response = await axios.get(
          `${backendURL}/api/overtime?employeeID=${employeeID}`
        );

        setOvertime(response.data);
      } catch (error) {
      }
    };

    fetchEmployeeOvertime();
  }, []);

  return overtime;
};

export default useEmployeeOvertime;