export const getStatusClass = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-500/20 text-green-900";
      case "Absent":
        return "bg-red-500/20 text-red-900";
      case "On Leave":
        return "bg-gray-500/20 text-gray-900";
      case "N/A":
        return "bg-gray-300/20 text-gray-700";
      default:
        return "bg-orange-500/20 text-orange-900";
    }
  };