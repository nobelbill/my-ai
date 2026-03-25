const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const SETTINGS_PATH = path.join(__dirname, '../data/settings.json');

function readSettings() {
  return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
}

function writeSettings(data) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2));
}

router.get('/', (req, res) => {
  const settings = readSettings();
  res.json({ success: true, data: settings });
});

router.put('/', (req, res) => {
  try {
    const current = readSettings();
    const updated = { ...current, ...req.body };
    writeSettings(updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: '설정 저장 실패' });
  }
});

module.exports = router;
