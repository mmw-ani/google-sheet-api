const jwt = require('jsonwebtoken');
const authenticateToken = (req, res, next) => {
	try {
		const token = req.headers.authorization;
		jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err, decodedToken) => {
			if (err || !decodedToken) {
				return res.status(401).json({ message: 'Invalid token' });
			}
			req.headers.token = decodedToken;
			next();
		});
	} catch (err) {
		console.log(err);
		return res.status(400).json({ message: 'Invalid session' });
	}
};

const findColumnName = (columnNumber) => {
	let res = '';
	while (columnNumber > 0) {
		let rem = columnNumber % 26;
		columnNumber = Math.floor(columnNumber / 26);
		if (rem == 0) {
			res = 'Z' + res;
			columnNumber--;
		} else {
			res = String.fromCharCode(rem - 1 + 'A'.charCodeAt(0)) + res;
		}
	}
	return res;
};

module.exports = { authenticateToken, findColumnName };
