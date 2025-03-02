const mongoose = require('mongoose');

const attendanceCountSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    default: Date.now
  },
  presentCount: {
    type: Number,
    required: true,
    default: 0
  },
  absentCount: {
    type: Number,
    required: true,
    default: 0
  },
  leaveCount: {
    type: Number,
    required: true,
    default: 0
  },
  odInternalCount: {
    type: Number,
    required: true,
    default: 0
  },
  odExternalCount: {
    type: Number,
    required: true,
    default: 0
  },
  totalStudents: {
    type: Number,
    required: true
  },
  studentRecords: [{
    studentId: String,
    rollNo: String,
    name: String,
    status: String
  }],
  // Store the actual attendance data for reference
  attendanceData: {
    type: String,  // Will store the formatted attendance summary
    required: true
  }
}, {
  timestamps: true
});

// Consolidated indexes
attendanceCountSchema.index({ date: 1 });
attendanceCountSchema.index({ 'studentRecords.name': 1 });
attendanceCountSchema.index({ 'studentRecords.rollNo': 1 });

const AttendanceCount = mongoose.model('AttendanceCount', attendanceCountSchema);

module.exports = AttendanceCount;
