// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000; // Render uses dynamic ports

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // serve index.html and frontend files

// Data file
const dataFile = "./students.json";
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, "[]");
}

// Helper: Read + Write JSON safely
function readStudents() {
  return JSON.parse(fs.readFileSync(dataFile, "utf-8"));
}
function writeStudents(students) {
  fs.writeFileSync(dataFile, JSON.stringify(students, null, 2));
}

// 🟢 GET all students
app.get("/students", (req, res) => {
  const students = readStudents();
  res.json(students);
});

// 🟢 POST add new student
app.post("/students", (req, res) => {
  const newStudent = req.body;
  if (!newStudent.studentId || !newStudent.fullName || !newStudent.gmail) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const students = readStudents();
  const exists = students.some(s => String(s.studentId) === String(newStudent.studentId));
  if (exists) {
    return res.status(409).json({ error: "Student ID already exists" });
  }

  students.push(newStudent);
  writeStudents(students);
  res.json({ message: "Student added successfully" });
});

// 🗑️ DELETE student by ID
app.delete("/students/:id", (req, res) => {
  const id = req.params.id;
  let students = readStudents();
  const index = students.findIndex(s => String(s.studentId) === String(id));

  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  students.splice(index, 1);
  writeStudents(students);
  res.json({ message: "Deleted successfully" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
