import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Download } from "lucide-react";

const generatePayslipPDF = (record) => {
  // Create PDF with portrait orientation to optimize vertical space
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set all elements to black/white color scheme
  doc.setTextColor(0, 0, 0);

  // Header - more compact
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Tiger Cookies MNL", 105, 15, { align: "center" });
  doc.setFontSize(9);
  doc.text(`Pay Period: ${record.payPeriod}`, 105, 20, { align: "center" });

  // Simple divider
  doc.setLineWidth(0.3);
  doc.line(15, 22, 195, 22);

  // Employee Information - more compact
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Employee Information", 15, 28);

  // Get employee details with safer access
  let employeeID = "N/A";
  let firstName = "";
  let lastName = "";

  if (record.employeeID) {
    if (typeof record.employeeID === "object") {
      // Try different possible property paths
      employeeID =
        record.employeeID.employeeID ||
        (record.employeeID._doc && record.employeeID._doc.employeeID) ||
        "N/A";

      firstName =
        record.employeeID.firstName ||
        (record.employeeID._doc && record.employeeID._doc.firstName) ||
        "";

      lastName =
        record.employeeID.lastName ||
        (record.employeeID._doc && record.employeeID._doc.lastName) ||
        "";
    }
  }

  const employeeName =
    firstName && lastName ? `${firstName} ${lastName}` : "N/A";

  // Display employee info in a single row to save space
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `ID: ${employeeID} | Name: ${employeeName} | Date: ${new Date().toLocaleDateString()}`,
    15,
    32
  );

  const formatCurrency = (amount) => {
    return `P ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  // Side-by-side tables for earnings and deductions
  const leftColumn = 15;
  const rightColumn = 105;
  const tableY = 38;
  const tableWidth = 85;

  // Earnings Section
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Earnings", leftColumn, tableY - 3);

  const earningsData = [
    ["Description", "Amount"],
    ["Base Salary", formatCurrency(record.baseSalary)],
    ["Overtime Pay", formatCurrency(record.overtimePay)],
    ["Holiday Pay", formatCurrency(record.holidayPay)],
    ["Night Diff", formatCurrency(record.nightDiffPay)],
    ["Hours", `${record.regularHours} hrs`],
    ["Hourly Rate", formatCurrency(record.hourlyRate)],
  ];

  try {
    doc.autoTable({
      startY: tableY,
      head: [earningsData[0]],
      body: earningsData.slice(1),
      theme: "plain",
      headStyles: {
        fontStyle: "bold",
        fillColor: false,
        textColor: 0,
        lineWidth: 0.1,
        lineColor: [220, 220, 220],
      },
      styles: {
        fontSize: 8,
        lineColor: [240, 240, 240],
        lineWidth: 0.1,
        cellPadding: 1, // Reduced padding
      },
      margin: { left: leftColumn },
      tableWidth: tableWidth,
    });
  } catch (e) {
    try {
      const { autoTable } = require("jspdf-autotable");
      autoTable(doc, {
        startY: tableY,
        head: [earningsData[0]],
        body: earningsData.slice(1),
        theme: "plain",
        headStyles: {
          fontStyle: "bold",
          fillColor: false,
          textColor: 0,
          lineWidth: 0.1,
          lineColor: [220, 220, 220],
        },
        styles: {
          fontSize: 8,
          lineColor: [240, 240, 240],
          lineWidth: 0.1,
          cellPadding: 1,
        },
        margin: { left: leftColumn },
        tableWidth: tableWidth,
      });
    } catch (e2) {
      // Fallback handling
    }
  }

  // Deductions Section
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Deductions", rightColumn, tableY - 3);

  const deductionsData = [
    ["Description", "Amount"],
    ["SSS", formatCurrency(record.sssDeduction)],
    ["PhilHealth", formatCurrency(record.philhealthDeduction)],
    ["Pag-IBIG", formatCurrency(record.pagibigDeduction)],
    ["W/H Tax", formatCurrency(record.withholdingTax)],
    ["Other", formatCurrency(record.otherDeductions)],
    ["Total Deductions", formatCurrency(record.totalDeductions)],
  ];

  try {
    doc.autoTable({
      startY: tableY,
      head: [deductionsData[0]],
      body: deductionsData.slice(1),
      theme: "plain",
      headStyles: {
        fontStyle: "bold",
        fillColor: false,
        textColor: 0,
        lineWidth: 0.1,
        lineColor: [220, 220, 220],
      },
      styles: {
        fontSize: 8,
        lineColor: [240, 240, 240],
        lineWidth: 0.1,
        cellPadding: 1, // Reduced padding
      },
      margin: { left: rightColumn },
      tableWidth: tableWidth,
    });
  } catch (e) {
    try {
      const { autoTable } = require("jspdf-autotable");
      autoTable(doc, {
        startY: tableY,
        head: [deductionsData[0]],
        body: deductionsData.slice(1),
        theme: "plain",
        headStyles: {
          fontStyle: "bold",
          fillColor: false,
          textColor: 0,
          lineWidth: 0.1,
          lineColor: [220, 220, 220],
        },
        styles: {
          fontSize: 8,
          lineColor: [240, 240, 240],
          lineWidth: 0.1,
          cellPadding: 1,
        },
        margin: { left: rightColumn },
        tableWidth: tableWidth,
      });
    } catch (e2) {
      // Fallback handling
    }
  }

  // Summary at the bottom
  const finalY = Math.max(
    doc.lastAutoTable?.finalY || 100,
    doc.lastAutoTable?.finalY || 100
  );

  // Summary box
  doc.setLineWidth(0.5);
  doc.rect(rightColumn, finalY + 3, tableWidth, 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Total Earnings: ${formatCurrency(record.totalEarnings)}`,
    rightColumn + 2,
    finalY + 7
  );
  doc.text(
    `Total Deductions: ${formatCurrency(record.totalDeductions)}`,
    rightColumn + 2,
    finalY + 11
  );

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(
    `NET PAY: ${formatCurrency(record.netPay)}`,
    rightColumn + 2,
    finalY + 15
  );

  doc.save(`Payslip-${record.payPeriod}.pdf`);
};

const PayslipDownloadButton = ({ record, isMobile }) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        generatePayslipPDF(record);
      }}
      className={
        isMobile
          ? "inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-1 px-3 rounded-md"
          : "text-gray-600 hover:text-gray-800 transition-colors flex items-center"
      }
      title="Download Payslip"
    >
      <Download size={isMobile ? 14 : 18} className="mr-1" />
      <span>{isMobile ? "Download Payslip" : "Payslip"}</span>
    </button>
  );
};

export { PayslipDownloadButton, generatePayslipPDF };
