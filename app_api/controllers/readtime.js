var mongoose = require('mongoose');
var user = mongoose.model('User'),
  readtime = mongoose.model('Readtime'),
  visitedurl = mongoose.model('VisitedUrl');


module.exports.getReadTime = function (req, res) {
  var obj = req.query,
      userId = parseInt(obj.userId);
  obj["clientIp"] = getRemoteIp(req);
  /* This section is for testing purpose [Start] */
  // sendJsonResponse(res, 201, obj);
  // return; 
  /* This section is for testing purpose [End] */

  if (!userId) {
    var usrObj = createUserModel(obj);
    user.create(usrObj, function (err, user) {
      if (err) {
        sendJsonResponse(res, 400, err);
      } else {
        obj["userId"] = user['_id'];
        var visitedUrl = createVisitedUrlModel(obj);
        visitedurl.create(visitedUrl, function (err, visitedurl) {
          if (err) {
            sendJsonResponse(res, 400, err);
          } else {
            sendJsonResponse(res, 201, visitedurl);
          }
        });
      }
    });
  } else {
    user.find({
      _id: obj.userId
    }).lean().exec(function (err, docs) {

      obj['isSkipPage'] = docs && docs[0] && docs[0].skipPages && isSkipPage(obj.href, docs[0].skipPages);
      var visitedUrl = createVisitedUrlModel(obj);
      visitedurl.create(visitedUrl, function (err, visitedurl) {
        // var visitedurlObj = visitedurl.toObject();
        // console.log("VisitedURL:: "+visitedurlObj);
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

function getRemoteIp(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
}

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
    // firstVisit: data.firstVisit,
    isRegistered: data.isRegistered,
    environment: data.environment,
    clientIp: data.clientIp
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
    clientIp: data.clientIp,
    articleId: data.articleId,
    skipPage: data.isSkipPage
  }
  return visited;
}



var processDocument = function (location) {

}