import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Download } from "lucide-react";

const generatePayslipPDF = (record) => {
  const doc = new jsPDF();

  doc.setFillColor(40, 96, 144);
  doc.rect(0, 0, 210, 40, "F");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("EMPLOYEE PAYSLIP", 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Pay Period: ${record.payPeriod}`, 105, 30, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Employee Information", 14, 50);

  doc.setFont("helvetica", "normal");
  const employeeName =
    typeof record.employeeID === "object"
      ? `${record.employeeID.firstName} ${record.employeeID.lastName}`
      : "N/A";

  doc.setFontSize(10);
  doc.text(`Name: ${employeeName}`, 14, 60);
  doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 14, 70);

  const formatCurrency = (amount) => {
    return `P ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Earnings", 14, 85);

  const earningsData = [
    ["Description", "Amount"],
    ["Base Salary", formatCurrency(record.baseSalary)],
    ["Overtime Pay", formatCurrency(record.overtimePay)],
    ["Holiday Pay", formatCurrency(record.holidayPay)],
    ["Night Differential", formatCurrency(record.nightDiffPay)],
    ["Total Hours", `${record.regularHours} hrs`],
    ["Hourly Rate", formatCurrency(record.hourlyRate)],
  ];

  let finalY = 0;
  try {
    doc.autoTable({
      startY: 90,
      head: [earningsData[0]],
      body: earningsData.slice(1),
      theme: "striped",
      headStyles: { fillColor: [60, 130, 190], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
    });
    finalY = doc.lastAutoTable.finalY;
  } catch (e) {

    try {
      const { autoTable } = require("jspdf-autotable");
      autoTable(doc, {
        startY: 90,
        head: [earningsData[0]],
        body: earningsData.slice(1),
        theme: "striped",
        headStyles: { fillColor: [60, 130, 190], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
      });
      finalY = doc.lastAutoTable.finalY;
    } catch (e2) {
      finalY = 140;
    }
  }

  const deductionsStartY = finalY + 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Deductions", 14, deductionsStartY);

  const deductionsData = [
    ["Description", "Amount"],
    ["Tax", formatCurrency(record.totalDeductions * 0.6)],
    ["Insurance", formatCurrency(record.totalDeductions * 0.3)],
    ["Other", formatCurrency(record.totalDeductions * 0.1)],
    ["Total Deductions", formatCurrency(record.totalDeductions)],
  ];

  let deductionsFinalY = 0;
  try {
    doc.autoTable({
      startY: deductionsStartY + 5,
      head: [deductionsData[0]],
      body: deductionsData.slice(1),
      theme: "striped",
      headStyles: { fillColor: [60, 130, 190], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
    });
    deductionsFinalY = doc.lastAutoTable.finalY;
  } catch (e) {
    try {
      const { autoTable } = require("jspdf-autotable");
      autoTable(doc, {
        startY: deductionsStartY + 5,
        head: [deductionsData[0]],
        body: deductionsData.slice(1),
        theme: "striped",
        headStyles: { fillColor: [60, 130, 190], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
      });
      deductionsFinalY = doc.lastAutoTable.finalY;
    } catch (e2) {
      deductionsFinalY = deductionsStartY + 40; 
    }
  }

  const summaryStartY = deductionsFinalY + 15;
  doc.setFillColor(240, 240, 240);
  doc.rect(105, summaryStartY, 90, 25, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 150, summaryStartY + 10, { align: "center" });

  doc.setFontSize(10);
  doc.text(
    `Total Earnings: ${formatCurrency(record.totalEarnings)}`,
    110,
    summaryStartY + 18
  );
  doc.text(
    `Total Deductions: ${formatCurrency(record.totalDeductions)}`,
    110,
    summaryStartY + 23
  );

  doc.setFontSize(12);
  doc.setTextColor(0, 128, 0);
  doc.setFont("helvetica", "bold");
  doc.text(
    `NET PAY: ${formatCurrency(record.netPay)}`,
    150,
    summaryStartY + 30,
    { align: "center" }
  );

  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This is an electronically generated payslip and does not require signature.",
    105,
    280,
    { align: "center" }
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
          ? "inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded-md"
          : "text-blue-600 hover:text-blue-800 transition-colors flex items-center"
      }
      title="Download Payslip"
    >
      <Download size={isMobile ? 14 : 18} className="mr-1" />
      <span>{isMobile ? "Download Payslip" : "Payslip"}</span>
    </button>
  );
};

export { PayslipDownloadButton, generatePayslipPDF };
