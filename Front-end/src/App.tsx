import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Attendance from "./Attendance";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
const API_URL = import.meta.env.VITE_API_URL;

const App = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
  const [date, setDate] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

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
    (a) => a === "Present" || a === "Late" || a === "On Duty(INTERNAL)" || a === "On Duty(EXTERNAL)"
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

Have a Nice Day 😊.
  `;

  const [copied, setCopied] = useState(false);

const copyToClipboard = () => {
  navigator.clipboard.writeText(attendanceSummary);
  setCopied(true);
  setTimeout(() => setCopied(false), 6000); 
};

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const saveToDatabase = async () => {
    try {
      const studentRecords = students.map((student: any) => ({
        studentId: student.SNo,
        rollNo: student.RollNo,
        name: student.Name,
        status: attendance[student.SNo]
      }));

      const attendanceData = {
        presentCount,
        absentCount,
        leaveCount,
        odInternalCount: odCountINTERNAL,
        odExternalCount: odCountEXTERNAL,
        lateCount,
        totalStudents,
        attendanceData: attendanceSummary,
        studentRecords
      };

      const response = await fetch(`${API_URL}/api`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData)
      });

      if (!response.ok) {
        throw new Error('Failed to save attendance data');
      }
      
      showNotification('Data saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving attendance:', error);
      showNotification('Failed to save data. Please try again.', 'error');
    }
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
    <Routes>
      <Route path="/" element={
        <div className="min-h-screen w-full p-6 bg-[#0a0a0a]">
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              className={`fixed top-4 right-4 z-50 rounded-lg shadow-lg px-6 py-3 text-white ${
                notification.type === 'success' 
                  ? 'bg-green-500/90 border border-green-600' 
                  : 'bg-red-500/90 border border-red-600'
              }`}
            >
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span>{notification.message}</span>
              </div>
            </motion.div>
          )}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              variants={itemVariants}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold mb-2">
                <span className="animate-gradient bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_auto] 
                  bg-clip-text text-transparent inline-block relative drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                  Attendance Management III-C
                </span>
              </h1>
              <p className=" text-lg animate-gradient bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-[length:200%_auto] 
                bg-clip-text text-transparent inline-block">
                Your gateway to student attendance tracking
              </p>
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
              className="mt-6 p-4 sm:p-6 bg-black/40 rounded-xl shadow-2xl border border-pink-500/20 text-gray-300
                shadow-pink-500/10"
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-4">
                <span className="animate-gradient bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_auto] 
                  bg-clip-text text-transparent inline-block">
                  Attendance Summary
                </span>
              </h2>
              <pre className="bg-black/60 p-2 sm:p-4 rounded-lg font-mono text-xs sm:text-sm overflow-x-auto border border-pink-500/20">
                {attendanceSummary}
              </pre>

              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 mt-6"
              >
                <button 
                  onClick={copyToClipboard} 
                  className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-lg 
                    shadow-lg hover:shadow-pink-500/50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Copy Summary</span>
                  {copied && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white 
                      text-sm px-3 py-1 rounded-md shadow-lg">
                      Copied!
                    </div>
                  )}
                </button>

                <button 
                  onClick={saveToDatabase} 
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg 
                    shadow-lg hover:shadow-blue-500/50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Save to Database</span>
                </button>

                <button 
                  onClick={shareOnWhatsApp} 
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg 
                    shadow-lg hover:shadow-green-500/50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Share on WhatsApp</span>
                </button>

                <button 
                  onClick={() => navigate('/login')} 
                  className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white px-6 py-2.5 rounded-lg 
                    shadow-lg hover:shadow-purple-500/50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>View History</span>
                </button>
              </motion.div>
              <h1 className="mt-6 origin-bottom-right font-bold text-2xl relative">
                <span className="animate-gradient bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_auto] 
                  bg-clip-text text-transparent inline-block relative">
                  Developed By Santhosh
                </span>
              </h1>
            </motion.div>
          </motion.div>
        </div>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/history" element={
        <ProtectedRoute>
          <Attendance />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .animate-gradient {
    animation: gradient 3s linear infinite;
    background-size: 200% auto;
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .animate-gradient:hover {
    animation: gradient 1.5s linear infinite;
    background-size: 200% auto;
  }
`, styleSheet.cssRules.length);

export default App;
