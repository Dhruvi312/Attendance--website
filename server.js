const express = require('express');
const cors = require('cors');
const app = express();

// CORS - Allow your Vercel frontend
app.use(cors({
  origin: 'https://frontend-attenance-psf2-ixv1zrp6v-dhruvi-ohals-projects.vercel.app',
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Attendance Backend API is running!',
    endpoints: {
      health: '/api/health',
      students: '/api/students',
      markAttendance: 'POST /api/attendance'
    },
    frontend: 'https://frontend-attenance-psf2-ixv1zrp6v-dhruvi-ohals-projects.vercel.app',
    documentation: 'Add /api/health to test connection'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'attendance-backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Connected to Vercel frontend successfully!'
  });
});

// Students endpoint
app.get('/api/students', (req, res) => {
  res.json([
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', attendance: 'present' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', attendance: 'absent' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', attendance: 'present' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', attendance: 'late' }
  ]);
});

// Mark attendance endpoint
app.post('/api/attendance', (req, res) => {
  const { studentId, status, date } = req.body;
  
  res.json({
    success: true,
    message: `Attendance marked for student ${studentId}`,
    data: {
      studentId,
      status: status || 'present',
      date: date || new Date().toISOString().split('T')[0],
      recordedAt: new Date().toISOString()
    }
  });
});

// Test endpoint for frontend
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is connected to frontend!',
    frontendUrl: 'https://frontend-attenance-psf2-ixv1zrp6v-dhruvi-ohals-projects.vercel.app',
    backendUrl: 'https://attendance-backend-pp4k.onrender.com',
    connection: '✅ Active'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend: https://frontend-attenance-psf2-ixv1zrp6v-dhruvi-ohals-projects.vercel.app`);
  console.log(`🔗 Test URL: https://attendance-backend-pp4k.onrender.com/api/health`);
});