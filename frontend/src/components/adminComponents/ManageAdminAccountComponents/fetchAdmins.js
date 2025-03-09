import { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../../urls/URL";

export const useAdmins = () => {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/admins`);
        setAdmins(response.data);
      } catch (error) {
        console.error("Error fetching admins data:", error);
      }
    };

    fetchAdmins();
  }, []);

  return admins;
};

export default useAdmins;
