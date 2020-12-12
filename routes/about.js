const path = require('path');
const express = require('express');

const router = express.Router();
const options = {
    root: path.join(__dirname, '..', 'public')
};

router.get('/', function (req, res) {
    res.sendFile('about.html', options);
});

router.get('/team', function (req, res) {
    res.sendFile('team.html', options);
});


module.exports = router;
