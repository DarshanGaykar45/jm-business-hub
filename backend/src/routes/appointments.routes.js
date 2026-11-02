const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointments.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/permissions');

router.use(authenticate);

router.get('/', appointmentsController.getAppointments);
router.post('/', appointmentsController.createAppointment);
router.put('/:id', appointmentsController.updateAppointment);

module.exports = router;
