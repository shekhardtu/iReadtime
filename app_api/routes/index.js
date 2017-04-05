var express = require('express');
var router = express.Router();
var readTime = require('../controllers/readtime');

router.get('/readtime/:json', readTime.getReadTime);

/* GET home page. */

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});


module.exports = router;