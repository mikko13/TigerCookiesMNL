const express = require("express");
const router = express.Router();
const Overtime = require("../models/Overtime");

router.post("/", async (req, res) => {
  const overtimeRequest = new Overtime(req.body); 

  try {
    const newOvertime = await overtimeRequest.save(); 
    res.status(201).json(newOvertime); 
  } catch (error) {
    res.status(400).json({ message: error.message }); 
  }
});

module.exports = router;
