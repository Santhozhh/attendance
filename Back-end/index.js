const express = require('express');
const cors = require('cors');
const connectDB = require('./config');
const AttendanceCount = require('./schema');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://attendance-1-xcfw.onrender.com',
    'http://localhost:5173',
    'https://attendance-v875.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes

// Save daily attendance count
app.post('/api/', async (req, res) => {
  try {
    const {
      presentCount,
      absentCount,
      leaveCount,
      odCount,
      lateCount,
      totalStudents,
      attendanceData,
      studentRecords
    } = req.body;

    // Create new attendance record
    const attendanceCount = new AttendanceCount({
      presentCount,
      absentCount,
      leaveCount,
      odCount,
      lateCount,
      totalStudents,
      attendanceData,
      studentRecords
    });
    
    const savedRecord = await attendanceCount.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance history with optional date range
app.get('/api/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const records = await AttendanceCount.find(query)
      .sort({ date: -1 })
      .limit(30);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student attendance history
app.get('/api/student', async (req, res) => {
  try {
    const { name, rollNo } = req.query;
    let query = {};

    if (name) {
      query['studentRecords.name'] = { $regex: name, $options: 'i' };
    }
    if (rollNo) {
      query['studentRecords.rollNo'] = rollNo;
    }

    const records = await AttendanceCount.find(query).sort({ date: -1 });

    if (records.length === 0) {
      return res.status(404).json({ message: 'No records found for this student' });
    }

    // Calculate statistics
    const studentStats = {
      totalDays: records.length,
      presentDays: 0,
      absentDays: 0,
      leaveDays: 0,
      odDays: 0,
      lateDays: 0,
      dates: {
        present: [],
        absent: [],
        leave: [],
        od: [],
        late: []
      }
    };

    records.forEach(record => {
      const studentRecord = record.studentRecords.find(sr => 
        (name && sr.name.toLowerCase().includes(name.toLowerCase())) || 
        (rollNo && sr.rollNo === rollNo)
      );

      if (studentRecord) {
        const date = record.date.toLocaleDateString();
        switch (studentRecord.status) {
          case 'Present':
            studentStats.presentDays++;
            studentStats.dates.present.push(date);
            break;
          case 'Absent':
            studentStats.absentDays++;
            studentStats.dates.absent.push(date);
            break;
          case 'Leave':
            studentStats.leaveDays++;
            studentStats.dates.leave.push(date);
            break;
          case 'On Duty':
            studentStats.odDays++;
            studentStats.dates.od.push(date);
            break;
          case 'Late':
            studentStats.lateDays++;
            studentStats.dates.late.push(date);
            break;
        }
      }
    });

    res.json({
      studentInfo: records[0].studentRecords.find(sr => 
        (name && sr.name.toLowerCase().includes(name.toLowerCase())) || 
        (rollNo && sr.rollNo === rollNo)
      ),
      statistics: studentStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance for a specific date
app.get('/api/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const record = await AttendanceCount.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
    
    if (!record) {
      return res.status(404).json({ message: 'No record found for this date' });
    }
    
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance statistics
app.get('/api/stats/summary', async (req, res) => {
  try {
    const stats = await AttendanceCount.aggregate([
      {
        $group: {
          _id: null,
          avgPresent: { $avg: '$presentCount' },
          avgAbsent: { $avg: '$absentCount' },
          avgLeave: { $avg: '$leaveCount' },
          avgOD: { $avg: '$odCount' },
          totalDays: { $sum: 1 }
        }
      }
    ]);
    
    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete attendance record
app.delete('/api/:id', async (req, res) => {
  try {
    const record = await AttendanceCount.findByIdAndDelete(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
