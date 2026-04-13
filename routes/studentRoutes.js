const express = require("express");
const router = express.Router();
const Student = require("../models/Student");


// ➕ Add Student
router.post("/", async (req, res) => {
  const student = new Student({ name: req.body.name });
  await student.save();
  res.json(student);
});


// 📥 Get Students (date-wise)
router.get("/", async (req, res) => {
  const { date } = req.query;

  const students = await Student.find();

  const result = students.map(s => {
    const record = s.attendance.find(a => a.date === date);

    return {
      _id: s._id,
      name: s.name,
      isPresent: record ? record.isPresent : false
    };
  });

  res.json(result);
});


// ❌ Delete Student
router.delete("/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});


// ✔ Toggle Attendance (date-wise)
router.put("/:id", async (req, res) => {
  const { date } = req.body;

  const student = await Student.findById(req.params.id);

  let record = student.attendance.find(a => a.date === date);

  if (record) {
    record.isPresent = !record.isPresent;
  } else {
    student.attendance.push({ date, isPresent: true });
  }

  await student.save();
  res.json(student);
});

router.get("/dates", async (req, res) => {
  const students = await Student.find();

  let dates = new Set();

  students.forEach(s => {
    s.attendance.forEach(a => {
      dates.add(a.date);
    });
  });

  res.json([...dates]);
});

router.get("/report", async (req, res) => {
  const students = await Student.find();

  const report = students.map(s => {
    const total = s.attendance.length;
    const present = s.attendance.filter(a => a.isPresent).length;

    const percentage = total === 0 ? 0 : ((present / total) * 100).toFixed(1);

    return {
      name: s.name,
      percentage
    };
  });

  res.json(report);
});

module.exports = router;