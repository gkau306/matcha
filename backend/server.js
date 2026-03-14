const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// API routes
app.use('/api/cafes', require('./routes/cafes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Fallback to frontend for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Matcha Cafe Finder running on http://localhost:${PORT}`);
});
