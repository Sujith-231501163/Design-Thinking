/**
 * EduShield Server — MongoDB Atlas version
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db/connection');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', apiRoutes);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║                                              ║
  ║   🛡️  EduShield Server Running               ║
  ║   🍃 MongoDB Atlas Connected                 ║
  ║                                              ║
  ║   Local:  http://localhost:${PORT}              ║
  ║                                              ║
  ║   Faculty Login:  faculty1 / admin123        ║
  ║   Student Login:  student1 / pass123         ║
  ║                                              ║
  ╚══════════════════════════════════════════════╝
    `);
  });
});
