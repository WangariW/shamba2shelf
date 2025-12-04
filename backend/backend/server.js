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

require('./src/models/Farmer');

const authRoutes = require('./src/routes/authRoutes');
const farmerRoutes = require('./src/routes/farmers');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const buyerRoutes = require('./src/routes/buyers');
const logisticsRoutes = require('./src/routes/logistics');
const analyticsRoutes = require('./src/routes/analytics');
const routeOptimizationRoutes = require("./src/routes/routeOptimization");
console.log("Route Optimization Routes loaded");

dotenv.config();

const app = express();

if (!process.env.SKIP_DB_CONNECTION) {
  connectDB();
}

app.use(helmet()); 

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://10.0.9.91:5173',
  'https://10.0.9.91:5173',
  'https://localhost:5173',
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('CORS policy: Origin not allowed'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(morgan('combined')); 
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); 

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
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
      <h1> Welcome to Shamba2Shelf API</h1>
      <p>Your backend server is running successfully.</p>
      <p>Visit <code>/api/health</code> to check server status.</p>
      <p>Environment: <strong>${process.env.NODE_ENV || 'development'}</strong></p>
    </div>
  `);
});

app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/v1/logistics', logisticsRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use("/api/route", routeOptimizationRoutes);
console.log("✅ Mounted at /api/route");

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'localhost+2-key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, 'localhost+2.pem'))
};

const server = https.createServer(httpsOptions, app);

server.listen(PORT, () => {
  console.log(`🚀 HTTPS Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(` Error: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.log(` Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log(' SIGTERM received, shutting down gracefully');
  server.close(() => console.log(' Process terminated'));
});

module.exports = app;