export default function PayrollDetailsModal({ payroll, onClose }) {
    if (!payroll) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h3 className="text-xl font-semibold mb-4">Payroll Details</h3>
          <p><strong>Employee:</strong> {payroll.employeeName}</p>
          <p><strong>Employee ID:</strong> {payroll.employeeId}</p>
          <p><strong>Pay Period:</strong> {payroll.payPeriod}</p>
          <p><strong>Hours Worked:</strong> {payroll.hoursWorked} hrs</p>
          <p><strong>Hourly Rate:</strong> ₱{payroll.hourlyRate?.toFixed(2)}</p>
          <p><strong>Overtime Hours:</strong> {payroll.overtimeHours || 0} hrs</p>
          <p><strong>Overtime Pay:</strong> ₱{payroll.overtimePay?.toFixed(2)}</p>
          <p><strong>Total Salary:</strong> ₱{payroll.salary.toFixed(2)}</p>
  
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
  