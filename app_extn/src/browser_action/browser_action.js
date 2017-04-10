document.addEventListener('DOMContentLoaded', function() {

    chrome.tabs.getSelected(null, function(tab) {
        console.log(tab.url);
    });

}, false);
console.log("Hello. This message was sent from src/bg/browser_action.js");
