var mongoose = require('mongoose');
//var readtime = mongoose.model('readtime');

module.exports.getReadTime = function (req, res) {
    if (req.params && req.params) {
        console.log(req.params.location);
        console.log('received data');
    }
    sendJsonResponse(res, 200, {'status': 'success'})
};

var sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};


var processDocument = function (location) {
   
}