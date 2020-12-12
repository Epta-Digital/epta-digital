const path = require('path');
const express = require('express');

const router = express.Router();
const options = {
    root: path.join(__dirname, '..', 'public')
};

const courseMapping = {
    'introduction-to-web-development': 'web-development.html',
    'introduction-to-ui-ux': 'ui-ux.html',
    'introduction-to-photography':'photography.html',
    'introduction-to-graphics-design': 'graphics-design.html'
}

router.get('/', function (req, res) {
    res.sendFile('academy.html', options);
});

router.get('/:course', function (req, res) {
    const course = req.params['course'];
    res.sendFile(courseMapping[course], options);
});

router.route('/:course/enroll')
    .get(function (req, res) {
        res.sendFile('enroll.html', options);
    })
    .post(function (req, res) {
        res.send('Application session closed');
    });


module.exports = router;
