/**
 * EduShield API Routes — Secured with JWT + Role-based access
 */
const express = require('express');
const router = express.Router();

const Student = require('../db/models/Student');
const User = require('../db/models/User');
const predictor = require('../ml/predictor');
const chatbot = require('../ml/chatbot');
const { generateToken, authenticate, teacherOnly } = require('../middleware/auth');

// ════════════════ AUTH ════════════════

router.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    // Role based on email domain
    const role = email.toLowerCase().endsWith('@admin.com') ? 'teacher' : 'student';

    const user = await User.create({ name, email: email.toLowerCase(), password, role });

    // If student role, link to a student record by email if one exists
    let studentId = null;
    if (role === 'student') {
      const studentRecord = await Student.findOne({ email: email.toLowerCase() });
      if (studentRecord) {
        user.studentId = studentRecord.id;
        await user.save();
        studentId = studentRecord.id;
      }
    }

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      token,
      user: { name: user.name, email: user.email, role: user.role, studentId }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: { name: user.name, email: user.email, role: user.role, studentId: user.studentId }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/auth/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// ════════════════ STUDENTS (Teacher CRUD) ════════════════

router.get('/students', authenticate, teacherOnly, async (req, res) => {
  try {
    const { risk, department, search } = req.query;
    const filter = {};
    if (risk) filter.risk_level = risk;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { id: { $regex: search, $options: 'i' } }
      ];
    }
    const students = await Student.find(filter).sort({ id: 1 }).lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/students', authenticate, teacherOnly, async (req, res) => {
  try {
    const { name, email, attendance, marks, cgpa, financial_status, semester, department } = req.body;

    const last = await Student.findOne().sort({ id: -1 }).lean();
    const maxNum = last ? parseInt(last.id.replace('STU', '')) : 0;
    const newId = `STU${String(maxNum + 1).padStart(3, '0')}`;

    const newStudent = {
      id: newId, name,
      email: email || `${name.toLowerCase().replace(/\s/g, '.')}@student.edu`,
      attendance: parseFloat(attendance),
      marks: parseFloat(marks) || 0,
      cgpa: parseFloat(cgpa),
      financial_status,
      semester: parseInt(semester) || 1,
      department: department || 'General',
      last_updated: new Date()
    };

    const prediction = predictor.predict(newStudent);
    Object.assign(newStudent, prediction);

    const doc = await Student.create(newStudent);

    // Auto-link if a user with this email exists
    if (newStudent.email) {
      await User.findOneAndUpdate(
        { email: newStudent.email.toLowerCase(), role: 'student' },
        { studentId: newId }
      );
    }

    res.status(201).json(doc.toObject());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/students/:id', authenticate, teacherOnly, async (req, res) => {
  try {
    const updates = { ...req.body, last_updated: new Date() };

    if (updates.attendance !== undefined || updates.cgpa !== undefined || updates.financial_status !== undefined) {
      const current = await Student.findOne({ id: req.params.id }).lean();
      if (!current) return res.status(404).json({ error: 'Student not found' });
      const merged = { ...current, ...updates };
      const prediction = predictor.predict(merged);
      Object.assign(updates, prediction);
    }

    const student = await Student.findOneAndUpdate(
      { id: req.params.id }, updates, { new: true, lean: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/students/:id', authenticate, teacherOnly, async (req, res) => {
  try {
    const result = await Student.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ error: 'Student not found' });
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════ STUDENT OWN DATA ════════════════

router.get('/my-data', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Students only' });
    if (!req.user.studentId) return res.status(404).json({ error: 'No student record linked. Contact your teacher.' });
    const student = await Student.findOne({ id: req.user.studentId }).lean();
    if (!student) return res.status(404).json({ error: 'Student record not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════ ML PREDICTION (Teacher only) ════════════════

router.post('/predict', authenticate, teacherOnly, async (req, res) => {
  try {
    const students = await Student.find().lean();
    const predicted = predictor.predictBatch(students);

    const bulkOps = predicted.map(s => ({
      updateOne: {
        filter: { id: s.id },
        update: { risk_level: s.risk_level, risk_confidence: s.risk_confidence, risk_reasons: s.risk_reasons, last_updated: s.last_updated }
      }
    }));
    await Student.bulkWrite(bulkOps);

    const updated = await Student.find().sort({ id: 1 }).lean();
    const stats = {
      total: updated.length,
      high: updated.filter(s => s.risk_level === 'High').length,
      medium: updated.filter(s => s.risk_level === 'Medium').length,
      low: updated.filter(s => s.risk_level === 'Low').length,
      timestamp: new Date().toISOString()
    };
    res.json({ success: true, students: updated, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════ ANALYTICS (Teacher only) ════════════════

router.get('/analytics', authenticate, teacherOnly, async (req, res) => {
  try {
    const students = await Student.find().lean();
    const riskDistribution = { High: 0, Medium: 0, Low: 0 };
    const departmentRisk = {};
    let totalAtt = 0, totalCGPA = 0;

    students.forEach(s => {
      riskDistribution[s.risk_level] = (riskDistribution[s.risk_level] || 0) + 1;
      if (!departmentRisk[s.department]) departmentRisk[s.department] = { High: 0, Medium: 0, Low: 0, total: 0 };
      departmentRisk[s.department][s.risk_level]++;
      departmentRisk[s.department].total++;
      totalAtt += s.attendance;
      totalCGPA += s.cgpa;
    });

    res.json({
      totalStudents: students.length,
      riskDistribution,
      departmentRisk,
      avgAttendance: students.length ? parseFloat((totalAtt / students.length).toFixed(1)) : 0,
      avgCGPA: students.length ? parseFloat((totalCGPA / students.length).toFixed(1)) : 0,
      attendanceVsRisk: students.map(s => ({ name: s.name, attendance: s.attendance, cgpa: s.cgpa, risk: s.risk_level })),
      highRiskStudents: students.filter(s => s.risk_level === 'High')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════ CHATBOT (Medium/High risk students only) ════════════════

router.post('/chatbot', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    let studentData = null;

    if (req.user.role === 'student' && req.user.studentId) {
      studentData = await Student.findOne({ id: req.user.studentId }).lean();
    }

    const response = chatbot.getResponse(message, studentData);
    response.chatEnabled = true;
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/chatbot/welcome', authenticate, async (req, res) => {
  try {
    let studentData = null;
    if (req.user.role === 'student' && req.user.studentId) {
      studentData = await Student.findOne({ id: req.user.studentId }).lean();
    }
    const response = chatbot.getWelcomeMessage(studentData);
    response.chatEnabled = true;
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
