const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');


const connectDB = require('./src/config/database');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');


const authRoutes = require('./src/routes/authRoutes');
const farmerRoutes = require('./src/routes/farmers');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const buyerRoutes = require('./src/routes/buyers');
const logisticsRoutes = require('./src/routes/logistics');
const analyticsRoutes = require('./src/routes/analytics');


dotenv.config();


const app = express();


if (!process.env.SKIP_DB_CONNECTION) {
  connectDB();
}


app.use(helmet()); // Security headers

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or curl)
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

app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Body parser
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // Cookie parser

//  Health check endpoint
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


app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
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
