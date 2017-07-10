var mongoose = require('mongoose');
var user = mongoose.model('User'),
  readtime = mongoose.model('Readtime'),
  visitedurl = mongoose.model('VisitedUrl');


module.exports.getReadTime = function (req, res) {
  var obj = req.query;

  if (obj.userId == 0) {
    var usrObj = createUserModel(obj);
    var visitedUrlObj = createVisitedUrlModel(obj);
    user.create(usrObj, function (err, user) {
      if (err) {
        sendJsonResponse(res, 400, err);
      } else {
        visitedUrlObj.userId = user['_id'];
        visitedurl.create(visitedUrlObj, function (err, visitedurl) {
          if (err) {
            sendJsonResponse(res, 400, err);
          } else {
            sendJsonResponse(res, 201, visitedurl);
          }
        });
      }
    });
  } else {
    visitedurl.create(obj, function (err, visitedurl) {
      var visitedurl = visitedurl.toObject();
      user.find({ _id: obj.userId }, 'skipPages', function (err, docs) {
        visitedurl['skipPage'] = isSkipPage(obj.href, docs[0].skipPages);
        if (err) {
          sendJsonResponse(res, 400, err);
        } else {
          sendJsonResponse(res, 201, visitedurl);
        }
      });  
    });
  }
};

module.exports.skipPage = function (req, res) {
  var obj = req.query;
  user.update({
    _id: obj.userId
  }, {
    $push: {
      skipPages: {
        url: obj.url,
        date: Date.now()
      }
    }
  }, function (err, skipPages) {
    if (err) {
      sendJsonResponse(res, 400, err);
    } else {
      sendJsonResponse(res, 201, skipPages);
    }
  });
};


function isSkipPage(currentUrl, urlArr) {
  return urlArr.findIndex(i => i.url === currentUrl) > -1 ? true : false;  
} 

var sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
  return res;
};

function createUserModel(data) {
  var user = {
    accountType: data.accountType,
    referrer: data.referrer,
    firstVisit: data.firstVisit,
    isRegistered: data.isRegistered,
    environment: data.environment
  }
  return user;
}

function createVisitedUrlModel(data) {
  var visited = {
    href: data.href,
    origin: data.origin,
    protocol: data.protocol,
    host: data.host,
    hostname: data.hostname,
    port: data.port,
    pathname: data.pathname,
    search: data.search,
    hash: data.hash,
    userId: data.userId,
    referrer: data.referrer,
    environment: data.environment,
    articleId: data.articleId
  }
  return visited;
}



var processDocument = function (location) {

}