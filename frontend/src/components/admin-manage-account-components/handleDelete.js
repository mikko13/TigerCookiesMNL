import axios from "axios";
import Swal from "sweetalert2";

const handleDelete = async (id) => {
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
      await axios.delete(`http://localhost:5000/api/employees/${id}`);
      Swal.fire("Deleted!", "Employee deleted successfully.", "success");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting employee:", error);
      Swal.fire("Error", "Error deleting employee", "error");
    }
  }
};

export default handleDelete;
