const hamid = require("express");
const mongoose = require("mongoose"); //ORM (Object Relational Model)
const app = hamid();
const port = 3300;

app.use(hamid.json());

//Creating the schemas
// How the studenty collection looks like in database,
// We are mapping it here ...
const studentSchema = new mongoose.Schema({
  name: String,
  age: Number,
  class: Number,
  group: String,
  city: String,
});

const student = mongoose.model("student", studentSchema);

// Replace with your MongoDB connection string
const mongoURI = "mongodb://127.0.0.1:27017/3dportals"; // Use '127.0.0.1' instead of 'localhost' for compatibility

// Connect to the database
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check the connection
const db = mongoose.connection;

// Event listeners for the connection
db.on("connected", function () {
  console.log("MongoDB connected successfully");
});

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

db.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// <GET>=for getting the info, <POST> = For th insertion., <DELETE>, <PATCH>, <PUT> = for the update
// >REST API
app.get("/student", async (req, res) => {
  const students = await student.find({});
  res.json(students);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
