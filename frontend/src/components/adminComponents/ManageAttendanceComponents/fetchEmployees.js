import { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../../urls/URL";

const useEmployees = () => {
  const [employee, setEmployee] = useState([]);

  useEffect(() => {
    const fetchCheckedInEmployees = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/employees?checkedIn=true`);
        setEmployee(response.data);
      } catch (error) {
        console.error("Error fetching checked-in employees:", error);
      }
    };

    fetchCheckedInEmployees();
  }, []);

  return employee;
};

export default useEmployees;
