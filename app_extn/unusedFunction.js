/*eslint-env es6:false*/
/*
 * Copyright (c) 2010 Arc90 Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * This code is heavily based on Arc90's readability.js (1.7.1) script
 * available at: http://code.google.com/p/arc90labs-readability
 */

/**
 * Public constructor.
 * @param {Object}       uri     The URI descriptor object.
 * @param {HTMLDocument} doc     The document to parse.
 * @param {Object}       options The options object.
 */
function Readability(uri, doc, options) {
  /**
   * Look for any paging links that may occur within the document.
   *
   * @param body
   * @return object (array)
   **/
  _findNextPageLink: function (elem) {
    var uri = this._uri;
    var possiblePages = {};
    var allLinks = elem.getElementsByTagName('a');
    var articleBaseUrl = this._findBaseUrl();

    // Loop through all links, looking for hints that they may be next-page links.
    // Things like having "page" in their textContent, className or id, or being a child
    // of a node with a page-y className or id.
    //
    // Also possible: levenshtein distance? longest common subsequence?
    //
    // After we do that, assign each page a score, and
    for (var i = 0, il = allLinks.length; i < il; i += 1) {
      var link = allLinks[i];
      var linkHref = allLinks[i].href.replace(/#.*$/, '').replace(/\/$/, '');

      // If we've already seen this page, ignore it.
      if (linkHref === "" ||
        linkHref === articleBaseUrl ||
        linkHref === uri.spec ||
        linkHref in this._parsedPages) {
        continue;
      }

      // If it's on a different domain, skip it.
      if (uri.host !== linkHref.split(/\/+/g)[1])
        continue;

      var linkText = this._getInnerText(link);

      // If the linkText looks like it's not the next page, skip it.
      if (linkText.match(this.REGEXPS.extraneous) || linkText.length > 25)
        continue;

      // If the leftovers of the URL after removing the base URL don't contain
      // any digits, it's certainly not a next page link.
      var linkHrefLeftover = linkHref.replace(articleBaseUrl, '');
      if (!linkHrefLeftover.match(/\d/))
        continue;

      if (!(linkHref in possiblePages)) {
        possiblePages[linkHref] = {
          "score": 0,
          "linkText": linkText,
          "href": linkHref
        };
      } else {
        possiblePages[linkHref].linkText += ' | ' + linkText;
      }

      var linkObj = possiblePages[linkHref];

      // If the articleBaseUrl isn't part of this URL, penalize this link. It could
      // still be the link, but the odds are lower.
      // Example: http://www.actionscript.org/resources/articles/745/1/JavaScript-and-VBScript-Injection-in-ActionScript-3/Page1.html
      if (linkHref.indexOf(articleBaseUrl) !== 0)
        linkObj.score -= 25;

      var linkData = linkText + ' ' + link.className + ' ' + link.id;
      if (linkData.match(this.REGEXPS.nextLink))
        linkObj.score += 50;

      if (linkData.match(/pag(e|ing|inat)/i))
        linkObj.score += 25;

      if (linkData.match(/(first|last)/i)) {
        // -65 is enough to negate any bonuses gotten from a > or » in the text,
        // If we already matched on "next", last is probably fine.
        // If we didn't, then it's bad. Penalize.
        if (!linkObj.linkText.match(this.REGEXPS.nextLink))
          linkObj.score -= 65;
      }

      if (linkData.match(this.REGEXPS.negative) || linkData.match(this.REGEXPS.extraneous))
        linkObj.score -= 50;

      if (linkData.match(this.REGEXPS.prevLink))
        linkObj.score -= 200;

      // If a parentNode contains page or paging or paginat
      var parentNode = link.parentNode;
      var positiveNodeMatch = false;
      var negativeNodeMatch = false;

      while (parentNode) {
        var parentNodeClassAndId = parentNode.className + ' ' + parentNode.id;

        if (!positiveNodeMatch && parentNodeClassAndId && parentNodeClassAndId.match(/pag(e|ing|inat)/i)) {
          positiveNodeMatch = true;
          linkObj.score += 25;
        }

        if (!negativeNodeMatch && parentNodeClassAndId && parentNodeClassAndId.match(this.REGEXPS.negative)) {
          // If this is just something like "footer", give it a negative.
          // If it's something like "body-and-footer", leave it be.
          if (!parentNodeClassAndId.match(this.REGEXPS.positive)) {
            linkObj.score -= 25;
            negativeNodeMatch = true;
          }
        }

        parentNode = parentNode.parentNode;
      }

      // If the URL looks like it has paging in it, add to the score.
      // Things like /page/2/, /pagenum/2, ?p=3, ?page=11, ?pagination=34
      if (linkHref.match(/p(a|g|ag)?(e|ing|ination)?(=|\/)[0-9]{1,2}/i) || linkHref.match(/(page|paging)/i))
        linkObj.score += 25;

      // If the URL contains negative values, give a slight decrease.
      if (linkHref.match(this.REGEXPS.extraneous))
        linkObj.score -= 15;

      /**
       * Minor punishment to anything that doesn't match our current URL.
       * NOTE: I'm finding this to cause more harm than good where something is exactly 50 points.
       *     Dan, can you show me a counterexample where this is necessary?
       * if (linkHref.indexOf(window.location.href) !== 0) {
       *  linkObj.score -= 1;
       * }
       **/

      // If the link text can be parsed as a number, give it a minor bonus, with a slight
      // bias towards lower numbered pages. This is so that pages that might not have 'next'
      // in their text can still get scored, and sorted properly by score.
      var linkTextAsNumber = parseInt(linkText, 10);
      if (linkTextAsNumber) {
        // Punish 1 since we're either already there, or it's probably
        // before what we want anyways.
        if (linkTextAsNumber === 1) {
          linkObj.score -= 10;
        } else {
          linkObj.score += Math.max(0, 10 - linkTextAsNumber);
        }
      }
    }

    // Loop thrugh all of our possible pages from above and find our top
    // candidate for the next page URL. Require at least a score of 50, which
    // is a relatively high confidence that this page is the next link.
    var topPage = null;
    for (var page in possiblePages) {
      if (possiblePages.hasOwnProperty(page)) {
        if (possiblePages[page].score >= 50 &&
          (!topPage || topPage.score < possiblePages[page].score))
          topPage = possiblePages[page];
      }
    }

    var nextHref = null;
    if (topPage) {
      nextHref = topPage.href.replace(/\/$/, '');

      this.log('NEXT PAGE IS ' + nextHref);
      this._parsedPages[nextHref] = true;
    }
    return nextHref;
  },
  _appendNextPage: function (nextPageLink) {
    var doc = this._doc;
    this._curPageNum += 1;

    var articlePage = doc.createElement("DIV");
    articlePage.id = 'readability-page-' + this._curPageNum;
    articlePage.className = 'page';
    articlePage.innerHTML = '<p class="page-separator" title="Page ' + this._curPageNum + '">&sect;</p>';

    doc.getElementById("readability-content").appendChild(articlePage);

    if (this._curPageNum > this._maxPages) {
      var nextPageMarkup = "<div style='text-align: center'><a href='" + nextPageLink + "'>View Next Page</a></div>";
      articlePage.innerHTML = articlePage.innerHTML + nextPageMarkup;
      return;
    }

    // Now that we've built the article page DOM element, get the page content
    // asynchronously and load the cleaned content into the div we created for it.
    (function (pageUrl, thisPage) {
      this._ajax(pageUrl, {
        success: function (r) {

          // First, check to see if we have a matching ETag in headers - if we do, this is a duplicate page.
          var eTag = r.getResponseHeader('ETag');
          if (eTag) {
            if (eTag in this._pageETags) {
              this.log("Exact duplicate page found via ETag. Aborting.");
              articlePage.style.display = 'none';
              return;
            }
            this._pageETags[eTag] = 1;
          }

          // TODO: this ends up doubling up page numbers on NYTimes articles. Need to generically parse those away.
          var page = doc.createElement("DIV");

          // Do some preprocessing to our HTML to make it ready for appending.
          // - Remove any script tags. Swap and reswap newlines with a unicode
          //   character because multiline regex doesn't work in javascript.
          // - Turn any noscript tags into divs so that we can parse them. This
          //   allows us to find any next page links hidden via javascript.
          // - Turn all double br's into p's - was handled by prepDocument in the original view.
          //   Maybe in the future abstract out prepDocument to work for both the original document
          //   and AJAX-added pages.
          var responseHtml = r.responseText.replace(/\n/g, '\uffff').replace(/<script.*?>.*?<\/script>/gi, '');
          responseHtml = responseHtml.replace(/\n/g, '\uffff').replace(/<script.*?>.*?<\/script>/gi, '');
          responseHtml = responseHtml.replace(/\uffff/g, '\n').replace(/<(\/?)noscript/gi, '<$1div');
          responseHtml = responseHtml.replace(this.REGEXPS.replaceFonts, '<$1span>');

          page.innerHTML = responseHtml;
          this._replaceBrs(page);

          // Reset all flags for the next page, as they will search through it and
          // disable as necessary at the end of grabArticle.
          this._flags = 0x1 | 0x2 | 0x4;

          var secondNextPageLink = this._findNextPageLink(page);

          // NOTE: if we end up supporting _appendNextPage(), we'll need to
          // change this call to be async
          var content = this._grabArticle(page);

          if (!content) {
            this.log("No content found in page to append. Aborting.");
            return;
          }

          // Anti-duplicate mechanism. Essentially, get the first paragraph of our new page.
          // Compare it against all of the the previous document's we've gotten. If the previous
          // document contains exactly the innerHTML of this first paragraph, it's probably a duplicate.
          var firstP = content.getElementsByTagName("P").length ? content.getElementsByTagName("P")[0] : null;
          if (firstP && firstP.innerHTML.length > 100) {
            for (var i = 1; i <= this._curPageNum; i += 1) {
              var rPage = doc.getElementById('readability-page-' + i);
              if (rPage && rPage.innerHTML.indexOf(firstP.innerHTML) !== -1) {
                this.log('Duplicate of page ' + i + ' - skipping.');
                articlePage.style.display = 'none';
                this._parsedPages[pageUrl] = true;
                return;
              }
            }
          }

          this._removeScripts(content);

          thisPage.innerHTML = thisPage.innerHTML + content.innerHTML;

          // After the page has rendered, post process the content. This delay is necessary because,
          // in webkit at least, offsetWidth is not set in time to determine image width. We have to
          // wait a little bit for reflow to finish before we can fix floating images.
          setTimeout((function () {
            this._postProcessContent(thisPage);
          }).bind(this), 500);


          if (secondNextPageLink)
            this._appendNextPage(secondNextPageLink);
        }
      });
    }).bind(this)(nextPageLink, articlePage);
  },
  /**
   * Find a cleaned up version of the current URL, to use for comparing links for possible next-pageyness.
   *
   * @author Dan Lacy
   * @return string the base url
   **/
  _findBaseUrl: function () {
    var uri = this._uri;
    var noUrlParams = uri.path.split("?")[0];
    var urlSlashes = noUrlParams.split("/").reverse();
    var cleanedSegments = [];
    var possibleType = "";

    for (var i = 0, slashLen = urlSlashes.length; i < slashLen; i += 1) {
      var segment = urlSlashes[i];

      // Split off and save anything that looks like a file type.
      if (segment.indexOf(".") !== -1) {
        possibleType = segment.split(".")[1];

        // If the type isn't alpha-only, it's probably not actually a file extension.
        if (!possibleType.match(/[^a-zA-Z]/))
          segment = segment.split(".")[0];
      }

      // If our first or second segment has anything looking like a page number, remove it.
      if (segment.match(/((_|-)?p[a-z]*|(_|-))[0-9]{1,2}$/i) && ((i === 1) || (i === 0)))
        segment = segment.replace(/((_|-)?p[a-z]*|(_|-))[0-9]{1,2}$/i, "");

      var del = false;

      // If this is purely a number, and it's the first or second segment,
      // it's probably a page number. Remove it.
      if (i < 2 && segment.match(/^\d{1,2}$/))
        del = true;

      // If this is the first segment and it's just "index", remove it.
      if (i === 0 && segment.toLowerCase() === "index")
        del = true;

      // If our first or second segment is smaller than 3 characters,
      // and the first segment was purely alphas, remove it.
      if (i < 2 && segment.length < 3 && !urlSlashes[0].match(/[a-z]/i))
        del = true;

      // If it's not marked for deletion, push it to cleanedSegments.
      if (!del)
        cleanedSegments.push(segment);
    }

    // This is our final, cleaned, base article URL.
    return uri.scheme + "://" + uri.host + cleanedSegments.reverse().join("/");
  },
  _successfulRequest: function (request) {
    return (request.status >= 200 && request.status < 300) ||
      request.status === 304 ||
      (request.status === 0 && request.responseText);
  },

  _ajax: function (url, options) {
    var request = new XMLHttpRequest();

    function respondToReadyState(readyState) {
      if (request.readyState === 4) {
        if (this._successfulRequest(request)) {
          if (options.success)
            options.success(request);
        } else if (options.error) {
          options.error(request);
        }
      }
    }

    if (typeof options === 'undefined')
      options = {};

    request.onreadystatechange = respondToReadyState;

    request.open('get', url, true);
    request.setRequestHeader('Accept', 'text/html');

    try {
      request.send(options.postBody);
    } catch (e) {
      if (options.error)
        options.error();
    }

    return request;
  }
}