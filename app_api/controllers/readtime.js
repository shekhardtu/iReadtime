var mongoose = require('mongoose');
var user = mongoose.model('User');
var readtime = mongoose.model('Readtime');

module.exports.getReadTime = function (req, res) {
    console.log(req);
    
    //console.log(loc);
    var loc = req.query.location;
   
    sendJsonResponse(res, 200, loc)
};

var sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};


var processDocument = function (location) {
   
}