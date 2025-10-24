// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // 👈 serve index.html and assets

// Load or create students.json
const dataFile = "./students.json";
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, "[]");
}

// Get all students
app.get("/students", (req, res) => {
  const students = JSON.parse(fs.readFileSync(dataFile));
  res.json(students);
});

// Add a new student
app.post("/students", (req, res) => {
  const newStudent = req.body;
  const students = JSON.parse(fs.readFileSync(dataFile));
  students.push(newStudent);
  fs.writeFileSync(dataFile, JSON.stringify(students, null, 2));
  res.json({ message: "Student added successfully" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
  