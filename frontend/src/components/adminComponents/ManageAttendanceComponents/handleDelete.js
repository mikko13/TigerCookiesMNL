import axios from "axios";
import Swal from "sweetalert2";
import { backendURL } from "../../../urls/URL";

const handleDelete = async (attendanceID, setAttendance) => {
  try {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirmDelete.isConfirmed) {
      const response = await axios.delete(
        `${backendURL}/api/attendance/${attendanceID}`
      );

      if (response.data.success) {
        Swal.fire({
          title: "Deleted!",
          text: "The attendance record has been deleted.",
          icon: "success",
        });

        setAttendance((prev) =>
          prev.filter((record) => record._id !== attendanceID)
        );
      } else {
        Swal.fire({
          title: "Error",
          text: response.data.message || "Failed to delete attendance record.",
          icon: "error",
        });
      }
    }
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: "Server error. Please try again later.",
      icon: "error",
    });
  }
};

export default handleDelete;
