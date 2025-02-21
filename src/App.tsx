import { useState, useEffect } from "react";
import "./App.css";

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
          initialAttendance[student.SNo] = "Present"; // Default: Present
        });
        setAttendance(initialAttendance);
        setDate(new Date().toLocaleDateString("en-GB")); // Set today's date (DD/MM/YYYY)
      })
      .catch((error) => console.error("Error loading data:", error));
  }, []);

  const handleAttendanceChange = (sno: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [sno]: status }));
  };

  // Count total attendance stats
  const totalStudents = students.length;
  const presentCount = Object.values(attendance).filter((a) => a === "Present").length;
  const leaveCount = Object.values(attendance).filter((a) => a === "Leave").length;
  const odCount = Object.values(attendance).filter((a) => a === "On Duty").length;
  const absentCount = Object.values(attendance).filter((a) => a === "Absent").length;

  // Filter students by category
  const leaveList = students.filter((s: any) => attendance[s.SNo] === "Leave");
  const odList = students.filter((s: any) => attendance[s.SNo] === "On Duty");
  const absentList = students.filter((s: any) => attendance[s.SNo] === "Absent");

  // Generate Attendance Summary as Text
  const attendanceSummary = `
${date}
PRESENT: ${presentCount}/${totalStudents}
LEAVE: ${leaveCount}
ON DUTY: ${odCount}
ABSENT: ${absentCount}
LATE: 0

LEAVE
${leaveList.length > 0 ? leaveList.map((s: any) => `(${s.RollNo}) ${s.Name}`).join("\n") : "NIL"}

ON DUTY
${odList.length > 0 ? odList.map((s: any) => `(${s.RollNo}) ${s.Name}`).join("\n") : "NIL"}

ABSENT
${absentList.length > 0 ? absentList.map((s: any) => `(${s.RollNo}) ${s.Name}`).join("\n") : "NIL"}

LATE
NIL
  `;

  // Copy to Clipboard Function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(attendanceSummary);
    alert("Attendance copied to clipboard!");
  };

  // Share on WhatsApp Function
  const shareOnWhatsApp = () => {
    const whatsappMessage = encodeURIComponent(attendanceSummary);
    const whatsappURL = `https://wa.me/?text=${whatsappMessage}`;
    window.open(whatsappURL, "_blank");
  };

  return (
    <div className="h-screen w-full p-4 bg-gradient-to-br from-pink-600 to-blue-900">
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
              </tr>
            </thead>
            <tbody>
              {students.map((student: any, index) => (
                <tr key={index} className="text-center">
                  <td className="border-2 p-2">{student.SNo}</td>
                  <td className="border-2 p-2">{student.Name}</td>
                  <td className="border-2 p-2">{student.RollNo}</td>
                  <td className="border-2 p-2">{student.RegNo}</td>
                  {/* Radio Buttons for Attendance */}
                  {["Present", "Absent", "Leave", "On Duty"].map((status) => (
                    <td key={status} className="border-2 p-2">
                      <input
                        type="radio"
                        name={`attendance-${student.SNo}`}
                        value={status}
                        checked={attendance[student.SNo] === status}
                        onChange={() => handleAttendanceChange(student.SNo, status)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Summary Section */}
      <div className="mt-6 bg-white p-4 rounded-2xl shadow-lg">
        <h2 className="text-lg font-bold mb-2">Attendance Summary - {date}</h2>
        <p>PRESENT: {presentCount}/{totalStudents}</p>
        <p>LEAVE: {leaveCount}</p>
        <p>ON DUTY: {odCount}</p>
        <p>ABSENT: {absentCount}</p>
        <p>LATE: 0</p>

        {/* Display student lists */}
        <div className="mt-4">
          {leaveList.length > 0 && (
            <div>
              <h3 className="font-bold text-red-600">LEAVE</h3>
              {leaveList.map((s: any) => (
                <p key={s.SNo}>( {s.RollNo} ) {s.Name}</p>
              ))}
            </div>
          )}
          {odList.length > 0 && (
            <div>
              <h3 className="font-bold text-blue-600">ON DUTY</h3>
              {odList.map((s: any) => (
                <p key={s.SNo}>( {s.RollNo} ) {s.Name}</p>
              ))}
            </div>
          )}
          {absentList.length > 0 ? (
            <div>
              <h3 className="font-bold text-orange-600">ABSENT</h3>
              {absentList.map((s: any) => (
                <p key={s.SNo}>{s.Name}</p>
              ))}
            </div>
          ) : (
            <p className="font-bold text-green-600">ABSENT: NIL</p>
          )}
          <p className="font-bold text-green-600">LATE: NIL</p>
        </div>

        {/* Copy and Share Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={copyToClipboard}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Copy
          </button>
          <button
            onClick={shareOnWhatsApp}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Share on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
