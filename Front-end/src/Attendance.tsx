import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);



interface AttendanceRecord {
  _id: string;
  date: string;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  odInternalCount: number;
  odExternalCount: number;
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
  odInternalCount: number;
  odExternalCount: number;
  lateCount: number;
  totalDays: number;
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
          odInternalCount: 0,
          odExternalCount: 0,
          lateCount: 0,
          totalDays: filtered.length,
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
              case 'OD (Internal)':
                summary.odInternalCount++;
                break;
              case 'OD (External)':
                summary.odExternalCount++;
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

        setStudentSummary(summary);
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
        ? `/api/${date}`
        : '/api/';
        
      const response = await fetch(url);
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
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
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
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };

    return <Pie data={chartData} options={options} />;
  };

  const renderStudentSummary = (summary: StudentSummary) => (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-pink-500/20 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-xl font-medium text-gray-200 mb-2">{summary.name}</h3>
          <p className="text-gray-400">Roll No: {summary.rollNo}</p>
          <p className="text-gray-400 mt-1">Total Days: {summary.totalDays}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="w-full max-w-[300px] mx-auto">
          {renderPieChart(
            [
              summary.presentCount,
              summary.absentCount,
              summary.leaveCount,
              summary.odInternalCount,
              summary.odExternalCount,
              summary.lateCount,
            ],
            ['Present', 'Absent', 'Leave', 'OD (Internal)', 'OD (External)', 'Late'],
            ['#22c55e', '#ef4444', '#eab308', '#a855f7', '#7e22ce', '#f97316']
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Present</p>
            <p className="text-xl text-green-500">{summary.presentCount}</p>
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
            <p className="text-sm text-gray-400">OD (Internal)</p>
            <p className="text-xl text-purple-500">{summary.odInternalCount}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <p className="text-sm text-gray-400">OD (External)</p>
            <p className="text-xl text-purple-500">{summary.odExternalCount}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Late</p>
            <p className="text-xl text-orange-500">{summary.lateCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-medium text-gray-300 mb-4">Attendance History</h4>
        <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-4 text-gray-400">Date</th>
                <th className="py-2 px-4 text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.attendanceDates.map((record, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="py-2 px-4 text-gray-300">
                    {new Date(record.date).toLocaleDateString('en-GB')}
                  </td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      record.status === 'Present' ? 'bg-green-500/20 text-green-500' :
                      record.status === 'Absent' ? 'bg-red-500/20 text-red-500' :
                      record.status === 'Leave' ? 'bg-yellow-500/20 text-yellow-500' :
                      record.status === 'OD (Internal)' ? 'bg-purple-500/20 text-purple-500' :
                      record.status === 'OD (External)' ? 'bg-purple-500/20 text-purple-500' :
                      'bg-orange-500/20 text-orange-500'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full p-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Attendance History
          </h1>
          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <form onSubmit={handleDateSearch} className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Search by Date
              </label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2
                  focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Search Date
            </button>
          </form>

          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Search by Student Name
              </label>
              <input
                type="text"
                value={searchName}
                onChange={handleNameSearch}
                placeholder="Enter student name..."
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2
                  focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-400">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {studentSummary && renderStudentSummary(studentSummary)}
            
            {filteredRecords.length > 0 ? (
              <div className="space-y-6">
                {filteredRecords.map((record) => (
                  <div key={record._id} className="bg-gray-800 rounded-xl p-6 shadow-lg border border-pink-500/20">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-200">
                        {new Date(record.date).toLocaleDateString('en-GB')}
                      </h3>
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="w-full max-w-[300px] mx-auto">
                        {renderPieChart(
                          [
                            record.presentCount,
                            record.absentCount,
                            record.leaveCount,
                            record.odInternalCount,
                            record.odExternalCount,
                            record.lateCount,
                          ],
                          ['Present', 'Absent', 'Leave', 'OD (Internal)', 'OD (External)', 'Late'],
                          ['#22c55e', '#ef4444', '#eab308', '#a855f7', '#7e22ce', '#f97316']
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <p className="text-sm text-gray-400">Present</p>
                          <p className="text-xl text-green-500">{record.presentCount}</p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <p className="text-sm text-gray-400">Absent</p>
                          <p className="text-xl text-red-500">{record.absentCount}</p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <p className="text-sm text-gray-400">Leave</p>
                          <p className="text-xl text-yellow-500">{record.leaveCount}</p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <p className="text-sm text-gray-400">OD (Internal)</p>
                          <p className="text-xl text-purple-500">{record.odInternalCount}</p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <p className="text-sm text-gray-400">OD (External)</p>
                          <p className="text-xl text-purple-500">{record.odExternalCount}</p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <p className="text-sm text-gray-400">Late</p>
                          <p className="text-xl text-orange-500">{record.lateCount}</p>
                        </div>
                      </div>
                    </div>

                    {selectedRecord === record && (
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-medium text-gray-300">Student Details</h4>
                          <button
                            onClick={() => setSelectedRecord(null)}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            Close
                          </button>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-gray-700">
                                  <th className="py-2 px-4 text-gray-400">Roll No</th>
                                  <th className="py-2 px-4 text-gray-400">Name</th>
                                  <th className="py-2 px-4 text-gray-400">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {record.studentRecords.map((student) => (
                                  <tr key={student.studentId} className="border-b border-gray-800">
                                    <td className="py-2 px-4 text-gray-300">{student.rollNo}</td>
                                    <td className="py-2 px-4 text-gray-300">{student.name}</td>
                                    <td className="py-2 px-4">
                                      <span className={`px-2 py-1 rounded text-sm ${
                                        student.status === 'Present' ? 'bg-green-500/20 text-green-500' :
                                        student.status === 'Absent' ? 'bg-red-500/20 text-red-500' :
                                        student.status === 'Leave' ? 'bg-yellow-500/20 text-yellow-500' :
                                        student.status === 'OD (Internal)' ? 'bg-purple-500/20 text-purple-500' :
                                        student.status === 'OD (External)' ? 'bg-purple-500/20 text-purple-500' :
                                        'bg-orange-500/20 text-orange-500'
                                      }`}>
                                        {student.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400">No attendance records found</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Attendance;
