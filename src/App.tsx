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
          initialAttendance[student.SNo] = "Present"; 
        });
        setAttendance(initialAttendance);
        setDate(new Date().toLocaleDateString("en-GB")); 
      })
      .catch((error) => console.error("Error loading data:", error));
  }, []);

  const handleAttendanceChange = (sno: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [sno]: status }));
  };

  const totalStudents = students.length;
  const presentCount = Object.values(attendance).filter(
    (a) => a === "Present" || a === "On Duty" || a === "Late"
  ).length;
  const leaveCount = Object.values(attendance).filter((a) => a === "Leave").length;
  const odCount = Object.values(attendance).filter((a) => a === "On Duty").length;
  const lateCount = Object.values(attendance).filter((a) => a === "Late").length;
  const absentCount = Object.values(attendance).filter((a) => a === "Absent").length;

  const getList = (status: string) =>
    students
      .filter((s: any) => attendance[s.SNo] === status)
      .map((s: any) => `(${s.RollNo}) ${s.Name}`)
      .join("\n") || "NIL";

  const attendanceSummary = `
DATE : ${date}
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(attendanceSummary);
    alert("Attendance summary copied to clipboard!");
  };

  const shareOnWhatsApp = () => {
    const whatsappMessage = encodeURIComponent(attendanceSummary);
    const whatsappURL = `https://wa.me/?text=${whatsappMessage}`;
    window.open(whatsappURL, "_blank");
  };

  return (
    <div className="min-h-screen w-full p-6 bg-[#0a0a0a]">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent 
          drop-shadow-[0_0_10px_rgba(236,72,153,0.3)] mb-2">
          Attendance Management III-C
        </h1>
        <p className="text-gray-400 text-lg">Your gateway to student attendance tracking</p>
      </div>

      <div className="h-[28rem] overflow-hidden rounded-xl shadow-2xl bg-gray-800 
        border border-pink-500/20 shadow-pink-500/10">
        <div className="overflow-y-auto h-full">
          <table className="min-w-full h-full table-auto">
            <thead className="sticky top-0 bg-gradient-to-r from-pink-900 via-purple-900 to-pink-900 z-10">
              <tr className="border-b border-pink-500/30">
                <th className="px-4 py-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-200 font-bold tracking-wider">
                  S No
                </th>
                <th className="px-4 py-4 text-pink-200 font-bold tracking-wider whitespace-nowrap sticky left-0 
                  bg-gradient-to-r from-pink-900 via-purple-900 to-pink-900">
                  Student Name
                </th>
                <th className="px-4 py-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-200 font-bold tracking-wider">
                  Roll No
                </th>
                <th className="px-4 py-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-200 font-bold tracking-wider">
                  Reg No
                </th>
                <th className="px-4 py-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-200 font-bold tracking-wider">
                  Present
                </th>
                <th className="px-4 py-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-200 font-bold tracking-wider">
                  Absent
                </th>
                <th className="px-4 py-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-200 font-bold tracking-wider">
                  Leave
                </th>
                <th className="px-4 py-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-200 font-bold tracking-wider">
                  On Duty
                </th>
                <th className="px-4 py-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-200 font-bold tracking-wider">
                  Late
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-500/20">
              {students.map((student: any, index) => (
                <tr key={index} className="text-center hover:bg-gray-700 transition-colors">
                  <td className="border-b border-pink-500/20 p-2 text-gray-200">{student.SNo}</td>
                  <td className="border-b border-pink-500/20 p-2 text-gray-200 sticky left-0 
                    bg-gray-800 whitespace-nowrap font-medium">
                    {student.Name}
                  </td>
                  <td className="border-b border-pink-500/20 p-2 text-gray-200">{student.RollNo}</td>
                  <td className="border-b border-pink-500/20 p-2 text-gray-200">{student.RegNo}</td>
                  <td className="border-b border-pink-500/20 p-2">
                    <input
                      type="radio"
                      name={`attendance-${student.SNo}`}
                      value="Present"
                      checked={attendance[student.SNo] === "Present"}
                      onChange={() => handleAttendanceChange(student.SNo, "Present")}
                      className="w-4 h-4 accent-pink-500 cursor-pointer"
                    />
                  </td>
                  <td className="border-b border-pink-500/20 p-2">
                    <input
                      type="radio"
                      name={`attendance-${student.SNo}`}
                      value="Absent"
                      checked={attendance[student.SNo] === "Absent"}
                      onChange={() => handleAttendanceChange(student.SNo, "Absent")}
                      className="w-4 h-4 accent-pink-500 cursor-pointer"
                    />
                  </td>
                  <td className="border-b border-pink-500/20 p-2">
                    <input
                      type="radio"
                      name={`attendance-${student.SNo}`}
                      value="Leave"
                      checked={attendance[student.SNo] === "Leave"}
                      onChange={() => handleAttendanceChange(student.SNo, "Leave")}
                      className="w-4 h-4 accent-pink-500 cursor-pointer"
                    />
                  </td>
                  <td className="border-b border-pink-500/20 p-2">
                    <input
                      type="radio"
                      name={`attendance-${student.SNo}`}
                      value="On Duty"
                      checked={attendance[student.SNo] === "On Duty"}
                      onChange={() => handleAttendanceChange(student.SNo, "On Duty")}
                      className="w-4 h-4 accent-pink-500 cursor-pointer"
                    />
                  </td>
                  <td className="border-b border-pink-500/20 p-2">
                    <input
                      type="radio"
                      name={`attendance-${student.SNo}`}
                      value="Late"
                      checked={attendance[student.SNo] === "Late"}
                      onChange={() => handleAttendanceChange(student.SNo, "Late")}
                      className="w-4 h-4 accent-pink-500 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 p-6 bg-black/40 rounded-xl shadow-2xl border border-pink-500/20 text-gray-300
        shadow-pink-500/10">
        <h2 className="text-2xl font-bold mb-4 text-pink-500">Attendance Summary</h2>
        <pre className="bg-black/60 p-4 rounded-lg font-mono text-sm border border-pink-500/20">{attendanceSummary}</pre>

        <div className="flex gap-4 mt-6">
          <button 
            onClick={copyToClipboard} 
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-lg 
              shadow-lg hover:shadow-pink-500/50 transition-all duration-200 flex items-center gap-2"
          >
            <span>Copy Summary</span>
          </button>
          <button 
            onClick={shareOnWhatsApp} 
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2.5 rounded-lg 
              shadow-lg hover:shadow-purple-500/50 transition-all duration-200 flex items-center gap-2"
          >
            <span>Share on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
