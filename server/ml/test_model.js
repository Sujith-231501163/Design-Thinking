const fs = require('fs');
const path = require('path');
const predictor = require('./predictor.js');

const studentsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/students.json'), 'utf8'));

console.log('--- EduShield ML Prediction Engine Test ---');
console.log('Model Info:', predictor.getModelInfo());
console.log('\nRunning predictions on batch data...\n');

const results = predictor.predictBatch(studentsData);

console.log('Results:');
results.forEach(student => {
  console.log(`Student ID: ${student.id} | Name: ${student.name}`);
  console.log(`  Attendance: ${student.attendance}% | CGPA: ${student.cgpa} | Financial: ${student.financial_status}`);
  console.log(`  -> Predicted Risk: ${student.risk_level} (Confidence: ${student.risk_confidence * 100}%)`);
  if (student.risk_reasons.length > 0) {
    console.log(`  -> Reasons: ${student.risk_reasons.join(', ')}`);
  }
  console.log('----------------------------------------------------');
});
