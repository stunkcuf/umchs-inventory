const express = require('express');
const router = express.Router();
const { getAllLocations, getLocation, createLocation, updateLocation, deleteLocation } = require('../controllers/locationsController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, getAllLocations);
router.get('/:id', auth, getLocation);
router.post('/', auth, requireRole(['admin']), createLocation);
router.put('/:id', auth, requireRole(['admin']), updateLocation);
router.delete('/:id', auth, requireRole(['admin']), deleteLocation);

module.exports = router;
