const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

// GET /health - Health check
router.get('/', healthController.healthCheck);

// GET /health/ping - Simple ping
router.get('/ping', healthController.ping);

module.exports = router;
