/**
 * Seed script — drops stale indexes, then populates MongoDB
 */
const mongoose = require('mongoose');
const connectDB = require('./connection');
const Student = require('./models/Student');
const User = require('./models/User');

const studentsData = [
  { id:"STU001",name:"Aarav Sharma",email:"aarav@student.edu",attendance:92,marks:88,cgpa:8.7,financial_status:"High",risk_level:"Low",risk_confidence:0.91,risk_reasons:[],semester:5,department:"Computer Science" },
  { id:"STU002",name:"Priya Patel",email:"priya@student.edu",attendance:55,marks:42,cgpa:4.8,financial_status:"Low",risk_level:"High",risk_confidence:0.95,risk_reasons:["Low attendance","Low CGPA","Financial difficulty"],semester:3,department:"Electronics" },
  { id:"STU003",name:"Rohan Mehta",email:"rohan@student.edu",attendance:68,marks:61,cgpa:6.2,financial_status:"Medium",risk_level:"Medium",risk_confidence:0.73,risk_reasons:["Moderate attendance"],semester:4,department:"Mechanical" },
  { id:"STU004",name:"Sneha Reddy",email:"sneha@student.edu",attendance:88,marks:82,cgpa:7.9,financial_status:"High",risk_level:"Low",risk_confidence:0.87,risk_reasons:[],semester:6,department:"Computer Science" },
  { id:"STU005",name:"Vikram Singh",email:"vikram@student.edu",attendance:45,marks:35,cgpa:3.9,financial_status:"Low",risk_level:"High",risk_confidence:0.97,risk_reasons:["Low attendance","Low CGPA","Financial difficulty"],semester:2,department:"Civil" },
  { id:"STU006",name:"Ananya Iyer",email:"ananya@student.edu",attendance:73,marks:58,cgpa:5.5,financial_status:"Medium",risk_level:"Medium",risk_confidence:0.68,risk_reasons:["Moderate attendance","Below average CGPA"],semester:3,department:"Electronics" },
  { id:"STU007",name:"Karthik Nair",email:"karthik@student.edu",attendance:95,marks:93,cgpa:9.1,financial_status:"High",risk_level:"Low",risk_confidence:0.96,risk_reasons:[],semester:7,department:"Computer Science" },
  { id:"STU008",name:"Meera Joshi",email:"meera@student.edu",attendance:52,marks:48,cgpa:5.1,financial_status:"Low",risk_level:"High",risk_confidence:0.89,risk_reasons:["Low attendance","Financial difficulty"],semester:4,department:"Mechanical" },
  { id:"STU009",name:"Arjun Desai",email:"arjun@student.edu",attendance:78,marks:74,cgpa:7.3,financial_status:"Medium",risk_level:"Low",risk_confidence:0.62,risk_reasons:[],semester:5,department:"Civil" },
  { id:"STU010",name:"Divya Kulkarni",email:"divya@student.edu",attendance:61,marks:65,cgpa:6.8,financial_status:"Medium",risk_level:"Medium",risk_confidence:0.58,risk_reasons:["Moderate attendance"],semester:6,department:"Electronics" }
];

const usersData = [
  { name:"Dr. Rajesh Kumar",email:"rajesh@admin.com",password:"admin123",role:"teacher" },
  { name:"Prof. Sunita Verma",email:"sunita@admin.com",password:"admin123",role:"teacher" },
  { name:"Aarav Sharma",email:"aarav@student.edu",password:"pass123",role:"student",studentId:"STU001" },
  { name:"Priya Patel",email:"priya@student.edu",password:"pass123",role:"student",studentId:"STU002" },
  { name:"Vikram Singh",email:"vikram@student.edu",password:"pass123",role:"student",studentId:"STU005" }
];

async function seed() {
  await connectDB();

  // Drop old collections to clear stale indexes
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    await mongoose.connection.db.dropCollection(col.name);
  }
  console.log('  🗑️  Dropped all collections (clean slate)');

  await Student.insertMany(studentsData);
  console.log(`  📚 Inserted ${studentsData.length} students`);

  for (const u of usersData) {
    await User.create(u);
  }
  console.log(`  👤 Inserted ${usersData.length} users (passwords hashed)`);
  console.log('  ✅ Seed complete!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
