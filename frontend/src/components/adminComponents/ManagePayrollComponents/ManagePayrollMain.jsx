import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { backendURL } from "../../../urls/URL";
import PayrollTable from "./PayrollTable";
import PayrollSummaryCards from "./PayrollSummaryCards";

export default function ManagePayrollMain({
  searchTerm,
  filterPeriod,
  filterStatus,
}) {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/payroll`);
        setPayrolls(response.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchPayrolls();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredPayrolls = payrolls.filter((record) => {
    const nameMatches =
      (record.employeeID?.firstName?.toLowerCase() || "").includes(
        (searchTerm || "").toLowerCase()
      ) ||
      (record.employeeID?.lastName?.toLowerCase() || "").includes(
        (searchTerm || "").toLowerCase()
      );

    const periodMatches = !filterPeriod || record.payPeriod === filterPeriod;

    const statusMatches =
      !filterStatus ||
      (filterStatus === "Published" ? record.isPublished : !record.isPublished);

    return nameMatches && periodMatches && statusMatches;
  });

  const clearFilters = () => {
    window.dispatchEvent(new CustomEvent("clearPayrollFilters"));
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${backendURL}/api/payroll/${id}`);
        setPayrolls(payrolls.filter((record) => record._id !== id));
        Swal.fire(
          "Deleted!",
          "Your payroll record has been deleted.",
          "success"
        );
      } catch (error) {
        Swal.fire(
          "Error!",
          "There was an error deleting the payroll record.",
          "error"
        );
      }
    }
  };

  const handlePublish = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to publish this payroll record. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, publish it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`${backendURL}/api/payroll/${id}`, {
          isPublished: true,
        });
        setPayrolls(
          payrolls.map((record) => (record._id === id ? response.data : record))
        );
        Swal.fire(
          "Published!",
          "The payroll record has been published.",
          "success"
        );
      } catch (error) {
        Swal.fire(
          "Error!",
          "There was an error publishing the payroll record.",
          "error"
        );
      }
    }
  };

  const getStatusClass = (isPublished) => {
    return isPublished
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col space-y-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payroll records...</p>
        </div>
      </div>
    );
  }

  // No records found state
  if (filteredPayrolls.length === 0) {
    return (
      <div className="flex flex-col space-y-6">
        <PayrollSummaryCards payrolls={filteredPayrolls} />
        <div className="bg-white rounded-lg shadow-md p-8 text-center flex flex-col items-center">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">
            No Records Found
          </h3>
          <p className="text-gray-600 mt-2">
            {searchTerm || filterPeriod || filterStatus
              ? "No payroll records match your search criteria."
              : "No payroll records available yet."}
          </p>
          {searchTerm || filterPeriod || filterStatus ? (
            <button
              onClick={clearFilters}
              className="mt-4 text-yellow-500 hover:text-yellow-600 font-medium"
            >
              Clear filters
            </button>
          ) : (
            <Link
              to="/CreateEmployeePayroll"
              className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Create First Record
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <PayrollSummaryCards payrolls={filteredPayrolls} />
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <PayrollTable
          filteredPayrolls={filteredPayrolls}
          formatCurrency={formatCurrency}
          getStatusClass={getStatusClass}
          handleDelete={handleDelete}
          handlePublish={handlePublish}
        />
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-sm text-gray-600">
          Showing {filteredPayrolls.length} of {payrolls.length} records
        </div>
      </div>
    </div>
  );
}
