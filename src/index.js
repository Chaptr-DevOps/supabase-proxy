const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Log environment variables (sanitized)
console.log('Environment check:', {
  hasSupabaseUrl: !!process.env.SUPABASE_URL,
  hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
  supabaseUrlPreview: process.env.SUPABASE_URL?.substring(0, 20) + '...',
  supabaseKeyPreview: process.env.SUPABASE_ANON_KEY?.substring(0, 5) + '...'
});

// Initialize Supabase with more options
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Add a test endpoint at the root
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth')(supabase));
app.use('/api/items', require('./routes/items')(supabase));
app.use('/api/quiz', require('./routes/quiz')(supabase));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    details: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});