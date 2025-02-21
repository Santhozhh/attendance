import { useState, useEffect } from "react";
import "./app.css";

const App = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
  const [date, setDate] = useState("");

  useEffect(() => {
    fetch("./III_CSE_C_NAME_LIST_FINAL.json")
      .then((response) => response.json())
      .then((data) => {
        setStudents(data);
        const initialAttendance: { [key: string]: string } = {};
        data.forEach((student: any) => {
          initialAttendance[student.SNo] = "Present"; // Default status
        });
        setAttendance(initialAttendance);
        setDate(new Date().toLocaleDateString("en-GB")); // Set today's date (DD/MM/YYYY)
      })
      .catch((error) => console.error("Error loading data:", error));
  }, []);

  const handleAttendanceChange = (sno: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [sno]: status }));
  };

  // Count attendance categories
  const totalStudents = students.length;
  const presentCount = Object.values(attendance).filter((a) => a === "Present").length;
  const leaveCount = Object.values(attendance).filter((a) => a === "Leave").length;
  const odCount = Object.values(attendance).filter((a) => a === "On Duty").length;
  const lateCount = Object.values(attendance).filter((a) => a === "Late").length;
  const absentCount = Object.values(attendance).filter((a) => a === "Absent").length;

  // Filter students by category
  const getList = (status: string) =>
    students
      .filter((s: any) => attendance[s.SNo] === status)
      .map((s: any) => `(${s.RollNo}) ${s.Name}`)
      .join("\n") || "NIL";

  // Attendance Summary
  const attendanceSummary = `
${date}
PRESENT: ${presentCount}/${totalStudents}
LEAVE: ${leaveCount}
ON DUTY: ${odCount}
LATE: ${lateCount}
ABSENT: ${absentCount}

LEAVE
${getList("Leave")}

ON DUTY
${getList("On Duty")}

LATE
${getList("Late")}

ABSENT
${getList("Absent")}
  `;

  // Copy to Clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(attendanceSummary);
    alert("Attendance summary copied to clipboard!");
  };

  // Share on WhatsApp
  const shareOnWhatsApp = () => {
    const whatsappMessage = encodeURIComponent(attendanceSummary);
    const whatsappURL = `https://wa.me/?text=${whatsappMessage}`;
    window.open(whatsappURL, "_blank");
  };

  return (
    <div className="h-screen w-full p-4 bg-gradient-to-br from-green-600 to-blue-600">
      <div className="bg-gradient-to-r from-blue-400 to-blue-950 p-3 rounded-2xl flex items-center justify-center h-17">
        <h1 className="text-2xl font-bold text-white">Attendance III-C</h1>
      </div>

      <div className="h-96 overflow-hidden border rounded-2xl mt-5 bg-gradient-to-br from-blue-950 to-blue-300 text-white">
        <div className="overflow-y-auto h-full">
          <table className="min-w-full h-full table-auto">
            <thead>
              <tr>
                <th className="border-2 px-4 py-2">S No</th>
                <th className="border-2 px-4 py-2">Student Name</th>
                <th className="border-2 px-4 py-2">Roll No</th>
                <th className="border-2 px-4 py-2">Reg No</th>
                <th className="border-2 px-4 py-2">Present</th>
                <th className="border-2 px-4 py-2">Absent</th>
                <th className="border-2 px-4 py-2">Leave</th>
                <th className="border-2 px-4 py-2">On Duty</th>
                <th className="border-2 px-4 py-2">Late</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student: any, index) => (
                <tr key={index} className="text-center">
                  <td className="border-2 p-2">{student.SNo}</td>
                  <td className="border-2 p-2">{student.Name}</td>
                  <td className="border-2 p-2">{student.RollNo}</td>
                  <td className="border-2 p-2">{student.RegNo}</td>
                  <td className="border-2 p-2">
                    <input
                      type="radio"
                      name={`attendance-${student.SNo}`}
                      value="Present"
                      checked={attendance[student.SNo] === "Present"}
                      onChange={() => handleAttendanceChange(student.SNo, "Present")}
                    />
                  </td>
                  <td className="border-2 p-2">
                    <input
                      type="radio"
                      name={`attendance-${student.SNo}`}
                      value="Absent"
                      checked={attendance[student.SNo] === "Absent"}
                      onChange={() => handleAttendanceChange(student.SNo, "Absent")}
                    />
                  </td>
                  <td className="border-2 p-2">
                    <input
                      type="radio"
                      name={`attendance-${student.SNo}`}
                      value="Leave"
                      checked={attendance[student.SNo] === "Leave"}
                      onChange={() => handleAttendanceChange(student.SNo, "Leave")}
                    />
                  </td>
                  <td className="border-2 p-2">
                    <input
                      type="radio"
                      name={`attendance-${student.SNo}`}
                      value="On Duty"
                      checked={attendance[student.SNo] === "On Duty"}
                      onChange={() => handleAttendanceChange(student.SNo, "On Duty")}
                    />
                  </td>
                  <td className="border-2 p-2">
                    <input
                      type="radio"
                      name={`attendance-${student.SNo}`}
                      value="Late"
                      checked={attendance[student.SNo] === "Late"}
                      onChange={() => handleAttendanceChange(student.SNo, "Late")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Summary Section */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md text-black">
        <h2 className="text-xl font-bold mb-2">Attendance Summary</h2>
        <pre className="bg-gray-200 p-2 rounded">{attendanceSummary}</pre>

        <div className="flex gap-4 mt-4">
          <button onClick={copyToClipboard} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
            Copy
          </button>
          <button onClick={shareOnWhatsApp} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Share on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
