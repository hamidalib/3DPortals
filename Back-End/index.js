const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.static("static"));

// Multer configuration for file upload
const upload = multer({ dest: "uploads/" });

// MongoDB Connection - Updated with proper options
mongoose
  .connect("mongodb://127.0.0.1:27017/students_data", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Rest of the code remains the same
const studentSchema = new mongoose.Schema({
  name: String,
  age: Number,
  class: String,
  group: String,
  city: String,
});

const Student = mongoose.model("Student", studentSchema, "students");

// Add User Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// Routes
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ _id: -1 });
    console.log("Retrieved students:", students);
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    console.log("Received student data:", req.body);
    const student = new Student(req.body);
    const savedStudent = await student.save();
    console.log("Saved student:", savedStudent);
    res.status(201).json(savedStudent);
  } catch (error) {
    console.error("Error saving student:", error);
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    console.log("Attempting to delete student with ID:", req.params.id);
    const result = await Student.findByIdAndDelete(req.params.id);

    if (!result) {
      console.log("Student not found");
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("Student deleted successfully:", result);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add new route for file upload
app.post("/api/students/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const students = [];
    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();

    if (fileExtension === "csv") {
      // Handle CSV file
      const results = [];
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          try {
            // Convert and validate data
            const students = results.map((row) => ({
              name: row.name || row.Name,
              age: parseInt(row.age || row.Age),
              class: row.class || row.Class,
              group: row.group || row.Group,
              city: row.city || row.City,
            }));

            // Save to database
            const savedStudents = await Student.insertMany(students);

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);

            res.json(savedStudents);
          } catch (error) {
            console.error("Error processing CSV:", error);
            res.status(500).json({ message: error.message });
          }
        });
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      // Handle Excel file
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      // Convert and validate data
      const students = data.map((row) => ({
        name: row.name || row.Name,
        age: parseInt(row.age || row.Age),
        class: row.class || row.Class,
        group: row.group || row.Group,
        city: row.city || row.City,
      }));

      // Save to database
      const savedStudents = await Student.insertMany(students);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json(savedStudents);
    } else {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Invalid file format" });
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
});

// Login route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email); // Debug log

    const user = await User.findOne({ email });
    console.log("User found:", user ? "yes" : "no"); // Debug log

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch); // Debug log

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error); // Debug log
    res.status(500).json({ message: error.message });
  }
});

// Setup route to create test user
app.get("/api/setup", async (req, res) => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: "test@example.com" });

    if (existingUser) {
      return res.json({ message: "Test user already exists" });
    }

    // Create hashed password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create test user
    const testUser = await User.create({
      email: "test@example.com",
      password: hashedPassword,
    });

    res.json({
      message: "Test user created successfully",
      user: testUser.email,
    });
  } catch (error) {
    console.error("Setup error:", error); // Debug log
    res.status(500).json({ message: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
