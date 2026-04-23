const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const alertRoutes = require('./routes/alertRoutes');
const reportRoutes = require('./routes/reportRoutes');
const fieldUnitRoutes = require('./routes/fieldUnitRoutes');
const reliefCenterModel = require('./modules/reliefCenterModel');
const auth = require('./middleware/auth');

const app = express();
const clientPath = path.join(__dirname, '..', '..', 'client');

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/field-units', fieldUnitRoutes);

// Relief center routes
app.get('/api/relief-centers', auth, async (req, res) => {
  try {
    const centers = await reliefCenterModel.findAll();
    res.json(centers);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/relief-centers/:id/status', auth, async (req, res) => {
  try {
    const center = await reliefCenterModel.updateStatus(req.params.id, req.body.status);
    if (!center) return res.status(404).json({ error: 'Relief center not found' });
    res.json(center);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User preferences
app.patch('/api/users/preferences', auth, async (req, res) => {
  try {
    const userModel = require('./modules/userModel');
    const user = await userModel.updatePreferences(req.user.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(express.static(clientPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

module.exports=app;
