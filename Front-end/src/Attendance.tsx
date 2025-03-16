import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import './styles.css';
const API_URL = import.meta.env.VITE_API_URL;
ChartJS.register(ArcElement, Tooltip, Legend);



interface AttendanceRecord {
  _id: string;
  date: string;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  odCount: number;
  lateCount: number;
  totalStudents: number;
  attendanceData: string;
  studentRecords: {
    studentId: string;
    rollNo: string;
    name: string;
    status: string;
  }[];
}


interface StudentSummary {
  name: string;
  rollNo: string;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  odCount: number;
  lateCount: number;
  totalDays: number;
  presentPercentage: string;
  absentPercentage: string;
  leavePercentage: string;
  latePercentage: string;
  attendanceDates: {
    date: string;
    status: string;
  }[];
}

const Attendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [searchDate, setSearchDate] = useState('');
  const [searchName, setSearchName] = useState('');
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [studentSummary, setStudentSummary] = useState<StudentSummary | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    recordId: string | null;
  }>({
    isOpen: false,
    recordId: null
  });

  // Update chart colors to match new theme
  const chartColors = {
    present: '#818cf8', // Indigo
    absent: '#ec4899',  // Pink
    leave: '#a78bfa',   // Purple
    od: '#60a5fa',      // Blue
    late: '#f472b6'     // Pink
  };

  // Show notification function
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Hide after 3 seconds
  };

  // Authentication check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchAttendanceRecords();
  }, [navigate]);

  // Filter records by student name
  useEffect(() => {
    if (searchName.trim() === '') {
      setStudentSummary(null);
      setFilteredRecords(records);
      return;
    }

    const searchTerm = searchName.toLowerCase();
    const filtered = records.map(record => ({
      ...record,
      studentRecords: record.studentRecords.filter(student =>
        student.name.toLowerCase().includes(searchTerm)
      )
    })).filter(record => record.studentRecords.length > 0);

    setFilteredRecords(filtered);

    // Calculate summary for the searched student
    if (filtered.length > 0) {
      const studentData = filtered[0].studentRecords[0]; // Get the first matching student
      if (studentData) {
        const summary: StudentSummary = {
          name: studentData.name,
          rollNo: studentData.rollNo,
          presentCount: 0,
          absentCount: 0,
          leaveCount: 0,
          odCount: 0,
          lateCount: 0,
          totalDays: filtered.length,
          presentPercentage: '0.0',
          absentPercentage: '0.0',
          leavePercentage: '0.0',
          latePercentage: '0.0',
          attendanceDates: []
        };

        // Calculate counts from all records
        filtered.forEach(record => {
          const studentRecord = record.studentRecords.find(s => 
            s.name.toLowerCase().includes(searchTerm)
          );
          if (studentRecord) {
            switch (studentRecord.status) {
              case 'Present':
                summary.presentCount++;
                break;
              case 'Absent':
                summary.absentCount++;
                break;
              case 'Leave':
                summary.leaveCount++;
                break;
              case 'On Duty':
                summary.odCount++;
                summary.totalDays--; // Not counting this in total attendance
                break;
              case 'Late':
                summary.lateCount++;
                break;
            }
            summary.attendanceDates.push({
              date: record.date,
              status: studentRecord.status
            });
          }
        });

        // Calculate total days excluding both Internal and External OD
        const totalDaysExcludingOD = summary.totalDays;

        // Update the summary with calculated percentages
        setStudentSummary({
          ...summary,
          presentPercentage: totalDaysExcludingOD > 0 
            ? ((summary.presentCount / totalDaysExcludingOD) * 100).toFixed(1) 
            : '0.0',
          absentPercentage: totalDaysExcludingOD > 0 
            ? ((summary.absentCount / totalDaysExcludingOD) * 100).toFixed(1) 
            : '0.0',
          leavePercentage: totalDaysExcludingOD > 0 
            ? ((summary.leaveCount / totalDaysExcludingOD) * 100).toFixed(1) 
            : '0.0',
          latePercentage: totalDaysExcludingOD > 0 
            ? ((summary.lateCount / totalDaysExcludingOD) * 100).toFixed(1) 
            : '0.0'
        });
      }
    } else {
      setStudentSummary(null);
    }
  }, [searchName, records]);

  // Fetch attendance records
  const fetchAttendanceRecords = async (date?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = date 
        ? `${API_URL}/api/${date}`
        : `${API_URL}/api`;
        
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(response.status === 404 
          ? 'No attendance records found for the selected date' 
          : 'Failed to fetch attendance records');
      }

      const data = await response.json();
      const fetchedRecords = Array.isArray(data) ? data : [data];
      setRecords(fetchedRecords);
      setFilteredRecords(fetchedRecords);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load attendance records');
      setRecords([]);
      setFilteredRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAttendanceRecords(searchDate);
  };

  const handleNameSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value);
  };

  const handleReset = () => {
    setSearchDate('');
    setSearchName('');
    setSelectedRecord(null);
    fetchAttendanceRecords();
  };

  const handleLogout = () => {
    localStorage.removeItem('isHistoryAuthenticated');
    navigate('/login/history');
  };

  // Render pie chart
  const renderPieChart = (data: number[], labels: string[], colors: string[]) => {
    const chartData = {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: colors.map(color => `${color}33`),
        borderWidth: 1,
      }],
    };

    const options = {
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            color: '#9ca3af',
            font: { size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.raw || 0;
              const dataset = context.dataset.data;
              
              // Get individual counts
              const [presentCount, absentCount, leaveCount, odCount, lateCount] = dataset;
              
              // Calculate total students (excluding OD)
              const totalStudents = presentCount + absentCount + leaveCount + lateCount;
              
              let percentage;
              if (label === 'Present') {
                // Present percentage is calculated against total students
                percentage = ((presentCount / totalStudents) * 100).toFixed(1);
              } else if (label === 'OD') {
                // OD percentage is calculated as additional percentage
                percentage = ((value / totalStudents) * 100).toFixed(1);
              } else {
                // Absent, Leave, and Late percentages are calculated against total students
                percentage = ((value / totalStudents) * 100).toFixed(1);
              }
              
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };

    return <Pie data={chartData} options={options} />;
  };

  const handleStatusClick = (status: string, record: AttendanceRecord) => {
    setSelectedRecord(record);
    if (selectedStatus === status) {
      setSelectedStatus(null);
    } else {
      setSelectedStatus(status);
    }
  };

  const getFilteredStudentsByStatus = (record: AttendanceRecord) => {
    if (!selectedStatus) return record.studentRecords;
    return record.studentRecords.filter(student => student.status === selectedStatus);
  };

  const renderStudentSummary = (summary: StudentSummary) => (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-pink-500/20 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-xl font-medium text-gray-200 mb-2">{summary.name}</h3>
          <p className="text-gray-400">Roll No: {summary.rollNo}</p>
          <p className="text-gray-400 mt-1">
            Total Days (Excluding Internal OD): {summary.totalDays}
          </p>
          <p className="text-gray-400 mt-1">
            Internal OD Days: {summary.odCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="w-full max-w-[300px] mx-auto">
          {renderPieChart(
            [
              summary.presentCount,
              summary.absentCount,
              summary.leaveCount,
              summary.odCount,
              summary.lateCount,
            ],
            ['Present', 'Absent', 'Leave', 'On Duty', 'Late'],
            ['#22c55e', '#ef4444', '#eab308', '#a855f7', '#f97316']
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Present</p>
            <p className="text-xl text-green-200">{summary.presentCount}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Absent</p>
            <p className="text-xl text-red-500">{summary.absentCount}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Leave</p>
            <p className="text-xl text-yellow-500">{summary.leaveCount}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <p className="text-sm text-gray-400">On Duty</p>
            <p className="text-xl text-purple-500">{summary.odCount}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Late</p>
            <p className="text-xl text-orange-500">{summary.lateCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-medium mb-4 text-white">Attendance story</h4>
        <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700/30">
                <th className="py-2 px-2 text-gray-400 w-[30%]">Date</th>
                <th className="py-2 px-2 text-gray-400 w-[70%]">Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.attendanceDates.map((record, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-800/30"
                >
                  <td className="py-2 px-2 text-gray-300 whitespace-nowrap">
                    {new Date(record.date).toLocaleDateString('en-GB')}
                  </td>
                  <td className="py-2 px-2">
                    <span className={`inline-block px-2 py-1 rounded text-sm ${
                      record.status === 'Present' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      record.status === 'Absent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      record.status === 'Leave' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      record.status === 'On Duty' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const handleDelete = async (recordId: string) => {
    setDeleteConfirmation({ isOpen: true, recordId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.recordId) return;

    try {
      const response = await fetch(`${API_URL}/api/${deleteConfirmation.recordId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete attendance record');
      }

      setRecords(prevRecords => prevRecords.filter(record => record._id !== deleteConfirmation.recordId));
      setFilteredRecords(prevRecords => prevRecords.filter(record => record._id !== deleteConfirmation.recordId));
      setSelectedRecord(null);
      showNotification('Record deleted successfully!', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Failed to delete record. Please try again.', 'error');
    } finally {
      setDeleteConfirmation({ isOpen: false, recordId: null });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0f1a] bg-mesh p-4 sm:p-6">
      {/* Header with navigation buttons */}
      <div className="flex justify-end items-center gap-4 mb-6">
              <button
          onClick={() => navigate('/')}
          className="bg-[#11111b]/50 text-indigo-300 border border-indigo-500/20 px-4 py-2 rounded-lg 
            hover:bg-indigo-500/20 transition-all duration-200"
              >
          Back to Dashboard
              </button>
              <button
          onClick={handleLogout}
          className="button-gradient text-white px-6 py-2 rounded-lg hover-glow whitespace-nowrap"
              >
          Exit History
              </button>
            </div>

      {/* Notification Toast */}
      <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 right-4 z-50 glass-effect rounded-lg px-6 py-3 text-white"
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </motion.svg>
              ) : (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </motion.svg>
            )}
            <span>{notification.message}</span>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
      {deleteConfirmation.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md mx-4"
          >
            <div className="gradient-border">
              <div className="glass-effect p-6 rounded-xl relative">
                <div className="spotlight"></div>
                <h3 className="text-xl font-medium text-gradient mb-4">Delete Attendance Record</h3>
                <p className="text-gray-300 mb-6">Are you sure you want to delete this attendance record? This action cannot be undone.</p>
          <div className="flex gap-4">
            <button
                    onClick={() => setDeleteConfirmation({ isOpen: false, recordId: null })}
                    className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 px-4 py-2 rounded-lg transition-all duration-200"
            >
                    Cancel
            </button>
            <button
                    onClick={confirmDelete}
                    className="flex-1 button-gradient text-white px-4 py-2 rounded-lg hover-glow"
            >
                    Delete
            </button>
          </div>
        </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-col sm:flex-row gap-4"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-center sm:text-left">
            <span className="text-white">Attendance History</span>
          </h1>
        </motion.div>

        <div className="mb-6 space-y-4">
          <div className="gradient-border">
            <div className="glass-effect p-6 rounded-xl relative">
              <div className="spotlight"></div>
              <form onSubmit={handleDateSearch} className="flex gap-4 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-indigo-300 text-sm font-medium mb-2">
                Search by Date
              </label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full bg-[#11111b]/50 text-white border border-indigo-500/20 rounded-lg px-4 py-2
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <button
              type="submit"
                  className="button-gradient text-white px-6 py-2 rounded-lg hover-glow whitespace-nowrap"
            >
              Search Date
            </button>
          </form>

              <div className="mt-4 flex gap-4 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-indigo-300 text-sm font-medium mb-2">
                Search by Student Name
              </label>
              <input
                type="text"
                value={searchName}
                onChange={handleNameSearch}
                placeholder="Enter student name..."
                    className="w-full bg-[#11111b]/50 text-white border border-indigo-500/20 rounded-lg px-4 py-2
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all
                      placeholder-indigo-300/50"
              />
            </div>
            <button
              type="button"
              onClick={handleReset}
                  className="bg-[#11111b]/50 text-indigo-300 border border-indigo-500/20 px-6 py-2 rounded-lg 
                    hover:bg-indigo-500/20 transition-all duration-200"
            >
              Reset All
            </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center p-8"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-[#45caff] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-400">Loading...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-border"
          >
            <div className="glass-effect p-6 rounded-xl text-center">
              <p className="text-red-400">{error}</p>
          </div>
          </motion.div>
        ) : (
          <>
            {studentSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="gradient-border mb-6"
              >
                <div className="glass-effect p-6 rounded-xl relative">
                  <div className="spotlight"></div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                      <h3 className="text-xl font-medium text-gradient mb-2">{studentSummary.name}</h3>
                      <p className="text-gray-400">Roll No: {studentSummary.rollNo}</p>
                      <p className="text-gray-400 mt-1">Total Days: {studentSummary.totalDays}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full max-w-[300px] mx-auto bg-gray-900/50 p-4 rounded-lg">
                      {renderPieChart(
                        [
                          studentSummary.presentCount,
                          studentSummary.absentCount,
                          studentSummary.leaveCount,
                          studentSummary.odCount,
                          studentSummary.lateCount,
                        ],
                        ['Present', 'Absent', 'Leave', 'On Duty', 'Late'],
                        ['#22c55e', '#ef4444', '#eab308', '#a855f7', '#f97316']
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Present', count: studentSummary.presentCount, color: chartColors.present },
                        { label: 'Absent', count: studentSummary.absentCount, color: chartColors.absent },
                        { label: 'Leave', count: studentSummary.leaveCount, color: chartColors.leave },
                        { label: 'On Duty', count: studentSummary.odCount, color: chartColors.od },
                        { label: 'Late', count: studentSummary.lateCount, color: chartColors.late }
                      ].map(({ label, count, color }) => (
                        <div key={label} className="glass-effect p-4 rounded-lg">
                          <p className="text-sm text-indigo-300">{label}</p>
                          <p className="text-xl" style={{ color }}>{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-white mb-4">Attendance History</h4>
                    <div className="glass-effect p-4 rounded-lg overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-700/30">
                            <th className="py-2 px-2 text-gray-400 w-[30%]">Date</th>
                            <th className="py-2 px-2 text-gray-400 w-[70%]">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentSummary.attendanceDates.map((record, index) => (
                            <motion.tr
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-gray-800/30"
                            >
                              <td className="py-2 px-2 text-gray-300 whitespace-nowrap">
                                {new Date(record.date).toLocaleDateString('en-GB')}
                              </td>
                              <td className="py-2 px-2">
                                <span className={`inline-block px-2 py-1 rounded text-sm ${
                                  record.status === 'Present' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                  record.status === 'Absent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                  record.status === 'Leave' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                  record.status === 'On Duty' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                  'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                }`}>
                                  {record.status}
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {filteredRecords.length > 0 ? (
              <div className="space-y-6">
                {filteredRecords.map((record, index) => (
                  <motion.div
                    key={record._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="gradient-border"
                  >
                    <div className="glass-effect p-6 rounded-xl relative">
                      <div className="spotlight"></div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h3 className="text-xl font-medium text-gradient">
                        {new Date(record.date).toLocaleDateString('en-GB')}
                      </h3>
                        <button
                          onClick={() => handleDelete(record._id)}
                        className="button-gradient text-white px-4 py-2 rounded-lg hover-glow"
                        >
                          Delete
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="w-full max-w-[300px] mx-auto bg-gray-900/50 p-4 rounded-lg">
                        {renderPieChart(
                          [
                            record.presentCount,
                            record.absentCount,
                            record.leaveCount,
                            record.odCount,
                            record.lateCount,
                          ],
                          ['Present', 'Absent', 'Leave', 'On Duty', 'Late'],
                          ['#22c55e', '#ef4444', '#eab308', '#a855f7', '#f97316']
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Present', count: record.presentCount, color: chartColors.present, status: 'Present' },
                            { label: 'Absent', count: record.absentCount, color: chartColors.absent, status: 'Absent' },
                            { label: 'Leave', count: record.leaveCount, color: chartColors.leave, status: 'Leave' },
                            { label: 'On Duty', count: record.odCount, color: chartColors.od, status: 'On Duty' },
                            { label: 'Late', count: record.lateCount, color: chartColors.late, status: 'Late' }
                          ].map(({ label, count, color, status }) => (
                            <button
                              key={label}
                              onClick={() => handleStatusClick(status, record)}
                              className={`glass-effect p-4 rounded-lg transition-all duration-200 hover:ring-2 hover:ring-indigo-500/50 
                                ${selectedStatus === status && selectedRecord?._id === record._id ? 'ring-2 ring-indigo-500' : ''}`}
                            >
                              <p className="text-sm text-indigo-300">{label}</p>
                              <p className="text-xl" style={{ color }}>{count}</p>
                            </button>
                          ))}
                      </div>
                    </div>

                    {selectedRecord?._id === record._id && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6"
                        >
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-medium text-gradient">
                              {selectedStatus ? `${selectedStatus} Students` : 'All Students'}
                            </h4>
                          <button
                            onClick={() => {
                              setSelectedRecord(null);
                              setSelectedStatus(null);
                            }}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            Close
                          </button>
                        </div>
                          <div className="glass-effect p-4 rounded-lg overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-gray-700/30">
                                  <th className="py-2 px-2 text-gray-400 w-[25%]">Roll No</th>
                                  <th className="py-2 px-2 text-gray-400 w-[45%]">Name</th>
                                  <th className="py-2 px-2 text-gray-400 w-[30%]">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getFilteredStudentsByStatus(record).map((student) => (
                                  <motion.tr
                                    key={student.studentId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="border-b border-gray-800/30"
                                  >
                                    <td className="py-2 px-2 text-gray-300 whitespace-nowrap">{student.rollNo}</td>
                                    <td className="py-2 px-2 text-gray-300 truncate max-w-[200px]">{student.name}</td>
                                    <td className="py-2 px-2">
                                      <span className={`inline-block px-2 py-1 rounded text-sm ${
                                        student.status === 'Present' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                        student.status === 'Absent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                        student.status === 'Leave' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                        student.status === 'On Duty' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                        'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                      }`}>
                                        {student.status}
                                      </span>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                    )}
                  </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-gray-400"
              >
                No attendance records found
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Attendance;
