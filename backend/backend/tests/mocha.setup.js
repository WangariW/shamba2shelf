// Set test environment BEFORE any other imports
process.env.NODE_ENV = 'test';

// Set test database URI BEFORE server import
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/shamba2shelf_test';

// Set test JWT secrets
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-purposes';

// Prevent server from connecting to database automatically in test mode
// Tests will handle their own database connections
process.env.SKIP_DB_CONNECTION = 'true';

// Disable console.log in tests unless NODE_DEBUG is set
if (!process.env.NODE_DEBUG) {
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  };
  
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  
  // Keep error logs for debugging test issues
  global.originalConsole = originalConsole;
}

// Global test timeout
const originalTimeout = 10000;
global.timeout = originalTimeout;