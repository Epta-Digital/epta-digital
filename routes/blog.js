const path = require('path');
const express = require('express');

const router = express.Router();
const options = {
    root: path.join(__dirname, '..', 'public')
};

const routeMapping = {
    "why-we-need-to-start-talking-about-the-digital-skills-gap": "blogpost1.html",
    "8-digital-skills-you-should-learn": "blogpost2.html",
    "gen-zed": "blogpost3.html"
};

router.get('/', function (req, res) {
    res.sendFile('blog.html', options);
});

router.get('/:post', function (req, res) {
    const post = req.params['post'];
    res.sendFile(routeMapping[post], options);
});


module.exports = router;
