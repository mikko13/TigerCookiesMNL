export const getStatusClass = (status) => {
  switch (status) {
    case "Present":
      return "bg-green-100 text-green-800";
    case "Absent":
      return "bg-red-100 text-red-800";
    case "Late":
      return "bg-gray-200 text-gray-800";
    case "N/A":
      return "bg-gray-300 text-gray-700";
    default:
      return "bg-orange-100 text-orange-800";
  }
};
