const express = require('express');
const health = require('@cloudnative/health-connect');
const multer = require('multer');
const { hook } = require('./hook.js');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const healthcheck = new health.HealthChecker();

router.post('/hook', upload.single('thumb'), hook);
router.get('/live', health.LivenessEndpoint(healthcheck));
router.get('/ready', health.ReadinessEndpoint(healthcheck));
router.get('/health', health.HealthEndpoint(healthcheck));

module.exports.router = router;
