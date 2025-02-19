import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AdminPayrollMain() {
  const [pendingPayrolls, setPendingPayrolls] = useState([]);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [forceRender, setForceRender] = useState(false); // ✅ Forces re-render if needed

  const [formData, setFormData] = useState({
    salary: 0,
    holidayPay: 0,
    totalDeduction: 0,
    overtimePay: 0,
    incentives: 0,
  });

  // Fetch Payrolls
  useEffect(() => {
    fetchPendingPayrolls();
  }, []);

  useEffect(() => {
    console.log("Updated State:", pendingPayrolls); // ✅ Logs whenever state updates
    setForceRender((prev) => !prev); // ✅ Force re-render
  }, [pendingPayrolls]);

  const fetchPendingPayrolls = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/payroll/pending"); // ✅ Ensure correct URL
      console.log("Fetched Payrolls:", res.data); // ✅ Debugging step
      setPendingPayrolls(res.data);
    } catch (error) {
      console.error("Error fetching pending payrolls:", error);
    }
  };

  const handlePublishPayroll = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Confirm Payroll Publishing",
      text: "Are you sure you want to publish this payroll?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, publish it!",
    });

    if (!isConfirmed) return;

    try {
      await axios.put(`http://localhost:5000/api/payroll/publish/${id}`);
      fetchPendingPayrolls();
      Swal.fire("Success!", "Payroll has been published.", "success");
    } catch (error) {
      console.error("Error publishing payroll:", error);
      Swal.fire("Error!", "Failed to publish payroll.", "error");
    }
  };

  const handleEditPayroll = (payroll) => {
    setEditingPayroll(payroll);
    setFormData({
      salary: payroll.salary || 0,
      holidayPay: payroll.holidayPay || 0,
      totalDeduction: payroll.totalDeduction || 0,
      overtimePay: payroll.overtimePay || 0,
      incentives: payroll.incentives || 0,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/payroll/edit/${editingPayroll._id}`,
        formData
      );
      setEditingPayroll(null);
      fetchPendingPayrolls();
      Swal.fire("Success!", "Payroll has been updated.", "success");
    } catch (error) {
      console.error("Error updating payroll:", error);
      Swal.fire("Error!", "Failed to update payroll.", "error");
    }
  };

  return (
    <div className="relative flex flex-col w-full h-full text-gray-700 shadow-md bg-clip-border">
      <h5 className="block font-sans text-md md:text-xl font-semibold text-blue-gray-900">
        Pending Payrolls
      </h5>
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left table-auto border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 border">Employee</th>
              <th className="p-4 border">Pay Period</th>
              <th className="p-4 border">Salary</th>
              <th className="p-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {console.log("Rendering Payrolls:", pendingPayrolls)} {/* ✅ Debugging */}
            {pendingPayrolls.length > 0 ? (
              pendingPayrolls.map((payroll) => (
                <tr key={payroll._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 border">{payroll.employeeName || "No Name"}</td>
                  <td className="p-4 border">{payroll.payPeriod || "No Pay Period"}</td>
                  <td className="p-4 border">{payroll.salary || 0}</td>
                  <td className="p-4 border flex gap-2">
                    <button
                      onClick={() => handleEditPayroll(payroll)}
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handlePublishPayroll(payroll._id)}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Publish
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-red-500 py-4">
                  No pending payrolls.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingPayroll && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-[90%] md:w-[600px]">
            <h2 className="text-xl font-semibold mb-4">
              Edit Payroll for {editingPayroll.employeeName}
            </h2>
            <div className="space-y-4">
              {Object.keys(formData).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-semibold">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setEditingPayroll(null)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
