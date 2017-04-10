// content.js
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "clicked_browser_action") {
            var firstHref = $("a[href^='http']").eq(0).attr("href");
            console.log(firstHref);
            if ($(".clpsck-extn").length) {
                $(".clpsck-extn").remove();
                return;
            }

            $.get(chrome.extension.getURL('src/inject/html/inject.html'), function(data) {

                $(data).prependTo('body');
                // Or if you're using jQuery 1.8+:
                // $($.parseHTML(data)).appendTo('body');
                $(".clpsck-extn__cls").on("click", function() {
                    popupCls($(this));
                    console.log("click on close0");

                });
            });

            // This line is new!
            chrome.runtime.sendMessage({ "message": "open_new_tab", "url": firstHref });

        }
    }
);

console.log("Messgae from content.js")

function popupCls($this) {
    $this.parents(".clpsck-extn").remove();
}



//console.log(popupHtml)
