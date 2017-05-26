/* Basic convensions 

Each function will return an object 
Which will basically contains more than two parameters
{
    status: true or false // It will if the output is expected or not. Basically success flag. @return BOOLEAN
    message: readable contextual message or reason for status. @return STRING
}

/* [1] It helps us to find the selector; 
Algo: search on page for specific element paired with website or 'article' tag for reading content */

function readtime(avgReadingTime) {
    this.avgReadingSpeed = "";
}
$(document).ready(function () {
    getReadTimePopout(null, 275);
});

function readingContent(location) {
    var isValid = (function () {
        var href = location.href,
            host = location.host;
        if (host.indexOf("www.") != -1)
            host = host.substring(4);
        var stopWebsite = ['glassdoor.co.in', 'glassdoor.com'];

        if (/blog/.test(href)) {
            return true;
        } else if (stopWebsite.indexOf(host) != -1) {
            return false;
        } else if (window.location.pathname === "/") {
            return false;
        } else {
            return true;
        }
    })(location);

    if (!isValid) {
        return false;
    }
    var loc = document.location;
    var uri = {
        spec: loc.href,
        host: loc.host,
        prePath: loc.protocol + "//" + loc.host,
        scheme: loc.protocol.substr(0, loc.protocol.indexOf(":")),
        pathBase: loc.protocol + "//" + loc.host + loc.pathname.substr(0, loc.pathname.lastIndexOf("/") + 1)
    };
    var documentClone = document.cloneNode(true);
    var article = new Readability(uri, documentClone).parse();
    return article;
}




/* [2.1.1] After getting selector, it tells us if that selector is class, id or simply sytactical tag */
function classTagOrID(selector) {
    if (selector.indexOf(".") !== -1) {
        return "class";
    } else if (selector.indexOf("#") !== -1) {
        return "id";
    } else {
        return "tag";
    }
}


/* [2.1] fetching the DOM of selector */
function getDomNode(selector) {
    var node = classTagOrID(selector);
    if (selector && selector.indexOf(".") != -1) {
        selector = selector.split('.').join("");

    } else if (selector && selector.indexOf("#") != -1) {
        selector = selector.split('#').join("");
    }

    if (node == "id") {
        return document.getElementById(selector);
    } else if (node == "class") {
        return document.getElementsByClassName(selector)[0];
    } else {
        return document.getElementsByTagName(selector)[0];
    }
}

function getText(elem) {
    return (function () {
        var text = "";
        var i;
        if (!elem) {
            return false;
        }
        var node = "",
            nodeLngth, nstdNode = "";
        node = elem.childNodes;
        nodeLngth = node.length;
        for (i = 0; i < nodeLngth; i++) {
            nstdNode = elem.childNodes[i];

            if (nstdNode.nodeType != 8 && (nstdNode.nodeName != "IMG" || "NOSCRIPT" || "SCRIPT"))
                if (nstdNode.nodeType == 3) {
                    text += nstdNode.nodeValue;
                } else {
                    text += getText(nstdNode);
                }
        }
        return text;
    })(elem)
}

function domParser(elementNode) {
    if (!elementNode) {
        return {
            status: false,
            message: "This page is not applicable for readtime"
        }
    }
    var text = elementNode.vendor.textContent,
        imageCount = elementNode.vendor.imageCount,
        videoCount = isVideo(elementNode),
        codeBlockCount = isCode(elementNode);
    node = elementNode.vendor.content

    var domInfo = {
        text: text,
        domNode: node,
        wordCount: getWordCount(text).wordCount,
        isImage: imageCount,
        isVideo: videoCount,
        isCode: codeBlockCount
    };
    domInfo.status = true;
    domInfo.message = "It contains";
    return domInfo;

}

function isImage(elementNode) {
    // console.log($(elementNode).find("img[src]").length || 0);
    return $(elementNode).find("img[src]").length || 0;
}

function isCode(elementNode) {
    return $(elementNode).find("code").length || 0;
}

function isVideo(elementNode) {
    return $(elementNode).find("video").length || 0;
}

function imageScanTime(imageCount) {
    var images = parseInt(imageCount),
        viewTime = 0,
        radicalValue = 0;
    if (!images) {
        return 0;
    } else if (images <= 8) {
        viewTime += images * 12;
    } else {
        for (var i = images; i > 0; i--) {
            if (radicalValue < 10) {
                viewTime += (12 - radicalValue);
                ++radicalValue;
            } else {
                viewTime += 3;
            }
        }
    }
    return viewTime;
}

function getWordCount(words) {
    return (function () {
        words = words.replace(/\s+/g, " ");
        var wordCount = words.split(" ").length;
        if (wordCount) {
            return {
                status: true,
                message: "",
                text: words,
                wordCount: wordCount
            }

        } else {
            return {
                status: false,
                message: "",
                text: words,
                wordCount: wordCount
            }
        }
    })(words);

}

function calculateReadingTime(textParserObj, avgReadingSpeed) {
    var textParserObj = textParserObj;

    var wrdCnt = textParserObj.wordCount,
        imgCnt = textParserObj.isImage,
        codeCnt = textParserObj.isCode,
        avgRdngSpd = avgReadingSpeed,
        rdngTime = 0;
    var imgViewTime = imageScanTime(imgCnt);

    rdngTime += parseInt(wrdCnt, 10) / parseInt(avgReadingSpeed);
    rdngTime += Math.ceil(parseInt(imgViewTime) / 60);
    rdngTime += rdngTime * 0.20; // Amount of distraction happens

    if (rdngTime < 60) {
        return rdngTime = Math.ceil(rdngTime) + " min";
    } else if (rdngTime > 60 && rdngTime < 1440) {
        var mnt = Math.ceil(rdngTime % 24);
        var hour = Math.ceil(rdngTime / 24);
        return hour + " hour" + ":" + mnt + " min";
    }
    return false;
}

function readtimePopout(readtime) {
    if (readtime) {
        $.get(chrome.extension.getURL('src/inject/html/readtime.html'), function (data) {
            data = data.replace("__rdtm__duration_", readtime);
            $(data).prependTo('body');
            $(".clpsck-extn__cls").on("click", function () {
                popupCls($(this), true);
            });
        });
    }
}

function getReadTimePopout(location, avgRdngSpd) {
    if (!location) {
        var location = window.location;
    }
    popupCls($(".clpsck-extn__cls"), false); // @false: user action or close action
    var readContent = readingContent(location);
    var parsedContent = domParser(readContent);
    var readtime = calculateReadingTime(parsedContent, avgRdngSpd);
    readtimePopout(readtime);
}

(function () { //create a scope so "location" is not global
    var location = window.location.href;
    setInterval(function () {
        if (location != window.location.href) {
            location = window.location.href;
            setTimeout(function () {
                getReadTimePopout(null, 275);
            }, 500)
        }
    }, 1000);
})();

function popupCls($this, flag) {
    $this.parents(".clpsck-extn").remove();
    if (flag) {
        chrome.runtime.sendMessage({
            reqType: "close",
            readability: readingContent(window.location)
        }, function (response) {
            console.log(response); // asynchronous call 
        });
    }    
}


chrome.runtime.sendMessage({
    reqType: "readtime",
    readability: readingContent(window.location)
}, function (response) {
    console.log(response); // asynchronous call 
});

chrome.runtime.sendMessage({
    reqType: "bookmark",
    readability: readingContent(window.location)
}, function (response) {
    console.log(response); // asynchronous call 
});

chrome.runtime.sendMessage({
    reqType: "article_read",
    readability: readingContent(window.location)
}, function (response) {
    console.log(response); // asynchronous call 
});