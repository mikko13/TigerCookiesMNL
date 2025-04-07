const cron = require("node-cron");
const Attendance = require("../models/Attendance");
const Overtime = require("../models/Overtime");
const moment = require("moment-timezone");

// Function to update attendance with the auto-checkout time
const updateAttendanceOnAutoCheckout = async (attendanceID, checkoutTime) => {
  try {
    // Find the attendance record and update it with the auto-checkout time
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      attendanceID,
      {
        $set: {
          checkOutTime: checkoutTime, // Save the actual checkout time
          sessionExpired: true, // Mark the session as expired
        },
      },
      { new: true } // Return the updated attendance document
    );
    console.log(
      `Attendance auto-checked out for employee: ${updatedAttendance.employeeID} at ${checkoutTime}`
    );
  } catch (error) {
    console.error("Error updating attendance on auto checkout:", error);
  }
};

const autoCheckoutIfNoOT = async () => {
  try {
    const today = moment().tz("Asia/Manila").format("MM/DD/YYYY");
    const currentTime = moment().tz("Asia/Manila");

    const attendances = await Attendance.find({
      attendanceDate: today,
      checkOutTime: { $exists: false },
    });

    for (const attendance of attendances) {
      const { _id, employeeID, shift } = attendance;

      // Check for approved OT
      const approvedOT = await Overtime.findOne({
        employeeID,
        dateRequested: today,
        status: "approved",
      });

      if (approvedOT) {
        console.log(
          `Skipping auto-checkout for ${employeeID}, has approved OT.`
        );
        continue; // skip auto-checkout if OT exists
      }

      const shiftCutoff =
        shift === "Morning"
          ? moment.tz("18:01", "HH:mm", "Asia/Manila")
          : moment.tz("22:01", "HH:mm", "Asia/Manila");

      if (currentTime.isAfter(shiftCutoff)) {
        attendance.checkOutTime = shift === "Morning" ? "18:01" : "22:01";
        attendance.attendanceStatus = "Auto Checked Out";

        const checkIn = moment(attendance.checkInTime, "HH:mm");
        const checkOut = moment(attendance.checkOutTime, "HH:mm");
        const totalHours = moment.duration(checkOut.diff(checkIn)).asHours();

        attendance.totalHours = parseFloat(totalHours.toFixed(2));
        await attendance.save();

        // Call the function to mark attendance as "Expired"
        await updateAttendanceOnAutoCheckout(_id, attendance.checkOutTime);

        console.log(`Auto-checked out: ${employeeID}`);
      }
    }
  } catch (error) {
    console.error("Auto-checkout job failed:", error);
  }
};

const autoCheckoutOT = async () => {
  const now = moment().tz("Asia/Manila");
  const currentDate = now.format("MM/DD/YYYY");
  const currentTime = now;

  // Get approved OTs for today
  const approvedOTs = await Overtime.find({
    dateRequested: currentDate,
    status: "Approved",
  });

  for (const ot of approvedOTs) {
    const employeeID = ot.employeeID;
    const hours = ot.overtimeTime;
    const expectedOTEnd = moment(ot.reviewedAt)
      .add(hours, "hours")
      .add(5, "minutes");

    // Skip if it's not time yet
    if (currentTime.isBefore(expectedOTEnd)) continue;

    // Check if already checked out
    const attendance = await Attendance.findOne({
      employeeID,
      attendanceDate: currentDate,
      checkOutTime: null, // still not checked out
    });

    if (attendance) {
      // Set checkOutTime and update totalHours
      const checkInTime = moment(attendance.checkInTime, "hh:mm A");
      const duration = moment.duration(currentTime.diff(checkInTime));
      const totalHours = parseFloat(duration.asHours().toFixed(2));

      attendance.checkOutTime = currentTime.format("hh:mm A");
      attendance.totalHours = totalHours;
      attendance.attendanceStatus = "Checked Out (OT Auto)";

      await attendance.save();

      // Call the function to mark attendance as "Expired"
      await updateAttendanceOnAutoCheckout(
        attendance._id,
        attendance.checkOutTime
      );

      console.log(`Auto OT checkout done for Employee ${employeeID}`);
    }
  }
};

// Run both auto-checkout functions every () minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("Running auto-checkout job...");

  // First, check for normal checkouts
  await autoCheckoutIfNoOT();

  // Then, handle overtime checkouts
  await autoCheckoutOT();
});
