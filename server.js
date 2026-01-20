const express = require('express');
const cors = require('cors');
const app = express();

// ✅ CRITICAL FIX: Update CORS to allow your Vercel domain
const allowedOrigins = [
  'https://frontend-attenance-psf2.vercel.app',
  'https://frontend-attenance-psf2-*.vercel.app',
  'https://frontend-attendance.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return origin === allowedOrigin;
    });
    
    if (isAllowed) {
      return callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      console.log('✅ Allowed origins:', allowedOrigins);
      return callback(new Error(`CORS policy: Origin ${origin} not allowed`), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

// Parse JSON
app.use(express.json());

// Your routes (keep existing)
app.get('/', (req, res) => {
  res.json({
    message: 'Attendance Backend API',
    status: 'running',
    endpoints: ['/health', '/students', '/attendance'],
    frontend: 'https://frontend-attenance-psf2.vercel.app'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'attendance-backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    message: 'Connected to Vercel frontend successfully!',
    allowedOrigins: allowedOrigins
  });
});

// Add more routes as needed...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Allowed origins:`, allowedOrigins);
  console.log(`🔗 Health check: https://attendance-backend-pp4k.onrender.com/health`);
});