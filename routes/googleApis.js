const express = require('express');
const { generateLoginToken, getSpreadSheetDetails, updateSpreadSheetDetails } = require('../controllers');
const utils = require('../utils');
const router = express.Router();

router
	.get('/login', generateLoginToken)
	.get('/spreadsheet/:spreadSheetId', utils.authenticateToken, getSpreadSheetDetails)
	.post('/spreadsheet/update', utils.authenticateToken, updateSpreadSheetDetails);

module.exports = router;
