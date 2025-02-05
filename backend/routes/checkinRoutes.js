const express = require("express");
const router = express.Router();
const Checkin = require("../models/Checkin");

// === Create a new check-in record ===
router.post("/", async (req, res) => {
  const { inFace, checkinTime, checkinDate } = req.body;

  if (!inFace) {
    return res.status(400).json({ message: "Face ID is required." });
  }

  try {
    const newCheckin = new Checkin({ inFace, checkinTime, checkinDate });
    const savedCheckin = await newCheckin.save();
    res.status(201).json(savedCheckin);
  } catch (err) {
    res.status(400).json({ message: "Error saving check-in: " + err.message });
  }
});

module.exports = router;
