import { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../../urls/URL";

const useEmployeeOvertime = () => {
  const [overtime, setOvertime] = useState([]);

  useEffect(() => {
    const fetchAllOvertime = async () => {
      try {
        console.log("📡 Fetching all overtime records...");

        const response = await axios.get(`${backendURL}/api/overtime/all`);
        setOvertime(response.data);

        console.log(`✅ Successfully fetched ${response.data.length} overtime records.`);
      } catch (error) {
        console.error("❌ Error fetching overtime records:", error.response?.data || error.message);
      }
    };

    fetchAllOvertime();
  }, []);

  return overtime;
};

export default useEmployeeOvertime;