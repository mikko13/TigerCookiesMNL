import { useState, useEffect } from "react";
import Header from "./adminManageAttendance_Header";
import useAttendance from "./fetchAttendance";
import handleDelete from "./handleDelete";
import { Link } from "react-router-dom";
import { getStatusClass } from "./getStatusClass";

export default function AdminManageAccountMain() {
  const fetchedAttendance = useAttendance();
  const [attendance, setAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    setAttendance(fetchedAttendance);
  }, [fetchedAttendance]);

  const filteredAttendance = attendance.filter(
    (record) =>
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterDate ? record.attendanceDate === filterDate : true)
  );

  return (
    <div className="relative flex flex-col w-full h-full text-gray-700 shadow-md bg-clip-border">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
      />
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
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                  Attendance Status
                </p>
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                  Actions
                </p>
              </th>
            </tr>
          </thead>
          <tbody className="overflow-y-auto">
            {filteredAttendance.map((record) => (
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
                <td className="p-4 border-b border-blue-gray-200">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-md ${getStatusClass(
                      record.attendanceStatus
                    )}`}
                  >
                    {record.attendanceStatus}
                  </span>
                </td>

                <td className="p-4 border-b border-blue-gray-50">
                  <div className="flex gap-2">
                    <button className="mr-4" title="Edit">
                      <Link
                        to={`/UpdateEmployeeAttendance/${record._id}`}
                        state={{ record }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 fill-blue-500 hover:fill-blue-700"
                          viewBox="0 0 348.882 348.882"
                        >
                          <path
                            d="m333.988 11.758-.42-.383A43.363 43.363 0 0 0 304.258 0a43.579 43.579 0 0 0-32.104 14.153L116.803 184.231a14.993 14.993 0 0 0-3.154 5.37l-18.267 54.762c-2.112 6.331-1.052 13.333 2.835 18.729 3.918 5.438 10.23 8.685 16.886 8.685h.001c2.879 0 5.693-.592 8.362-1.76l52.89-23.138a14.985 14.985 0 0 0 5.063-3.626L336.771 73.176c16.166-17.697 14.919-45.247-2.783-61.418zM130.381 234.247l10.719-32.134.904-.99 20.316 18.556-.904.99-31.035 13.578zm184.24-181.304L182.553 197.53l-20.316-18.556L294.305 34.386c2.583-2.828 6.118-4.386 9.954-4.386 3.365 0 6.588 1.252 9.082 3.53l.419.383c5.484 5.009 5.87 13.546.861 19.03z"
                            data-original="#000000"
                          />
                          <path
                            d="M303.85 138.388c-8.284 0-15 6.716-15 15v127.347c0 21.034-17.113 38.147-38.147 38.147H68.904c-21.035 0-38.147-17.113-38.147-38.147V100.413c0-21.034 17.113-38.147 38.147-38.147h131.587c8.284 0 15-6.716 15-15s-6.716-15-15-15H68.904C31.327 32.266.757 62.837.757 100.413v180.321c0 37.576 30.571 68.147 68.147 68.147h181.798c37.576 0 68.147-30.571 68.147-68.147V153.388c.001-8.284-6.715-15-14.999-15z"
                            data-original="#000000"
                          />
                        </svg>
                      </Link>
                    </button>
                    <button
                      className="mr-4"
                      title="Delete"
                      onClick={() => handleDelete(record._id, setAttendance)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 fill-red-500 hover:fill-red-700"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 7a1 1 0 0 0-1 1v11.191A1.92 1.92 0 0 1 15.99 21H8.01A1.92 1.92 0 0 1 6 19.191V8a1 1 0 0 0-2 0v11.191A3.918 3.918 0 0 0 8.01 23h7.98A3.918 3.918 0 0 0 20 19.191V8a1 1 0 0 0-1-1Zm1-3h-4V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2ZM10 4V3h4v1Z"
                          data-original="#000000"
                        />
                        <path
                          d="M11 17v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Zm4 0v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Z"
                          data-original="#000000"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
