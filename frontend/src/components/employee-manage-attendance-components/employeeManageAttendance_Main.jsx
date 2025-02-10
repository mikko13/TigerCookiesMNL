import { useState, useEffect } from "react";
import Header from "./employeeManageAttendance_Header";
import useAttendance from "./fetchAttendance";
import { Link } from "react-router-dom";


export default function AdminManageAccountMain() {
  const fetchedAttendance = useAttendance();
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    // Retrieve the logged-in user from local storage
    const user = JSON.parse(localStorage.getItem("user"));
    const loggedInEmployeeID = user ? user.id : null;

    // Filter attendance records to only show the logged-in user's records
    const filteredAttendance = fetchedAttendance.filter(
      (record) => record.employeeID === loggedInEmployeeID
    );

    setAttendance(filteredAttendance);
  }, [fetchedAttendance]);

  return (
    <div className="relative flex flex-col w-full h-full text-gray-700 shadow-md bg-clip-border">
      <Header />
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left table-auto min-w-max">
          <thead>
            <tr>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                  Employee Name
                </p>
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                  Attendance Record Date
                </p>
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                  Check In Time
                </p>
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                  Check In Photo
                </p>
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                  Check Out Time
                </p>
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                  Check Out Photo
                </p>
              </th>
            </tr>
          </thead>
          <tbody className="overflow-y-auto">
            {attendance.map((record) => (
              <tr key={record._id}>
                <td className="p-4 border-b border-blue-gray-50">
                  <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                    {record.employeeName}
                  </p>
                </td>
                <td className="p-4 border-b border-blue-gray-50">
                  <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                    {record.attendanceDate}
                  </p>
                </td>
                <td className="p-4 border-b border-blue-gray-50">
                  <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                    {record.checkinTime}
                  </p>
                </td>
                <td className="p-4 border-b border-blue-gray-50">
                  <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                    <Link
                      to={`/employee-checkin-photos/${record.checkinPhoto}`}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      View Photo
                    </Link>
                  </p>
                </td>
                <td className="p-4 border-b border-blue-gray-50">
                  <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                    {record.checkoutTime}
                  </p>
                </td>
                <td className="p-4 border-b border-blue-gray-50">
                  <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                    <Link
                      to={`/employee-checkout-photos/${record.checkoutPhoto}`}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      View Photo
                    </Link>
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}