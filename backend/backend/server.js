const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');
const path = require('path');

const connectDB = require('./src/config/database');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');

// Load Models
require('./src/models/Farmer');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const farmerRoutes = require('./src/routes/farmers');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const buyerRoutes = require('./src/routes/buyers');
const logisticsRoutes = require('./src/routes/logistics');
const analyticsRoutes = require('./src/routes/analytics');
const routeOptimizationRoutes = require("./src/routes/routeOptimization");

dotenv.config();

const app = express();

if (!process.env.SKIP_DB_CONNECTION) {
  connectDB();
}

app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());


const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
];

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach(url => {
    allowedOrigins.push(url.trim());
  });
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); 

      if (allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
        return callback(null, true);
      }

      console.log('❌ CORS blocked:', origin);
      return callback(new Error('CORS: Origin not allowed'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);


app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Shamba2Shelf API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Shamba2Shelf API</h1>
    <p>Status: Running</p>
    <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
    <p>Check <code>/api/health</code></p>
  `);
});


app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/v1/logistics', logisticsRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/route', routeOptimizationRoutes);


app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
const isProduction =
  process.env.NODE_ENV === 'production' ||
  process.env.RAILWAY_ENVIRONMENT;

let server;

if (isProduction) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Production Server running on port ${PORT}`);
  });
} else {
  try {
    const httpsOptions = {
      key: fs.readFileSync(path.join(__dirname, 'localhost+2-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'localhost+2.pem')),
    };

    server = https.createServer(httpsOptions, app);

    server.listen(PORT, () => {
      console.log(`🔐 Local HTTPS server running on port ${PORT}`);
    });
  } catch (err) {
    console.log('⚠️ HTTPS cert missing → using HTTP instead');
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌐 Local HTTP server running on port ${PORT}`);
    });
  }
}


process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('⏹️ SIGTERM → shutting down');
  server.close(() => console.log('✅ Server stopped'));
});

module.exports = app;
