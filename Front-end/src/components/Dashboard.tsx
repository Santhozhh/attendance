import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Student {
  SNo: string;
  Name: string;
  RollNo: string;
  RegNo: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
  const [date, setDate] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    color?: string;
  } | null>(null);

  // Add mouse position state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Add smooth spring animation
  const springConfig = { damping: 30, stiffness: 200 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);

  // Handle mouse move for the entire page
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

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
    const student = students.find((s: Student) => s.SNo === sno);
    if (!student) return;
    
    setAttendance((prev) => ({ ...prev, [sno]: status }));
    
    // Show notification for status change
    const statusColors = {
      'Present': 'emerald',
      'Absent': 'rose',
      'Leave': 'amber',
      'On Duty(INTERNAL)': 'violet',
      'On Duty(EXTERNAL)': 'purple',
      'Late': 'orange'
    };
    
    const statusMessages = {
      'Present': 'is now marked Present',
      'Absent': 'is marked Absent',
      'Leave': 'is on Leave',
      'On Duty(INTERNAL)': 'is on Internal OD',
      'On Duty(EXTERNAL)': 'is on External OD',
      'Late': 'is marked Late'
    };
    
    const message = `${student.Name} ${statusMessages[status as keyof typeof statusMessages]}`;
    showNotification(message, 'success', statusColors[status as keyof typeof statusColors]);
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

