const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  attendance: { type: Number, required: true, min: 0, max: 100 },
  marks: { type: Number, default: 0, min: 0, max: 100 },
  cgpa: { type: Number, required: true, min: 0, max: 10 },
  financial_status: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  risk_level: { type: String, enum: ['Low', 'Medium', 'High', 'Pending'], default: 'Pending' },
  risk_confidence: { type: Number, default: 0 },
  risk_reasons: { type: [String], default: [] },
  semester: { type: Number, default: 1 },
  department: { type: String, default: 'General' },
  last_updated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
