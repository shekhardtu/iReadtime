var express = require('express');
var router = express.Router();
var readTime = require('../controllers/readtime');

// readtime routers 
router.get('/readtime/', readTime.getReadTime); // to get the article readtime
router.get('/skipPage/', readTime.skipPage); // To check if reading time should shown or not
//router.post('/readtime/:articleId', readTime.saveReadTime); // After article finish it will save the complete reading time of a user



/* GET home page. */
router.get('/', function(req, res) {
    res.json({ message: 'Hooray! You got the access to readtime!' });   
});


module.exports = router;