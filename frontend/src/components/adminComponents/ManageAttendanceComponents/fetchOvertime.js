import { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../../urls/URL";

const useEmployeeOvertime = () => {
  const [overtime, setOvertime] = useState([]);

  useEffect(() => {
    const fetchAllOvertime = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/overtime/all`);
        setOvertime(response.data);
      } catch (error) {}
    };

    fetchAllOvertime();
  }, []);

  return overtime;
};

export default useEmployeeOvertime;
