const express = require('express');
const router = express.Router();

let students = [
  // No hardcoded students - teachers will add them
];

// GET /students
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: students.length,
    students: students
  });
});

// POST /students - add new student
router.post('/', (req, res) => {
  const { name, division, email, rollNumber } = req.body;
  
  if (!name || !division) {
    return res.status(400).json({
      success: false,
      error: 'Name and division are required'
    });
  }
  
  const newStudent = {
    id: Date.now(),
    name,
    division,
    email: email || '',
    rollNumber: rollNumber || '',
    createdAt: new Date().toISOString(),
    attendance: [] // Array to store attendance records
  };
  
  students.push(newStudent);
  
  res.status(201).json({
    success: true,
    message: 'Student added successfully',
    student: newStudent
  });
});

// PUT /students/:id - edit student details
router.put('/:id', (req, res) => {
  const studentId = parseInt(req.params.id);
  const { name, division, email, rollNumber } = req.body;
  
  const studentIndex = students.findIndex(s => s.id === studentId);
  
  if (studentIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Student not found'
    });
  }
  
  // Update only provided fields
  if (name) students[studentIndex].name = name;
  if (division) students[studentIndex].division = division;
  if (email !== undefined) students[studentIndex].email = email;
  if (rollNumber !== undefined) students[studentIndex].rollNumber = rollNumber;
  
  res.json({
    success: true,
    message: 'Student updated successfully',
    student: students[studentIndex]
  });
});

// DELETE /students/:id - remove student
router.delete('/:id', (req, res) => {
  const studentId = parseInt(req.params.id);
  const initialLength = students.length;
  
  students = students.filter(student => student.id !== studentId);
  
  if (students.length < initialLength) {
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Student not found'
    });
  }
});

// GET /students/:id/attendance - get student's attendance
router.get('/:id/attendance', (req, res) => {
  const studentId = parseInt(req.params.id);
  const student = students.find(s => s.id === studentId);
  
  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'Student not found'
    });
  }
  
  res.json({
    success: true,
    attendance: student.attendance || []
  });
});

module.exports = router;