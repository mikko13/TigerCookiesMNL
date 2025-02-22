import { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../urls/URL";

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/employees`);
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees data:", error);
      }
    };

    fetchEmployees();
  }, []);

  return employees;
};

export default useEmployees;
