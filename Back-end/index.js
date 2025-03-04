const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

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

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});

const User = mongoose.model("User", userSchema);

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  presentCount: { type: Number, required: true },
  absentCount: { type: Number, required: true },
  leaveCount: { type: Number, required: true },
  odInternalCount: { type: Number, required: true },
  odExternalCount: { type: Number, required: true },
  lateCount: { type: Number, required: true },
  totalStudents: { type: Number, required: true },
  attendanceData: { type: String, required: true },
  studentRecords: [{
    studentId: String,
    rollNo: String,
    name: String,
    status: String
  }]
});

const AttendanceCount = mongoose.model("AttendanceCount", attendanceSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }
    req.user = user;
    next();
  });
};

// Authentication Routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected Routes
app.get("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Save daily attendance count
app.post('/api/', authenticateToken, async (req, res) => {
  try {
    const {
      presentCount,
      absentCount,
      leaveCount,
      odInternalCount,
      odExternalCount,
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
      odInternalCount,
      odExternalCount,
      lateCount,
      totalStudents,
      attendanceData,
      studentRecords
    });
    
    const savedRecord = await attendanceCount.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get attendance history
app.get('/api/', authenticateToken, async (req, res) => {
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
    console.error('Fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get attendance for a specific date
app.get('/api/:date', authenticateToken, async (req, res) => {
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
    console.error('Date fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete attendance record
app.delete('/api/:id', authenticateToken, async (req, res) => {
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

// Create default admin user if not exists
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

createDefaultAdmin();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