Have a Very Nice Day`;

  const showNotification = (message: string, type: 'success' | 'error', color?: string) => {
    setNotification({ message, type, color });
    setTimeout(() => setNotification(null), 4000);
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(attendanceSummary)
      .then(() => {
        showNotification('Summary copied to clipboard!', 'success');
      })
      .catch(() => {
        showNotification('Failed to copy summary. Please try again.', 'error');
      });
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

  const tableRowVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    transition: { type: "spring", stiffness: 100, damping: 12 }
  };

  const filteredStudents = students.filter((student: any) =>
    student.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.RollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="min-h-screen w-full bg-[#020617] bg-mesh p-6 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Header with navigation buttons */}
      <div className="flex justify-end items-center gap-4 mb-6">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg
            hover:bg-red-500/30 transition-all duration-200 font-medium shadow-lg"
        >
          Logout
        </button>
      </div>

      <motion.div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(600px circle at var(--x) var(--y), rgba(139, 92, 246, 0.15), transparent 40%)",
          x: spotlightX,
          y: spotlightY,
        }}
        animate={{
          '--x': spotlightX,
          '--y': spotlightY,
        } as any}
      />
      
      <motion.div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(800px circle at var(--x) var(--y), rgba(99, 102, 241, 0.12), transparent 40%)",
          x: spotlightX,
          y: spotlightY,
        }}
        animate={{
          '--x': spotlightX,
          '--y': spotlightY,
        } as any}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto relative z-10"
      >
        <motion.div 
          variants={itemVariants}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            Attendance Management III-C
          </h1>
          <p className="text-lg text-white/70">
            Your gateway to student attendance tracking
          </p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="mb-6"
        >
          <div className="gradient-border">
            <div className="glass-effect p-4 rounded-xl relative">
              <div className="spotlight"></div>
              <div className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-[#0f172a] text-white border border-indigo-500/40 rounded-lg 
                      placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <div className="mt-2 text-sm text-white/70 bg-[#1f1f2e] px-3 py-1 rounded-md inline-block">
                    Found: {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="gradient-border"
        >
          <div className="glass-effect rounded-xl overflow-hidden relative">
            <div className="spotlight"></div>
            <div className="relative">
              <div className="overflow-x-auto max-h-[70vh]">
                <table className="min-w-full divide-y divide-violet-500/20">
                  <thead className="bg-[#2d1b69]">
                    <tr>
                      <th className="px-2 sm:px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[30px] sm:w-[60px] sticky left-0 bg-[#2d1b69] z-20">
                        S No
                      </th>
                      <th className="px-2 sm:px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[calc(25vw-30px)] sm:w-[180px] sticky left-[30px] sm:left-[60px] bg-[#2d1b69] z-20">
                        Student Name
                      </th>
                      <th className="px-2 sm:px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[100px]">
                        Roll No
                      </th>
                      <th className="px-2 sm:px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">
                        Reg No
                      </th>
                      {["Present", "Absent", "Leave", "On Duty(INTERNAL)", "On Duty(EXTERNAL)", "Late"].map((header) => (
                        <th key={header} className="px-2 sm:px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-violet-500/20 bg-[#1a103f]">
                    {filteredStudents.map((student: any, index) => (
                      <motion.tr
                        key={student.SNo}
                        variants={tableRowVariants}
                        custom={index}
                        className="hover:bg-[#2d1b69] transition-colors"
                      >
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-white w-[30px] sm:w-[60px] sticky left-0 bg-[#1a103f] z-10">
                          {student.SNo}
                        </td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-white w-[calc(25vw-30px)] sm:w-[180px] sticky left-[30px] sm:left-[60px] bg-[#1a103f] z-10">
                          {student.Name}
                        </td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-white min-w-[100px]">
                          {student.RollNo}
                        </td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-white min-w-[120px]">
                          {student.RegNo}
                        </td>
                        {["Present", "Absent", "Leave", "On Duty(INTERNAL)", "On Duty(EXTERNAL)", "Late"].map((status) => (
                          <td key={status} className="px-2 sm:px-6 py-4 whitespace-nowrap min-w-[120px]">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAttendanceChange(student.SNo, status)}
                              className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                attendance[student.SNo] === status
                                  ? status === "Present" ? "status-present" :
                                    status === "Absent" ? "status-absent" :
                                    status === "Leave" ? "status-leave" :
                                    status === "On Duty(INTERNAL)" ? "status-od" :
                                    status === "On Duty(EXTERNAL)" ? "status-od-external" :
                                    "status-late"
                                  : "attendance-button-unselected"
                              }`}
                            >
                              {status}
                            </motion.button>
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="mt-8"
        >
          <div className="gradient-border">
            <div className="glass-effect p-6 rounded-xl relative">
              <div className="spotlight"></div>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Attendance Summary
              </h2>
              <pre className="bg-[#0f172a]/50 p-4 rounded-lg font-mono text-sm text-white/90 overflow-x-auto border border-violet-500/20">
                {attendanceSummary}
              </pre>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 relative">
                {[
                  { label: "Copy Summary", onClick: copyToClipboard, icon: "clipboard", className: "button-copy" },
                  { label: "Save to Database", onClick: saveToDatabase, icon: "save", className: "button-save" },
                  { label: "Share on WhatsApp", onClick: shareOnWhatsApp, icon: "share", className: "button-share" },
                  { label: "View History", onClick: () => navigate('/login/history'), icon: "history", className: "button-view" }
                ].map(({ label, onClick, icon, className }) => (
                  <div key={label} className="relative">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClick}
                      className={`${className} text-white px-6 py-3 rounded-lg font-medium hover-glow w-full
                        flex items-center justify-center gap-2`}
                    >
                      <span>{label}</span>
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="glass-effect px-6 py-4 rounded-xl border-2 border-white/10 shadow-2xl backdrop-blur-xl min-w-[300px] bg-[#0f172a]">
              <div className="flex items-center gap-3">
                {notification.type === 'success' ? (
                  <div className={`w-10 h-10 rounded-full ${
                    notification.color ? `bg-${notification.color}-500/30` : 'bg-emerald-500/30'
                  } flex items-center justify-center`}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: 1,
                        rotate: 360,
                        transition: { duration: 0.5 }
                      }}
                      className="w-6 h-6 text-white"
                    >
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        className="w-full h-full drop-shadow-glow"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="3" 
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-rose-500/30 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: 1,
                        transition: { duration: 0.3 }
                      }}
                      className="w-6 h-6 text-white"
                    >
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        className="w-full h-full drop-shadow-glow"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="3" 
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </motion.div>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-white drop-shadow-glow">
                    Status Updated
                  </span>
                  <span className="text-base text-white font-medium">
                    {notification.message}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div 
          variants={itemVariants}
          className="mt-8 text-center"
        >
          <p className="text-xl font-bold text-gradient">
            Developed By SANTHOSH
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 