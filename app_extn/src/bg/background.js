//if you checked 'fancy-settings' in extensionizr.com, uncomment this lines

// var settings = new Store('settings', {
//     'sample_setting': 'This is how you use Store.js to remember values'
// });

/* env variables [Start] */
// var host = 'http://localhost:3000';
var host = 'http://clipsack.herokuapp.com'; // prodApiUrl
/* env variables [End] */

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
// Send a message to the active tab
// chrome.tabs.query({
//     active: true,
//     currentWindow: true
// }, 
// function (tabs) {
//     var activeTab = tabs[0];
//     chrome.tabs.sendMessage(activeTab.id, {
//         'message': 'reqReadtime'
// });

chrome.tabs.sendMessage(tab.id, {
        text: 'reqReadtime'
    },
    function () {
        console.log("Message from readtime");
    });

// No tabs or host permissions needed!


// bookmarks = {
//     'process': 'add',
//     'user_id': bookmarks.user_id,
//     'link': {
//         'temp_id': createIdUsingString(tab.url),
//         'url': tab.url,
//         'icon': tab.favIconUrl,
//         'title': tab.title,
//         'data': {
//             'location': 'header_extn', // toolbar_extn, addurl_extn
//             'request_time': timeStamp('ms'), // timestamp when article requested to add. It may help in delay calculation form extn to server
//             'difference_time': 'GMT' // after landing on article when did user add to extn
//         }
//     }
// }
// clpsck.generalFunction.setStorageData('local', 'bookmarks', bookmarks);

// chrome.storage.sync.set({
//     'bookmarks': bookmarks
// }, function (msg) {
//     //  console.log(msg);
//     // Notify that we saved.
//     //message('Settings saved');
//     //console.log(bookmarks);
// });
});


function createIdUsingString(string) {
    var string = string.replace(/[^a-zA-Z0-9_]/g, '');
    return string;
}

function timeStamp(format) {
    var timeStamp;
    if (format.match(/[msMS]/)) {
        timeStamp = Math.floor(Date.now());
    }
    // To get time in millisecond
    return timeStamp;
}

function isIdExist(currentId, referenceId) {


}

function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

function setUserData() {
    chrome.storage.local.set({
        'bookmarks': bookmarks
    }, function (msg) {
        // console.log(msg);
        // Notify that we saved.
        //message('Settings saved');
        //console.log(bookmarks);
    });
    return {
        status: true,
        message: 'bookmark saved'
    }

}

function setTempData() {

}

function calculateTimeDifference(pastTimeStamp, currentTimeStamp) {

    var difference = date1.getTime() - date2.getTime();

    var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
    difference -= daysDifference * 1000 * 60 * 60 * 24

    var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
    difference -= hoursDifference * 1000 * 60 * 60

    var minutesDifference = Math.floor(difference / 1000 / 60);
    difference -= minutesDifference * 1000 * 60

    var secondsDifference = Math.floor(difference / 1000);

    console.log('difference = ' + daysDifference + ' day/s ' + hoursDifference + ' hour/s ' + minutesDifference + ' minute/s ' + secondsDifference + ' second/s ');
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
        if (request.reqType == 'readtime') {
            var userId = clpsck.generalFunction.getStorageData('local', 'userId');
            userId = userId ? userId : 0;
            var lastArticleId = userId ? clpsck.generalFunction.getStorageData('local', 'lastArticleId') : false;
            request.readability.userId = userId,
                request.readability.accountType = 'reader',
                request.readability.referrer = 'readtime',
                request.readability.environment = 'testing',
                request.readability.isRegistered = 0,
                request.readability.isSkipPage = false,
                request.readability.articleId = createIdUsingString(request.readability.href);
            //console.log(request);
            if (request.readability.articleId !== lastArticleId) { // Don't send history to server if last article was as the current article
                ajaxRequest(host + '/api/readtime/', request.readability, 'get', null).done(function (response) {
                    clpsck.generalFunction.setStorageData('local', 'userId', response.userId);
                    clpsck.generalFunction.setStorageData('local', 'lastArticleId', response.articleId);
                    clpsck.generalFunction.setStorageData('local', 'skipPage', response.skipPage);
                    sendResponse(response);
                });
            } else {
                var isSkipPage = JSON.parse(clpsck.generalFunction.getStorageData('local', 'skipPage'));
                var response = {};
                response.skipPage = isSkipPage ? true : false;
                sendResponse(response);
            }
            return true;
        } else if (request.reqType == 'bookmark') {
            sendResponse(request);
        } else if (request.reqType == 'article_read') {
            sendResponse(request);
        } else if (request.reqType == 'close') {
            sendResponse(request);
        } else if (request.reqType == 'skipPage') {
            request.url;
            request.userId = clpsck.generalFunction.getStorageData('local', 'userId');

            ajaxRequest(host + '/api/skipPage/', request, 'get', null).done(function (data) {
                //getTabRequests gets all the information i stored about a tab
                if (data) {
                    clpsck.generalFunction.setStorageData('local', 'skipPage', true);
                    sendResponse(data);
                }
            });
        } else if (request.reqType == "iconBadge") {
            var readtime = request.readtime.replace(" min", "m");
            chrome.tabs.get(sender.tab.id, function (tab) {
                if (chrome.runtime.lastError) {
                    return; // the prerendered tab has been nuked, happens in omnibox search
                }
                if (tab.index >= 0) { // tab is visible
                    chrome.browserAction.setBadgeText({
                        tabId: tab.id,
                        text: readtime
                    });
                } else { // prerendered tab, invisible yet, happens quite rarely
                    var tabId = sender.tab.id,
                        text = readtime;
                    chrome.webNavigation.onCommitted.addListener(function update(details) {
                        if (details.tabId == tabId) {
                            chrome.browserAction.setBadgeText({
                                tabId: tabId,
                                text: readtime
                            });
                            // chrome.webNavigation.onCommitted.removeListener(update);
                        }
                    });
                }
            });

        }
    });


function ajaxRequest(url, formData, method, otherParam) {
    if (otherParam) {

    }

    var dfd = $.Deferred();
    $.ajax({
        url: url,
        type: method,
        data: formData,
    }).done(function (response) {
        dfd.resolve(response);
        // console.log(response);
    });
    return dfd.promise();

}