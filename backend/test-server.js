// Simple test to check for errors
try {
  require('./server.js');
  console.log('✅ Server loaded successfully');
} catch (error) {
  console.error('❌ Error loading server:', error.message);
  console.error(error.stack);
  process.exit(1);
}

