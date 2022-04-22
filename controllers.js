const fs = require('fs');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { findColumnName } = require('./utils');
const credentials = JSON.parse(fs.readFileSync('creds.json', 'utf-8'));
const { client_secret: clientSecret, client_id: clientId, redirect_uris: redirectUris } = credentials.web;

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const generateLoginToken = async (req, res) => {
	try {
		const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUris[0]);
		const { code } = req.query;
		if (!code) {
			const url = oAuth2Client.generateAuthUrl({
				access_type: 'offline',
				scope: SCOPES
			});
			res.redirect(url);
		} else {
			const token = (await oAuth2Client.getToken(code)).tokens;
			const jwtToken = await jwt.sign(token, process.env.JWT_TOKEN_SECRET);
			res.cookie('token', jwtToken);
			res.redirect(`http://localhost:3001/`);
		}
	} catch (err) {
		console.log(err);
		return res.status(501).json({ message: 'Error while creating token' });
	}
};

const getSpreadSheetDetails = async (req, res) => {
	const { spreadSheetId } = req.params;
	const token = req.headers.token;
	try {
		const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUris[0]);
		oAuth2Client.setCredentials({ access_token: token.access_token, refresh_token: token.refresh_token });
		const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

		const response = (
			await sheets.spreadsheets.get({
				spreadsheetId: spreadSheetId
			})
		).data;
		const getAllSheetsDetails = response.sheets.map((sheet) => {
			return { title: sheet.properties.title, id: sheet.properties.sheetId };
		});
		const sheetWithValues = (
			await sheets.spreadsheets.values.batchGet({
				spreadsheetId: spreadSheetId,
				ranges: getAllSheetsDetails.map((sheetDetails) => sheetDetails.title)
			})
		).data.valueRanges;
		const modifiedResponse = {};
		sheetWithValues.forEach((sheet, index) => {
			const sheetId = getAllSheetsDetails[index].id;
			modifiedResponse[sheetId] = sheet.values.map((row) => {
				const rowWiseValues = {};
				row.forEach((values, indexOfVal) => (rowWiseValues[indexOfVal] = values));
				return rowWiseValues;
			});
		});
		res.send(modifiedResponse);
	} catch (err) {
		console.log(err);
		return res.status(501).json({ message: 'Error while fetching ' });
	}
};

const updateSpreadSheetDetails = async (req, res) => {
	const { spreadsheet_id, sheet_id, row_number, column_number, value } = req.body;
	const token = req.headers.token;
	try {
		const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUris[0]);
		oAuth2Client.setCredentials({ access_token: token.access_token, refresh_token: token.refresh_token });
		const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
		const response = (
			await sheets.spreadsheets.get({
				spreadsheetId: spreadsheet_id
			})
		).data;
		const sheetIdToSheetNameMap = {};
		response.sheets.forEach((sheet) => {
			sheetIdToSheetNameMap[sheet.properties.sheetId] = sheet.properties.title;
		});
		const columnName = findColumnName(column_number);
		const range = `${sheetIdToSheetNameMap[sheet_id]}!${columnName}${row_number}:${columnName}${row_number}`;
		const values = [[value]];

		const updatingResponse = await sheets.spreadsheets.values.update({
			spreadsheetId: spreadsheet_id,
			range,
			resource: { values },
			valueInputOption: 'USER_ENTERED'
		});
		if (updatingResponse.status === 200) {
			return res.json({ success: true });
		}
		return res.json({ success: false });
	} catch (err) {
		console.log(err);
		return res.status(err.code || 400).json({ success: false, error: err.errors[0]?.message || 'Error while updating' });
	}
};

module.exports = { generateLoginToken, getSpreadSheetDetails, updateSpreadSheetDetails };
