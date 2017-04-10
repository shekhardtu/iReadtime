// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         chrome.pageAction.show(sender.tab.id);
//         sendResponse();

//     });


// chrome.bookmarks.getTree(function(itemTree) {
//     console.info(itemTree)
//         // itemTree.forEach(function(item) {
//         //     processNode(item);
//         // });
// });

// function processNode(node) {
//     // recursively process child nodes
//     if (node.children) {
//         node.children.forEach(function(child) { processNode(child); });
//     }

//     // print leaf nodes URLs to console
//     if (node.url) { console.log(node.url); }
// }
;
(function() {
    console.log("Cookie set");
})();

// background.js
var bookmarks = {

    }
    // Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {

    // Send a message to the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { "message": "clicked_browser_action" });
        // No tabs or host permissions needed!

        chrome.storage.sync.get('bookmarks', function(items) {
            bookmarks.user_id = items.bookmarks.user_id;
            if (!bookmarks.user_id) {
                bookmarks.user_id = getRandomToken();
            }
            console.log(items.bookmarks);
        });

        bookmarks = {
            "process": "add",
            "user_id": bookmarks.user_id,

            "link": {
                "temp_id": createIdUsingString(tab.url),
                "url": tab.url,
                "icon": tab.favIconUrl,
                "title": tab.title,
                "data": {
                    "location": "header_extn", // toolbar_extn, addurl_extn
                    "request_time": timeStamp("ms"), // timestamp when article requested to add. It may help in delay calculation form extn to server
                    "difference_time": "GMT" // after landing on article when did user add to extn
                }
            }


        }
        clpsck.generalFunction.setStorageData("local", "bookmarks", bookmarks);

        chrome.storage.sync.set({ 'bookmarks': bookmarks }, function(msg) {
            console.log(msg);
            // Notify that we saved.
            //message('Settings saved');
            //console.log(bookmarks);
        });
    });
});

// This block is new!
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "open_new_tab") {
            // chrome.tabs.create({ "url": request.url });
            // console.log(chrome.tab);
        }
    }
);

function createIdUsingString(string) {
    var string = string.replace(/[^a-zA-Z0-9_]/g, "");
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

    chrome.storage.local.set({ 'bookmarks': bookmarks }, function(msg) {
        console.log(msg);
        // Notify that we saved.
        //message('Settings saved');
        //console.log(bookmarks);
    });

    return { status: true, msg: "bookmark saved" }

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
