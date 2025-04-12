/* eslint-disable no-restricted-globals */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PhilippinePeso,
  Calendar,
  User,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
  CreditCard,
  Calculator,
  Clock,
  PieChart,
} from "lucide-react";
import { backendURL } from "../../../urls/URL";

export default function CreatePayrollForm() {
  const [formData, setFormData] = useState({
    employeeID: "",
    payPeriod: "",
    regularHours: "",
    hourlyRate: "",
    baseSalary: "",
    holidayPay: "",
    overtimePay: "",
    nightDiffPay: "",
    incentives: "",
    thirteenthMonthPay: "",
    sssDeduction: "",
    philhealthDeduction: "",
    pagibigDeduction: "",
    withholdingTax: "",
    otherDeductions: "",
  });

  const [calculations, setCalculations] = useState({
    totalEarnings: 0,
    totalDeductions: 0,
    netPay: 0,
    taxableIncome: 0,
  });

  const [employees, setEmployees] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [payPeriods, setPayPeriods] = useState([]);
  const [employeesData, setEmployeesData] = useState({});

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/employees`);
        const activeEmployees = response.data.filter(
          (employee) => employee.isActive !== 0
        );
        setEmployees(activeEmployees);
        const employeesLookup = {};
        activeEmployees.forEach((employee) => {
          employeesLookup[employee._id] = employee;
        });
        setEmployeesData(employeesLookup);
      } catch (error) {
        showToast("error", "Failed to load employees data.");
      }
    };

    const getFilteredPeriods = () => {
      const today = new Date();
      const year = today.getFullYear();
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const periods = [];
      for (let i = 0; i < 12; i++) {
        const monthIndex = today.getMonth() - i;
        const adjustedMonth = monthIndex < 0 ? 12 + monthIndex : monthIndex;
        const adjustedYear = monthIndex < 0 ? year - 1 : year;

        const firstPeriodStart = `${monthNames[adjustedMonth]} 5, ${adjustedYear}`;
        const firstPeriodEnd = `${monthNames[adjustedMonth]} 20, ${adjustedYear}`;
        periods.push(`${firstPeriodStart} - ${firstPeriodEnd}`);

        const secondPeriodStart = `${monthNames[adjustedMonth]} 20, ${adjustedYear}`;
        const nextMonthIndex = (adjustedMonth + 1) % 12;
        const nextMonthYear =
          nextMonthIndex === 0 ? adjustedYear + 1 : adjustedYear;
        const secondPeriodEnd = `${monthNames[nextMonthIndex]} 5, ${nextMonthYear}`;
        periods.push(`${secondPeriodStart} - ${secondPeriodEnd}`);
      }

      return periods;
    };
    fetchEmployees();
    setPayPeriods(getFilteredPeriods());
  }, []);

  useEffect(() => {
    if (formData.regularHours && formData.hourlyRate) {
      const hours = parseFloat(formData.regularHours || 0);
      const rate = parseFloat(formData.hourlyRate || 0);
      const calculatedBaseSalary = (hours * rate).toFixed(2);

      setFormData((prev) => ({
        ...prev,
        baseSalary: calculatedBaseSalary,
      }));
    }
  }, [formData.regularHours, formData.hourlyRate]);

  // Calculate SSS contributions based on the latest SSS contribution table (2024)
  const calculateSSS = (monthlyIncome) => {
    // Converting semi-monthly income to monthly
    const monthly = monthlyIncome * 2;
    
    // 2023-2024 SSS Contribution Table
    if (monthly <= 4000) return 180;
    if (monthly <= 4750) return 202.50;
    if (monthly <= 5250) return 225;
    if (monthly <= 5750) return 247.50;
    if (monthly <= 6250) return 270;
    if (monthly <= 6750) return 292.50;
    if (monthly <= 7250) return 315;
    if (monthly <= 7750) return 337.50;
    if (monthly <= 8250) return 360;
    if (monthly <= 8750) return 382.50;
    if (monthly <= 9250) return 405;
    if (monthly <= 9750) return 427.50;
    if (monthly <= 10250) return 450;
    if (monthly <= 10750) return 472.50;
    if (monthly <= 11250) return 495;
    if (monthly <= 11750) return 517.50;
    if (monthly <= 12250) return 540;
    if (monthly <= 12750) return 562.50;
    if (monthly <= 13250) return 585;
    if (monthly <= 13750) return 607.50;
    if (monthly <= 14250) return 630;
    if (monthly <= 14750) return 652.50;
    if (monthly <= 15250) return 675;
    if (monthly <= 15750) return 697.50;
    if (monthly <= 16250) return 720;
    if (monthly <= 16750) return 742.50;
    if (monthly <= 17250) return 765;
    if (monthly <= 17750) return 787.50;
    if (monthly <= 18250) return 810;
    if (monthly <= 18750) return 832.50;
    if (monthly <= 19250) return 855;
    if (monthly <= 19750) return 877.50;
    if (monthly <= 20250) return 900;
    if (monthly <= 20750) return 922.50;
    if (monthly <= 21250) return 945;
    if (monthly <= 21750) return 967.50;
    if (monthly <= 22250) return 990;
    if (monthly <= 22750) return 1012.50;
    if (monthly <= 23250) return 1035;
    if (monthly <= 23750) return 1057.50;
    if (monthly <= 24250) return 1080;
    if (monthly <= 24750) return 1102.50;
    return 1125;
  };

  // Calculate PhilHealth contributions (2024 rates)
  const calculatePhilHealth = (monthlyIncome) => {
    // Converting semi-monthly income to monthly
    const monthly = monthlyIncome * 2;
    
    // PhilHealth premium is 4% of monthly income
    // Employee pays 2%, employer pays 2%
    const rate = 0.02; // 2% employee share
    
    if (monthly <= 10000) {
      // Minimum contribution
      return 200 / 2; // 200 PHP monthly, half for semi-monthly
    } else if (monthly >= 90000) {
      // Maximum contribution (cap at 90,000)
      return 1800 / 2; // 1800 PHP monthly, half for semi-monthly
    } else {
      // Regular computation: 2% of monthly income, divided by 2 for semi-monthly
      return (monthly * rate) / 2;
    }
  };

  // Calculate Pag-IBIG contributions (2024 rates)
  const calculatePagibig = (monthlyIncome) => {
    // Converting semi-monthly income to monthly
    const monthly = monthlyIncome * 2;
    
    // Employee contribution is 2% for monthly compensation up to 5,000
    // and 3% for those earning more than 5,000
    if (monthly <= 5000) {
      return (monthly * 0.02) / 2; // 2% contribution, divided by 2 for semi-monthly
    } else {
      return 100 / 2; // Maximum 100 PHP monthly, half for semi-monthly
    }
  };

  // Calculate withholding tax based on BIR's withholding tax table (2023-2024)
  const calculateWithholdingTax = (monthlyIncome) => {
    // Calculate taxable income: gross income minus contributions
    const sss = calculateSSS(monthlyIncome);
    const philhealth = calculatePhilHealth(monthlyIncome);
    const pagibig = calculatePagibig(monthlyIncome);
    
    // Total semi-monthly deductions
    const totalContributions = sss + philhealth + pagibig;
    
    // Taxable income = Monthly Income * 2 - total contributions * 2
    // Then converted back to semi-monthly
    const monthlyTaxableIncome = (monthlyIncome * 2) - (totalContributions * 2);
    const semiMonthlyTaxableIncome = monthlyTaxableIncome / 2;
    
    // Store taxable income for reference
    setCalculations(prev => ({
      ...prev,
      taxableIncome: semiMonthlyTaxableIncome
    }));
    
    // 2023-2024 Semi-monthly Withholding Tax Table
    if (semiMonthlyTaxableIncome <= 10417) {
      return 0; // Non-taxable
    } else if (semiMonthlyTaxableIncome <= 16667) {
      return ((semiMonthlyTaxableIncome - 10417) * 0.15);
    } else if (semiMonthlyTaxableIncome <= 33333) {
      return ((semiMonthlyTaxableIncome - 16667) * 0.20) + 937.50;
    } else if (semiMonthlyTaxableIncome <= 83333) {
      return ((semiMonthlyTaxableIncome - 33333) * 0.25) + 4270.83;
    } else if (semiMonthlyTaxableIncome <= 333333) {
      return ((semiMonthlyTaxableIncome - 83333) * 0.30) + 16770.83;
    } else {
      return ((semiMonthlyTaxableIncome - 333333) * 0.35) + 91770.83;
    }
  };

  // Auto-calculate all deductions whenever income changes
  const calculateAllDeductions = () => {
    const totalEarnings =
      parseFloat(formData.baseSalary || 0) +
      parseFloat(formData.holidayPay ||
      0) +
      parseFloat(formData.overtimePay || 0) +
      parseFloat(formData.nightDiffPay || 0) +
      parseFloat(formData.incentives || 0);
    
    // 13th month pay is tax-exempt, so we exclude it from tax calculations
    const taxableEarnings = totalEarnings;
    
    // Calculate mandatory contributions
    const sss = calculateSSS(taxableEarnings);
    const philhealth = calculatePhilHealth(taxableEarnings);
    const pagibig = calculatePagibig(taxableEarnings);
    const tax = calculateWithholdingTax(taxableEarnings);
    
    // Round to 2 decimal places
    const roundedSSS = Math.round(sss * 100) / 100;
    const roundedPhilHealth = Math.round(philhealth * 100) / 100;
    const roundedPagibig = Math.round(pagibig * 100) / 100;
    const roundedTax = Math.round(tax * 100) / 100;
    
    // Update form data with calculated deductions
    setFormData(prev => ({
      ...prev,
      sssDeduction: roundedSSS.toFixed(2),
      philhealthDeduction: roundedPhilHealth.toFixed(2),
      pagibigDeduction: roundedPagibig.toFixed(2),
      withholdingTax: roundedTax.toFixed(2)
    }));
  };

  useEffect(() => {
    // Calculate all deductions whenever earnings change
    const hasIncome = parseFloat(formData.baseSalary || 0) > 0;
    if (hasIncome) {
      calculateAllDeductions();
    }
  }, [
    formData.baseSalary,
    formData.holidayPay,
    formData.overtimePay,
    formData.nightDiffPay,
    formData.incentives
  ]);

  useEffect(() => {
    const earnings =
      parseFloat(formData.baseSalary || 0) +
      parseFloat(formData.holidayPay || 0) +
      parseFloat(formData.overtimePay || 0) +
      parseFloat(formData.nightDiffPay || 0) +
      parseFloat(formData.incentives || 0) +
      parseFloat(formData.thirteenthMonthPay || 0);

    const deductions =
      parseFloat(formData.sssDeduction || 0) +
      parseFloat(formData.philhealthDeduction || 0) +
      parseFloat(formData.pagibigDeduction || 0) +
      parseFloat(formData.withholdingTax || 0) +
      parseFloat(formData.otherDeductions || 0);

    const netPay = earnings - deductions;

    setCalculations(prev => ({
      ...prev,
      totalEarnings: earnings,
      totalDeductions: deductions,
      netPay: netPay,
    }));
  }, [formData]);

  async function fetchAndCalculateHours(employeeID, payPeriodDate) {
    if (!employeeID || !payPeriodDate) return;

    try {
      const [startDateStr, endDateStr] = payPeriodDate.split(" - ");
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      const formatDateForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      const attendanceResponse = await axios.get(
        `${backendURL}/api/attendance`,
        {
          params: {
            employeeID,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          },
        }
      );

      const employee = employeesData[employeeID];
      if (!employee) {
        console.error("Employee not found");
        return;
      }

      const hourlyRate = employee.ratePerHour || 0;
      const overtimeRate = employee.overtimeRate || hourlyRate * 1.25; // Default to 1.25x if not specified

      let totalRegularHours = 0;
      let totalOvertimeHours = 0;

      if (attendanceResponse.data && attendanceResponse.data.length > 0) {
        attendanceResponse.data.forEach((record) => {
          // Calculate regular hours
          totalRegularHours += record.totalHours || 0;

          // Calculate overtime hours
          if (record.startOT && record.endOT) {
            const start = new Date(`2000-01-01T${record.startOT}`);
            const end = new Date(`2000-01-01T${record.endOT}`);
            let diff = (end - start) / (1000 * 60 * 60); // Convert to hours
            if (diff < 0) diff += 24; // Handle overnight overtime
            totalOvertimeHours += Math.round(diff * 100) / 100; // Round to 2 decimal places
          }
        });
      }

      const calculatedBaseSalary = (totalRegularHours * hourlyRate).toFixed(2);
      const calculatedOvertimePay = (totalOvertimeHours * overtimeRate).toFixed(
        2
      );

      setFormData((prev) => ({
        ...prev,
        regularHours: totalRegularHours.toString(),
        hourlyRate: hourlyRate.toString(),
        baseSalary: calculatedBaseSalary,
        overtimePay: calculatedOvertimePay,
      }));

      if (formErrors.regularHours) {
        setFormErrors({ ...formErrors, regularHours: null });
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      showToast("error", "Failed to calculate hours and overtime.");
    }
  }

  const handleEmployeeChange = (e) => {
    const selectedEmployeeId = e.target.value;

    setFormData((prevData) => ({
      ...prevData,
      employeeID: selectedEmployeeId,
    }));

    if (formErrors.employeeID) {
      setFormErrors({ ...formErrors, employeeID: null });
    }

    if (selectedEmployeeId && employeesData[selectedEmployeeId]) {
      const employee = employeesData[selectedEmployeeId];

      if (employee.ratePerHour) {
        setFormData((prevData) => ({
          ...prevData,
          hourlyRate: employee.ratePerHour.toString(),
        }));

        if (formErrors.hourlyRate) {
          setFormErrors({ ...formErrors, hourlyRate: null });
        }
      }

      if (formData.payPeriod) {
        fetchAndCalculateHours(selectedEmployeeId, formData.payPeriod);
      }
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }

    if (name === "payPeriod" && formData.employeeID) {
      fetchAndCalculateHours(formData.employeeID, value);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.employeeID) errors.employeeID = "Employee is required";
    if (!formData.payPeriod) errors.payPeriod = "Pay period is required";
    if (!formData.regularHours)
      errors.regularHours = "Regular hours are required";
    if (!formData.hourlyRate) errors.hourlyRate = "Hourly rate is required";
    if (!formData.baseSalary) errors.baseSalary = "Base salary is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("error", "Please fill all required fields.");
      return;
    }

    setLoading(true);
    const payrollData = {
      ...formData,
      regularHours: parseFloat(formData.regularHours),
      hourlyRate: parseFloat(formData.hourlyRate),
      baseSalary: parseFloat(formData.baseSalary),
      holidayPay: parseFloat(formData.holidayPay || 0),
      overtimePay: parseFloat(formData.overtimePay || 0),
      nightDiffPay: parseFloat(formData.nightDiffPay || 0),
      incentives: parseFloat(formData.incentives || 0),
      thirteenthMonthPay: parseFloat(formData.thirteenthMonthPay || 0),
      sssDeduction: parseFloat(formData.sssDeduction || 0),
      philhealthDeduction: parseFloat(formData.philhealthDeduction || 0),
      pagibigDeduction: parseFloat(formData.pagibigDeduction || 0),
      withholdingTax: parseFloat(formData.withholdingTax || 0),
      otherDeductions: parseFloat(formData.otherDeductions || 0),
      totalEarnings: calculations.totalEarnings,
      totalDeductions: calculations.totalDeductions,
      netPay: calculations.netPay,
      isPublished: false,
    };

    try {
      await axios.post(`${backendURL}/api/payroll`, payrollData);
      showToast("success", "Payroll record created successfully!");
      resetForm();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to create payroll record."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeID: "",
      payPeriod: "",
      regularHours: "",
      hourlyRate: "",
      baseSalary: "",
      holidayPay: "",
      overtimePay: "",
      nightDiffPay: "",
      incentives: "",
      thirteenthMonthPay: "",
      sssDeduction: "",
      philhealthDeduction: "",
      pagibigDeduction: "",
      withholdingTax: "",
      otherDeductions: "",
    });
    setFormErrors({});
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Manual recalculation feature
  const recalculateDeductions = () => {
    calculateAllDeductions();
    showToast("success", "Tax deductions recalculated!");
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <PhilippinePeso className="mr-2" size={24} />
          Create Employee Payroll
        </h2>
        <p className="text-yellow-50 mt-1 opacity-90">
          Generate a new payroll record with automatic tax calculations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="employeeID"
                value={formData.employeeID}
                onChange={handleEmployeeChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formErrors.employeeID
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all appearance-none`}
              >
                <option value="" disabled>
                  Select Employee
                </option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              {formErrors.employeeID && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {formErrors.employeeID}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pay Period <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="payPeriod"
                value={formData.payPeriod}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formErrors.payPeriod
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all appearance-none`}
              >
                <option value="" disabled>
                  Select Pay Period
                </option>
                {payPeriods.map((period, index) => (
                  <option key={index} value={period}>
                    {period}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              {formErrors.payPeriod && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {formErrors.payPeriod}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <Clock className="mr-2" size={20} />
            Time & Rate
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regular Hours <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="regularHours"
                  value={formData.regularHours}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formErrors.regularHours
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all`}
                />
                {formErrors.regularHours && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {formErrors.regularHours}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₱</span>
                </div>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                    formErrors.hourlyRate
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all`}
                />
                {formErrors.hourlyRate && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {formErrors.hourlyRate}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <CreditCard className="mr-2" size={20} />
            Earnings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Salary <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₱</span>
                </div>
                <input
                  type="number"
                  name="baseSalary"
                  value={formData.baseSalary}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                    formErrors.baseSalary
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-100"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all bg-gray-100`}
                  readOnly
                />
                {formErrors.baseSalary && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {formErrors.baseSalary}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Calculated from hours × rate
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holiday Pay
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₱</span>
                </div>
                <input
                  type="number"
                  name="holidayPay"
                  value={formData.holidayPay}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime Pay
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₱</span>
                </div>
                <input
                  type="number"
                  name="overtimePay"
                  value={formData.overtimePay}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Night Differential
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₱</span>
                </div>
                <input
                  type="number"
                  name="nightDiffPay"
                  value={formData.nightDiffPay}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incentives/Bonus
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₱</span>
                </div>
                <input
                  type="number"
                  name="incentives"
                  value={formData.incentives}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                13th Month Pay
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₱</span>
                </div>
                <input
                  type="number"
                  name="thirteenthMonthPay"
                  value={formData.thirteenthMonthPay}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <Calculator className="mr-2" size={20} />
            Deductions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SSS Contribution
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₱</span>
                </div>
                <input
                  type="number"
                  name="sssDeduction"
                  value={formData.sssDeduction}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PhilHealth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₱</span>
                </div>
                <input
                  type="number"
                  name="philhealthDeduction"
                  value={formData.philhealthDeduction}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pag-IBIG
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₱</span>
                </div>
                <input
                  type="number"
                  name="pagibigDeduction"
                  value={formData.pagibigDeduction}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Withholding Tax
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₱</span>
                </div>
                <input
                  type="number"
                  name="withholdingTax"
                  value={formData.withholdingTax}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Deductions
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₱</span>
                </div>
                <input
                  type="number"
                  name="otherDeductions"
                  value={formData.otherDeductions}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <PieChart className="mr-2" size={20} />
            Payroll Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700">Total Earnings</p>
              <p className="text-xl font-bold text-blue-800">
                {formatCurrency(calculations.totalEarnings)}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-sm text-red-700">Total Deductions</p>
              <p className="text-xl font-bold text-red-800">
                {formatCurrency(calculations.totalDeductions)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-green-700">Net Pay</p>
              <p className="text-xl font-bold text-green-800">
                {formatCurrency(calculations.netPay)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2.5 text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 text-sm font-medium bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all flex items-center ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create
              </>
            )}
          </button>
        </div>
      </form>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center ${
            toast.type === "success"
              ? "bg-green-100 text-green-800 border-l-4 border-green-500"
              : "bg-red-100 text-red-800 border-l-4 border-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertTriangle className="w-5 h-5 mr-2" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
