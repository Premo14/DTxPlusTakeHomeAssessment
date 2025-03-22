require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use('/api/call', require('./routes/calls'));

// Health check
app.get('/', (req, res) => {
    res.send('Medication Reminder System is running.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
