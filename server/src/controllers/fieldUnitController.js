const fieldUnitModel = require('../models/fieldUnitModel');
const incidentModel = require('../models/incidentModel');

const fieldUnitController = {
  async getById(req, res) {
    try {
      let unit = await fieldUnitModel.findById(req.params.id);
      if (!unit) {
        // Try by agent ID
        unit = await fieldUnitModel.findByAgentId(req.params.id);
      }
      if (!unit) return res.status(404).json({ error: 'Field unit not found' });
      res.json(unit);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      let unit = await fieldUnitModel.findById(req.params.id);
      if (!unit) unit = await fieldUnitModel.findByAgentId(req.params.id);
      if (!unit) return res.status(404).json({ error: 'Field unit not found' });

      const updated = await fieldUnitModel.updateStatus(unit._id.toString(), status);
      if (req.app.get('io')) {
        req.app.get('io').emit('unit:statusChanged', { unitId: unit.unitId, status });
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async markArrived(req, res) {
    try {
      let unit = await fieldUnitModel.findById(req.params.id);
      if (!unit) unit = await fieldUnitModel.findByAgentId(req.params.id);
      if (!unit) return res.status(404).json({ error: 'Field unit not found' });
      if (!unit.currentIncident) return res.status(400).json({ error: 'No current incident' });

      const updated = await fieldUnitModel.markArrived(unit._id.toString(), unit.currentIncident.toString());
      await incidentModel.updateStatus(unit.currentIncident.toString(), 'on_site');

      if (req.app.get('io')) {
        req.app.get('io').emit('unit:statusChanged', { unitId: unit.unitId, status: 'on_site' });
        const incident = await incidentModel.findById(unit.currentIncident.toString());
        req.app.get('io').emit('incident:updated', incident);
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async updateLocation(req, res) {
    try {
      const { lat, lng } = req.body;
      let unit = await fieldUnitModel.findById(req.params.id);
      if (!unit) unit = await fieldUnitModel.findByAgentId(req.params.id);
      if (!unit) return res.status(404).json({ error: 'Field unit not found' });

      const updated = await fieldUnitModel.updateLocation(unit._id.toString(), lat, lng);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async getAssigned(req, res) {
    try {
      let unit = await fieldUnitModel.findById(req.params.id);
      if (!unit) unit = await fieldUnitModel.findByAgentId(req.params.id);
      if (!unit || !unit.currentIncident) return res.json(null);

      const incident = await incidentModel.findById(unit.currentIncident.toString());
      res.json(incident);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async getUpdates(req, res) {
    try {
      let unit = await fieldUnitModel.findById(req.params.id);
      if (!unit) unit = await fieldUnitModel.findByAgentId(req.params.id);
      if (!unit) return res.json([]);

      const updates = await fieldUnitModel.getUpdates(unit._id.toString());
      res.json(updates);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = fieldUnitController;
