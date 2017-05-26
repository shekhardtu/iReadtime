var mongoose = require('mongoose');
var user = mongoose.model('User');
var readtime = mongoose.model('Readtime');

module.exports.getReadTime = function (req, res) {
  var loc = req;// req.query;
  return sendJsonResponse(res, 200, loc);
};

var sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
  return res;
};


var processDocument = function (location) {
   
}