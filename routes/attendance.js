const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const pool = require('../db');

// All routes now require authentication
router.use(authMiddleware);

// Get all students with attendance
router.get('/attendance', async (req, res) => {
  const { date, division } = req.query;
  const teacherId = req.user.id;
  
  try {
    const query = `
      SELECT s.sr_no, s.roll_no, s.name, s.division, 
             a.status, a.date, a.professor_name
      FROM students s
      LEFT JOIN attendance a ON s.sr_no = a.student_id 
        AND a.date = $1 AND a.division = $2 AND a.teacher_id = $4
      WHERE s.division = $2
      ORDER BY s.roll_no;
    `;
    
    const result = await pool.query(query, [date, division, teacherId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit attendance
router.post('/attendance', async (req, res) => {
  const { date, professor_name, division, attendance_data } = req.body;
  const teacherId = req.user.id;
  
  try {
    await pool.query('BEGIN');
    
    await pool.query(
      'DELETE FROM attendance WHERE date = $1 AND division = $2 AND teacher_id = $3',
      [date, division, teacherId]
    );
    
    for (const record of attendance_data) {
      await pool.query(
        `INSERT INTO attendance (date, professor_name, division, student_id, status, teacher_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [date, professor_name, division, record.sr_no, record.status, teacherId]
      );
    }
    
    await pool.query('COMMIT');
    res.json({ message: 'Attendance saved successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to save attendance' });
  }
});

// Add new student (teachers only)
router.post('/students', roleMiddleware(['teacher', 'admin']), async (req, res) => {
  const { roll_no, name, division } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO students (roll_no, name, division) 
       VALUES ($1, $2, $3) RETURNING *`,
      [roll_no, name, division]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// Get all divisions for current teacher
router.get('/divisions', async (req, res) => {
  const teacherId = req.user.id;
  
  try {
    const result = await pool.query(
      `SELECT DISTINCT s.division 
       FROM students s
       LEFT JOIN attendance a ON s.division = a.division AND a.teacher_id = $1
       WHERE a.teacher_id = $1 OR s.division IN (SELECT DISTINCT division FROM attendance WHERE teacher_id = $1)
       ORDER BY s.division`,
      [teacherId]
    );
    res.json(result.rows.map(row => row.division));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get teacher's attendance history
router.get('/history', async (req, res) => {
  const teacherId = req.user.id;
  
  try {
    const result = await pool.query(
      `SELECT DISTINCT date, professor_name, division, 
              COUNT(*) FILTER (WHERE status = 'present') as present_count,
              COUNT(*) as total_students
       FROM attendance 
       WHERE teacher_id = $1 
       GROUP BY date, professor_name, division
       ORDER BY date DESC`,
      [teacherId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;