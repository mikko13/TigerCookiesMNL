const express = require("express");
const router = express.Router();
const Payroll = require("../models/Payroll");

router.get("/", async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate(
      "employeeID",
      "firstName lastName"
    );
    res.status(200).json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate(
      "employeeID",
      "firstName lastName"
    );
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });
    res.status(200).json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new payroll
router.post("/", async (req, res) => {
  const payroll = new Payroll(req.body);
  try {
    const newPayroll = await payroll.save();
    res.status(201).json(newPayroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payroll
router.patch("/:id", async (req, res) => {
  try {
    const updatedPayroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPayroll)
      return res.status(404).json({ message: "Payroll not found" });
    res.status(200).json(updatedPayroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete payroll
router.delete("/:id", async (req, res) => {
  try {
    const deletedPayroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!deletedPayroll)
      return res.status(404).json({ message: "Payroll not found" });
    res.status(200).json({ message: "Payroll deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
