const express = require("express");
const Payroll = require("../models/Payroll");
const Employee = require("../models/Employees");
const router = express.Router();

// Get all payroll records
router.get("/", async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate("employeeID", "firstName lastName salary");
    res.status(200).json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single payroll record by ID
router.get("/:id", async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate("employeeID", "firstName lastName salary");
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });
    res.status(200).json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new payroll record
router.post("/", async (req, res) => {
  try {
    const payroll = new Payroll(req.body);
    const newPayroll = await payroll.save();
    res.status(201).json(newPayroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an existing payroll record
router.put("/:id", async (req, res) => {
  try {
    const updatedPayroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPayroll) return res.status(404).json({ message: "Payroll not found" });
    res.status(200).json(updatedPayroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Patch (Partial Update) a payroll record
router.patch("/:id", async (req, res) => {
  try {
    const updatedPayroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPayroll) return res.status(404).json({ message: "Payroll not found" });
    res.status(200).json(updatedPayroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a payroll record
router.delete("/:id", async (req, res) => {
  try {
    const deletedPayroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!deletedPayroll) return res.status(404).json({ message: "Payroll not found" });
    res.status(200).json({ message: "Payroll deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Publish payroll record
router.patch("/:id/publish", async (req, res) => {
  try {
    const updatedPayroll = await Payroll.findByIdAndUpdate(req.params.id, { isPublished: true }, { new: true });
    if (!updatedPayroll) return res.status(404).json({ message: "Payroll not found" });
    res.status(200).json(updatedPayroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Payroll Calculation API
router.post("/calculate", async (req, res) => {
  try {
    const employees = await Employee.find();

    if (employees.length === 0) {
      return res.status(404).json({ message: "No employees found for payroll calculation." });
    }

    const newPayrolls = employees.map((employee) => {
      const baseSalary = employee.salary || 0;
      const deductions = employee.deductions || 0;
      const overtimePay = (employee.overtimeHours || 0) * (employee.overtimeRate || 0);
      const netSalary = baseSalary + overtimePay - deductions;

      return {
        employeeID: employee._id,
        payPeriod: new Date().toISOString().slice(0, 10),
        baseSalary,
        overtimePay,
        deductions,
        netSalary,
        isPublished: false,
      };
    });

    await Payroll.insertMany(newPayrolls);
    res.status(200).json({ message: "Payroll calculated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Payroll calculation failed." });
  }
});

module.exports = router;
