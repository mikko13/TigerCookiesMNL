const cron = require('node-cron');
const { updateAttendanceOnAutoCheckout } = require('../services/attendanceService');  // Import the function from the service

// Cron job running every minute
cron.schedule('*/1 * * * *', async () => {
  try {
    console.log("Checking for overtime employees...");
    // Fetch employees with overtime (Assuming you have a function to get overtime employees)
    const employees = await getEmployeesWithOvertime();

    // Loop through each employee and check if they should be auto-checked out
    employees.forEach(employee => {
      const currentTime = new Date();
      if (employee.endOT && currentTime >= employee.endOT) {
        // Call the updateAttendanceOnAutoCheckout function to mark the session as expired
        updateAttendanceOnAutoCheckout(employee._id, currentTime);
      }
    });
  } catch (error) {
    console.error("Error during cron job execution:", error);
  }
});

