import axios from "axios";
import Swal from "sweetalert2";
import { backendURL } from "../../../urls/URL";

const handleAdminDelete = async (id) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#3b82f6",
    confirmButtonText: "Delete",
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`${backendURL}/api/admins/${id}`);
      Swal.fire("Deleted!", "Admin deleted successfully.", "success");
      window.location.reload();
    } catch (error) {
      Swal.fire("Error", "Error deleting admin", "error");
    }
  }
};

export default handleAdminDelete;
