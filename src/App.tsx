
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    (a) => a === "Present" || a === "On Duty(INTERNAL)" || a === "Late" || a === "On Duty(EXTERNAL)"
  ).length;
  const leaveCount = Object.values(attendance).filter((a) => a === "Leave").length;
  const odCountINTERNAL = Object.values(attendance).filter((a) => a === "On Duty(INTERNAL)").length;
  const odCountEXTERNAL = Object.values(attendance).filter((a) => a === "On Duty(EXTERNAL)").length;
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
ON DUTY (INTERNAL): ${odCountINTERNAL}
ON DUTY (EXTERNAL) : ${odCountEXTERNAL}
TOTAL ON DUTY : ${odCountEXTERNAL+odCountINTERNAL}
LATE: ${lateCount}
ABSENT: ${absentCount}

LEAVE
${getList("Leave")}

ON DUTY(INTERNAL)
${getList("On Duty(INTERNAL)")}

ON DUTY(EXTERNAL)
${getList("On Duty(EXTERNAL)")}

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      x: -100 
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="min-h-screen w-full p-6 bg-[#0a0a0a]">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          variants={itemVariants}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent 
            drop-shadow-[0_0_10px_rgba(236,72,153,0.3)] mb-2">
            Attendance Management III-C
          </h1>
          <p className="text-gray-400 text-lg">Your gateway to student attendance tracking</p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="h-[28rem] overflow-hidden rounded-xl shadow-2xl bg-gray-800 
            border border-pink-500/20 shadow-pink-500/10"
        >
          <div className="overflow-y-auto h-full">
            <table className="min-w-full h-full table-auto animate-slideInFromRight">
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
                    On Duty(INTERNAL)
                  </th><th className="px-4 py-4 text-transparent bg-clip-text bg-gradient-to-r npmfrom-pink-400 to-pink-200 font-bold tracking-wider">
                    On Duty(EXTERNAL)
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
                      <button
                        onClick={() => handleAttendanceChange(student.SNo, "Present")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200
                          ${attendance[student.SNo] === "Present" 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-700 text-gray-400'}`}
                      >
                        Present
                      </button>
                    </td>
                    <td className="border-b border-pink-500/20 p-2">
                      <button
                        onClick={() => handleAttendanceChange(student.SNo, "Absent")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200
                          ${attendance[student.SNo] === "Absent" 
                            ? 'bg-red-500 text-white' 
                            : 'bg-gray-700 text-gray-400'}`}
                      >
                        Absent
                      </button>
                    </td>
                    <td className="border-b border-pink-500/20 p-2">
                      <button
                        onClick={() => handleAttendanceChange(student.SNo, "Leave")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200
                          ${attendance[student.SNo] === "Leave" 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-gray-700 text-gray-400'}`}
                      >
                        Leave
                      </button>
                    </td>
                    <td className="border-b border-pink-500/20 p-2">
                      <button
                        onClick={() => handleAttendanceChange(student.SNo, "On Duty(INTERNAL)")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200
                          ${attendance[student.SNo] === "On Duty(INTERNAL)" 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-700 text-gray-400'}`}
                      >
                        On Duty (Internal)
                      </button>
                    
                    </td>
                    <td className="border-b border-pink-500/20 p-2">
                    <button
                        onClick={() => handleAttendanceChange(student.SNo, "On Duty(EXTERNAL)")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200
                          ${attendance[student.SNo] === "On Duty(EXTERNAL)" 
                            ? 'bg-purple-900 text-white' 
                            : 'bg-gray-700 text-gray-400'}`}
                      >
                        On Duty(External)
                      </button>
                    </td>
                    <td className="border-b border-pink-500/20 p-2">
                      <button
                        onClick={() => handleAttendanceChange(student.SNo, "Late")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200
                          ${attendance[student.SNo] === "Late" 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-700 text-gray-400'}`}
                      >
                        Late
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="mt-6 p-6 bg-black/40 rounded-xl shadow-2xl border border-pink-500/20 text-gray-300
            shadow-pink-500/10"
        >
          <h2 className="text-2xl font-bold mb-4 text-pink-500">Attendance Summary</h2>
          <pre className="bg-black/60 p-4 rounded-lg font-mono text-sm border border-pink-500/20">
            {attendanceSummary}
          </pre>

          <motion.div 
            variants={itemVariants}
            className="flex gap-4 mt-6"
          >
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
            
          </motion.div>
          <h1 className="origin-bottom-right font-bold text-2xl">Developed By santhosh</h1>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default App;
