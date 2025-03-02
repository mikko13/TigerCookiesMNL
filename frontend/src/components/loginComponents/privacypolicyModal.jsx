import React from "react";

export default function PrivacyPolicyModal({ show, fadeEffect, closeModal }) {
  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center z-50 bg-[rgba(0,0,0,0.5)] transition-opacity duration-300 ${
        fadeEffect ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={closeModal}
    >
      <div
        className={`bg-white p-6 rounded-lg shadow-lg max-w-lg w-full transform transition-transform duration-300 ${
          fadeEffect ? "scale-100" : "scale-90"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Privacy Policy</h3>
        <div className="mt-4 text-sm text-gray-600 max-h-[400px] overflow-auto space-y-3">
          <p>
            <strong>Effective Date:</strong> Mar 10, 2025
          </p>
          <p>
            <strong>1. Introduction: </strong>
            Tiger Cookies MNL Attendance and Payroll System respects your privacy and is committed to protecting
            personal information.
          </p>

          <p>
            <strong>2. Information We Collect:</strong>
          </p>
          <ul className="list-disc pl-5">
            <li><strong>Employee Information:</strong> Name, DOB, gender, address, email, etc.</li>
            <li><strong>Attendance Records:</strong> Check-in/check-out, overtime logs, facial recognition images.</li>
            <li><strong>Administrator Data:</strong> Login credentials, admin privileges.</li>
          </ul>

          <p><strong>3. How We Use Your Information:</strong></p>
          <ul className="list-disc pl-5">
            <li>Attendance tracking.</li>
            <li>Payroll processing.</li>
            <li>System security.</li>
            <li>Legal compliance.</li>
          </ul>

          <p><strong>4. Data Protection:</strong></p>
          <ul className="list-disc pl-5">
            <li>Data stored securely in MongoDB.</li>
            <li>Passwords and sensitive data are encrypted.</li>
          </ul>

          <p><strong>5. Data Sharing:</strong> We do not sell, rent, or share personal data, except:</p>
          <ul className="list-disc pl-5">
            <li>With employee consent.</li>
            <li>For legal requirements.</li>
          </ul>

          <p><strong>6. Employee Rights:</strong> Employees can request access, corrections, or deletion of their data.</p>

          <p><strong>7. Contact Us:</strong></p>
          <ul className="list-disc pl-5">
            <li>Email: tcookiesmnl@gmail.com</li>
            <li>Address: Festival Mall, Filinvest City, Muntinlupa</li>
          </ul>
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={closeModal} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
