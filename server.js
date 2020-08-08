const express = require('express')
const cors = require('cors');
const path = require('path');
const app = express();

var logger = require('./middleware/logger');

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/view/honkling.html'));
});

app.use(express.static(__dirname));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log('Server started on PORT ' + PORT));
