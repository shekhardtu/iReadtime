/* Basic convensions 

Each function will return an object 
Which will basically contains more than two parameters
{
    stts: true or false // It will if the output is expected or not. Basically success flag. @return BOOLEAN
    msg: readable contextual message or reason for status. @return STRING
}


/* [1] It helps us to find the selector; 
Algo: search on page for specific element paired with website or 'article' tag for reading content */

var readtime = {
    data: {

    }
}
var articleSelector = (function () {
    var host = location.host,
        selector = false;
    if (host.indexOf("www.") != -1)
        host = host.substring(4);
    
    var websiteArticleTagPair = [{
        "website": "reddit.com",
        "selector": ".entry"
    }, {
        "website": "css-tricks.com",
        "selector": ".article-content"
    }, {
        "website": "medium.com",
        "selector": ".postArticle-content"
    }, {
        "website": "ndtv.com",
        "selector": "#ins_storybody"
    }, {
        "website": "bbc.com",
        "selector": ".story-body"
    }, {
        "website": "en.wikipedia.org",
        "selector": "#bodyContent"
    }, {
        "website": "scientificamerican.com",
        "selector": ".article-text"
    }, {
        "website": "america.aljazeera.com",
        "selector": ".articleOpinion-mainPar--container"
    }, {
        "website": "sparknotes.com",
        "selector": ".studyGuideText"
    }, {
        "website": "shmoop.com",
        "selector": ".content-learning-guide"
    }, {
        "website": "motherjones.com",
        "selector": ".content"
    }, {
        "website": "fortune.com",
        "selector": ".article-bottom"
    }, {
        "website": "getpocket.com",
        "selector": ".reader_content"
    }, {
        "website": "businessinsider.com",
        "selector": ".sl-layout-post"
    }, {
        "website": "makeuseof.com",
        "selector": ".entry"
    }, {
        "website": "lifehack.org",
        "selector": ".post-content"
    }, {
        "website": "geek.com",
        "selector": ".articleinfo"
    }, {
        "website": "cleveland.com",
        "selector": ".entry-content"
    }, {
        "website": "oregonlive.com",
        "selector": "#article_container"
    }, {
        "website": "nj.com",
        "selector": "#article_container"
    }, {
        "website": "nola.com",
        "selector": "#article_container"
    }, {
        "website": "al.com",
        "selector": "#article_container"
    }, {
        "website": "masslive.com",
        "selector": "#article_container"
    }, {
        "website": "gulflive.com",
        "selector": "#article_container"
    }, {
        "website": "mlive.com",
        "selector": "#article_container"
    }, {
        "website": "mardigras.com",
        "selector": "#article_container"
    }, {
        "website": "syracuse.com",
        "selector": "#article_container"
    }, {
        "website": "reuters.com",
        "selector": "#articleText"
    }, {
        "website": "nymag.com",
        "selector": ".body"
    }, {
        "website": "www.vulture.com",
        "selector": "#article"
    }]


    for (var i = 0; i < websiteArticleTagPair.length; i++) {
        if (host.indexOf(websiteArticleTagPair[i].website) != -1) {;
            selector = websiteArticleTagPair[i].selector;
            break;
        }

    }
    return selector ? selector : "article";
})();


/* [2] Assigning the dom value */
var readingContent = getDomNode(articleSelector);

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
            message: "This is page is applicable for readtime"
        }
    }
    var text = getText(elementNode),
        imageCount = isImage(elementNode),
        videoCount = isVideo(elementNode),
        codeBlockCount = isCode(elementNode);

    var domInfo = {
        text: text,
        dom_node: elementNode,
        wordCount: getWordCount(text).wordCount,
        is_image: imageCount,
        is_video: videoCount,
        is_code: codeBlockCount
    };

    domInfo.status = true;
    domInfo.msg = "It contains";
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

function imageViewTime(imageCount) {
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
        imgCnt = textParserObj.is_image,
        codeCnt = textParserObj.is_code,
        avgRdngSpd = avgReadingSpeed,
        rdngTime = 0;
    var imgViewTime = imageViewTime(imgCnt);

    rdngTime += parseInt(wrdCnt, 10) / parseInt(avgReadingSpeed);
    rdngTime += Math.ceil(parseInt(imgViewTime) / 60);

    if (rdngTime < 60) {
        return rdngTime = Math.ceil(rdngTime) + " min";
    } else if (rdngTime > 60 && rdngTime < 1440) {
        var mnt = Math.ceil(rdngTime % 24);
        var hour = Math.ceil(rdngTime / 24);
        return hour + " hour" + ":" + mnt + " min";
    }

    return false;
}
$(document).ready(function () {
    //console.log(domParser(readingContent));
    var readtime = calculateReadingTime(domParser(readingContent), 275);
    readtimePopout(readtime);
});

function readtimePopout(readtime) {
    if (readtime) {
        $.get(chrome.extension.getURL('src/inject/html/readtime.html'), function (data) {
            data = data.replace("__rdtm__duration_", readtime);
            $(data).prependTo('body');

            $(".clpsck-extn__cls").on("click", function () {
                popupCls($(this));
            });
        });
    }
}

function popupCls($this) {
    $this.parents(".clpsck-extn").remove();
}