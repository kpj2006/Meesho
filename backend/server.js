const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/sprints', require('./routes/sprints'));
app.use('/api/triage', require('./routes/triage'));
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/dependencies', require('./routes/dependencies'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/tasks', require('./routes/tasks'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ProdSync API is running',
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to ProdSync API',
    version: '1.0.0',
  });
});

// Error handler
app.use(errorHandler);

if(process.env.NODE_ENV !== "production"){
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default server;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

