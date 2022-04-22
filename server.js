const express = require('express');
const goolgleRoutes = require('./routes/googleApis');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use('', goolgleRoutes);

app.get('/', (req, res) => {
	res.send('This is Utilize Assignment API');
});

app.listen(PORT, () => {
	console.log('Server started');
});
