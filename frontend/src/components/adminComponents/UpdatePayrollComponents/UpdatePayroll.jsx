import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { backendURL } from "../../../urls/URL";

export default function UpdateEmployeePayroll() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const recordFromState = location.state?.record;

  const [formData, setFormData] = useState({
    employeeID: "",
    payPeriod: "",
    regularHours: 0,
    hourlyRate: 0,
    baseSalary: 0,
    overtimeHours: 0,
    overtimeRate: 0,
    overtimePay: 0,
    holidayHours: 0,
    holidayRate: 0,
    holidayPay: 0,
    nightDiffHours: 0,
    nightDiffRate: 0,
    nightDiffPay: 0,
    incentives: 0,
    sssDeduction: 0,
    phicDeduction: 0,
    hdmfDeduction: 0,
    taxDeduction: 0,
    otherDeductions: 0,
    totalEarnings: 0,
    totalDeductions: 0,
    netPay: 0,
    isPublished: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/employees`);
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError("Failed to load employees");
      }
    };

    const fetchPayrollData = async () => {
      if (recordFromState) {
        setFormData({
          ...recordFromState,
          employeeID: recordFromState.employeeID?._id || "",
        });
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${backendURL}/api/payroll/${id}`);
        setFormData({
          ...response.data,
          employeeID: response.data.employeeID?._id || "",
        });
      } catch (error) {
        console.error("Error fetching payroll data:", error);
        setError("Failed to load payroll data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
    fetchPayrollData();
  }, [id, recordFromState]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? parseFloat(value) || 0 : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  useEffect(() => {
    const overtimePay = formData.overtimeHours * formData.overtimeRate;
    const holidayPay = formData.holidayHours * formData.holidayRate;
    const nightDiffPay = formData.nightDiffHours * formData.nightDiffRate;
    const totalEarnings =
      formData.baseSalary +
      overtimePay +
      holidayPay +
      nightDiffPay +
      formData.incentives;
    const totalDeductions =
      formData.sssDeduction +
      formData.phicDeduction +
      formData.hdmfDeduction +
      formData.taxDeduction +
      formData.otherDeductions;
    const netPay = totalEarnings - totalDeductions;

    setFormData((prev) => ({
      ...prev,
      overtimePay,
      holidayPay,
      nightDiffPay,
      totalEarnings,
      totalDeductions,
      netPay,
    }));
  }, [
    formData.baseSalary,
    formData.overtimeHours,
    formData.overtimeRate,
    formData.holidayHours,
    formData.holidayRate,
    formData.nightDiffHours,
    formData.nightDiffRate,
    formData.incentives,
    formData.sssDeduction,
    formData.phicDeduction,
    formData.hdmfDeduction,
    formData.taxDeduction,
    formData.otherDeductions,
  ]);

  const handleRegularHoursChange = (e) => {
    const regularHours = parseFloat(e.target.value) || 0;
    const baseSalary = regularHours * formData.hourlyRate;

    setFormData((prev) => ({
      ...prev,
      regularHours,
      baseSalary,
    }));
  };

  const handleHourlyRateChange = (e) => {
    const hourlyRate = parseFloat(e.target.value) || 0;
    const baseSalary = formData.regularHours * hourlyRate;

    setFormData((prev) => ({
      ...prev,
      hourlyRate,
      baseSalary,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await axios.put(`${backendURL}/api/payroll/${id}`, formData);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Payroll record has been updated.",
      }).then(() => {
        navigate("/ManageEmployeePayroll");
      });
    } catch (error) {
      console.error("Error updating payroll:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to update payroll record.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        <p className="ml-4 text-gray-600">Loading payroll data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <AlertCircle className="text-red-500 mr-3" size={24} />
          <h2 className="text-lg font-semibold text-red-700">Error</h2>
        </div>
        <p className="mt-2 text-red-600">{error}</p>
        <button
          onClick={() => navigate("/ManageEmployeePayroll")}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Payroll Management
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/ManageEmployeePayroll")}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Update Payroll Record</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                name="employeeID"
                value={formData.employeeID}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {`${employee.firstName} ${employee.lastName}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Period
              </label>
              <input
                type="text"
                name="payPeriod"
                value={formData.payPeriod}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="e.g., January 1-15, 2025"
                required
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Regular Hours & Base Salary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Regular Hours
                </label>
                <input
                  type="number"
                  name="regularHours"
                  value={formData.regularHours}
                  onChange={handleRegularHoursChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate (PHP)
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleHourlyRateChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Salary
                </label>
                <input
                  type="text"
                  value={formatCurrency(formData.baseSalary)}
                  className="w-full border border-gray-300 bg-gray-100 rounded-md py-2 px-3 focus:outline-none focus:ring-0 text-gray-700"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Additional Earnings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime Hours
                </label>
                <input
                  type="number"
                  name="overtimeHours"
                  value={formData.overtimeHours}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime Rate (PHP)
                </label>
                <input
                  type="number"
                  name="overtimeRate"
                  value={formData.overtimeRate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime Pay
                </label>
                <input
                  type="text"
                  value={formatCurrency(formData.overtimePay)}
                  className="w-full border border-gray-300 bg-gray-100 rounded-md py-2 px-3 focus:outline-none focus:ring-0 text-gray-700"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Hours
                </label>
                <input
                  type="number"
                  name="holidayHours"
                  value={formData.holidayHours}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Rate (PHP)
                </label>
                <input
                  type="number"
                  name="holidayRate"
                  value={formData.holidayRate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Pay
                </label>
                <input
                  type="text"
                  value={formatCurrency(formData.holidayPay)}
                  className="w-full border border-gray-300 bg-gray-100 rounded-md py-2 px-3 focus:outline-none focus:ring-0 text-gray-700"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Night Diff Hours
                </label>
                <input
                  type="number"
                  name="nightDiffHours"
                  value={formData.nightDiffHours}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Night Diff Rate (PHP)
                </label>
                <input
                  type="number"
                  name="nightDiffRate"
                  value={formData.nightDiffRate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Night Diff Pay
                </label>
                <input
                  type="text"
                  value={formatCurrency(formData.nightDiffPay)}
                  className="w-full border border-gray-300 bg-gray-100 rounded-md py-2 px-3 focus:outline-none focus:ring-0 text-gray-700"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incentives (PHP)
                </label>
                <input
                  type="number"
                  name="incentives"
                  value={formData.incentives}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Deductions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SSS Contribution (PHP)
                </label>
                <input
                  type="number"
                  name="sssDeduction"
                  value={formData.sssDeduction}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PhilHealth (PHP)
                </label>
                <input
                  type="number"
                  name="phicDeduction"
                  value={formData.phicDeduction}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pag-IBIG/HDMF (PHP)
                </label>
                <input
                  type="number"
                  name="hdmfDeduction"
                  value={formData.hdmfDeduction}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Withholding (PHP)
                </label>
                <input
                  type="number"
                  name="taxDeduction"
                  value={formData.taxDeduction}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Deductions (PHP)
                </label>
                <input
                  type="number"
                  name="otherDeductions"
                  value={formData.otherDeductions}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Earnings
                </label>
                <input
                  type="text"
                  value={formatCurrency(formData.totalEarnings)}
                  className="w-full border border-gray-300 bg-gray-100 rounded-md py-2 px-3 focus:outline-none focus:ring-0 text-gray-700 font-medium"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Deductions
                </label>
                <input
                  type="text"
                  value={formatCurrency(formData.totalDeductions)}
                  className="w-full border border-gray-300 bg-gray-100 rounded-md py-2 px-3 focus:outline-none focus:ring-0 text-gray-700 font-medium"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Net Pay
                </label>
                <input
                  type="text"
                  value={formatCurrency(formData.netPay)}
                  className="w-full border border-green-200 bg-green-50 rounded-md py-2 px-3 focus:outline-none focus:ring-0 text-green-700 font-bold"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPublished: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
                Mark as Published (visible to employee)
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate("/ManageEmployeePayroll")}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Update Payroll
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}