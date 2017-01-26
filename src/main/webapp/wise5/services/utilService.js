'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UtilService = function () {
    function UtilService() {
        _classCallCheck(this, UtilService);
    }

    /**
     * Generates and returns a random key of the given length if
     * specified. If length is not specified, returns a key 10
     * characters in length.
     */


    _createClass(UtilService, [{
        key: "generateKey",
        value: function generateKey(length) {
            this.CHARS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

            /* set default length if not specified */
            if (!length) {
                length = 10;
            }

            /* generate the key */
            var key = '';
            for (var a = 0; a < length; a++) {
                key += this.CHARS[Math.floor(Math.random() * (this.CHARS.length - 1))];
            }

            /* return the generated key */
            // TODO: check that the new key is unique
            return key;
        }
    }, {
        key: "convertStringToNumber",


        /**
         * Try to convert a string to a number
         * @param str the string to convert
         * @returns a number if we were able to convert the string to a number.
         * if we couldn't convert the string to a number we will just return the string.
         */
        value: function convertStringToNumber(str) {
            var result = str;

            if (str != null && str != '' && !isNaN(Number(str))) {
                result = Number(str);
            }

            return result;
        }
    }, {
        key: "makeCopyOfJSONObject",


        /**
         * Create a copy of a JSON object
         * @param jsonObject the JSON object to get a copy of
         * @return a copy of the JSON object that was passed in
         */
        value: function makeCopyOfJSONObject(jsonObject) {
            var copyOfJSONObject = null;

            if (jsonObject != null) {
                // create a JSON string from the JSON object
                var jsonObjectString = angular.toJson(jsonObject);

                // create a JSON object from the JSON string
                copyOfJSONObject = angular.fromJson(jsonObjectString);
            }

            return copyOfJSONObject;
        }
    }, {
        key: "getImageObjectFromBase64String",


        /**
         * Get the image object
         * @params img_b64 the base64 image string
         * @returns an image object
         */
        value: function getImageObjectFromBase64String(img_b64) {

            // create a blob from the base64 image string
            var blob = this.dataURItoBlob(img_b64);

            var now = new Date().getTime();
            var filename = encodeURIComponent('picture_' + now + '.png');
            var pngFile = new File([blob], filename, {
                lastModified: now, // optional - default = now
                type: 'image/png' // optional - default = ''
            });

            return pngFile;
        }

        /**
         * Convert base64/URLEncoded data component to raw binary data held in a string
         * @param dataURI base64/URLEncoded data
         * @returns a Blob object
         */

    }, {
        key: "dataURItoBlob",
        value: function dataURItoBlob(dataURI) {

            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);else byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], { type: mimeString });
        }
    }, {
        key: "getImageObjectFromImageElement",


        /**
         * Get an image object from an image element
         * @param imageElement an image element (<img src='abc.jpg'/>)
         * @returns an image object
         */
        value: function getImageObjectFromImageElement(imageElement) {

            var imageObject = null;

            if (imageElement != null) {
                // create a canvas element that we will use to generate a base64 string
                var canvas = document.createElement("canvas");

                // set the width and height of the canvas to match the image dimensions
                canvas.width = imageElement.naturalWidth;
                canvas.height = imageElement.naturalHeight;

                // draw the image onto the canvas
                var ctx = canvas.getContext("2d");
                ctx.drawImage(imageElement, 0, 0);

                // create the base64 string representation of the image
                var dataURL = canvas.toDataURL("image/png");

                // get the image object
                imageObject = this.getImageObjectFromBase64String(dataURL);
            }

            return imageObject;
        }

        /**
         * Hide all the iframes. This is used before a student snips something
         * to put into their notebook. Iframes shift the position of elements
         * below it which causes issues when html2canvas tries to capture
         * certain elements.
         */

    }, {
        key: "hideIFrames",
        value: function hideIFrames() {

            // get all the iframes
            var iframes = angular.element('iframe');

            // loop through all the iframes
            for (var i = 0; i < iframes.length; i++) {
                var iframe = iframes[i];

                if (iframe != null) {
                    // hide the iframe
                    iframe.style.display = 'none';
                }
            }
        }

        /**
         * Show all the iframes. This is used after the student snips something
         * to put into their notebook. Iframes shift the position of elements
         * below it which causes issues when html2canvas tries to capture
         * certain elements.
         */

    }, {
        key: "showIFrames",
        value: function showIFrames() {

            // get all the iframes
            var iframes = angular.element('iframe');

            // loop through all the iframes
            for (var i = 0; i < iframes.length; i++) {
                var iframe = iframes[i];

                if (iframe != null) {
                    // show the iframe
                    iframe.style.display = '';
                }
            }
        }

        /**
         * Check if the asset is an image
         * @param fileName the file name of the asset
         * @return whether the asset is an image or not
         */

    }, {
        key: "isImage",
        value: function isImage(fileName) {
            var result = false;

            if (fileName != null) {
                var lowerCaseFileName = fileName.toLowerCase();

                // regex to match image extensions
                var imageExtensionsRegEx = new RegExp('.*\.(png|jpg|jpeg|bmp|gif|tiff|svg)');

                var matchResult = lowerCaseFileName.match(imageExtensionsRegEx);

                if (matchResult != null) {
                    // we have found a match so the asset is an image
                    result = true;
                }
            }

            return result;
        }

        /**
         * Check if the asset is a video
         * @param fileName the file name of the asset
         * @return whether the asset is an image or not
         */

    }, {
        key: "isVideo",
        value: function isVideo(fileName) {
            var result = false;

            if (fileName != null) {
                var lowerCaseFileName = fileName.toLowerCase();

                // regex to match video extensions
                var imageExtensionsRegEx = new RegExp('.*\.(mp4|mpg|mpeg|m2v|avi|gifv|mov|qt)');

                var matchResult = lowerCaseFileName.match(imageExtensionsRegEx);

                if (matchResult != null) {
                    // we have found a match so the asset is a video
                    result = true;
                }
            }

            return result;
        }

        /**
         * Replace <a> and <button> elements with <wiselink> elements where
         * applicable
         * @param html the html
         * @return the modified html with <wiselink> elements
         */

    }, {
        key: "insertWISELinks",
        value: function insertWISELinks(html) {

            // replace <a> elements with <wiselink> elements
            html = this.insertWISELinkAnchors(html);

            // replace <button> elements with <wiselink> elements
            html = this.insertWISELinkButtons(html);

            return html;
        }

        /**
         * Replace <a> elements that have the parameter wiselink=true with
         * <wiselink> elements
         * @param html the html
         * @return the modified html with certain <a> elements replaced with
         * <wiselink> elements
         */

    }, {
        key: "insertWISELinkAnchors",
        value: function insertWISELinkAnchors(html) {

            // find <a> elements with the parameter wiselink=true
            var wiseLinkRegEx = new RegExp(/<a.*?wiselink="true".*?>(.*?)<\/a>/);

            // find the first match
            var wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);

            // loop until we have replaced all the matches
            while (wiseLinkRegExMatchResult != null) {

                // get the whole <a> element
                var anchorHTML = wiseLinkRegExMatchResult[0];

                // get the inner html of the <a> element
                var anchorText = wiseLinkRegExMatchResult[1];

                // get the node id parameter of the <a> element
                var nodeId = this.getWISELinkNodeId(anchorHTML);

                if (nodeId == null) {
                    nodeId = '';
                }

                // create the <wiselink> element
                var wiselinkHtml = "<wiselink type='link' link-text='" + anchorText + "' node-id='" + nodeId + "'/>";

                // replace the <a> element with the <wiselink> element
                html = html.replace(wiseLinkRegExMatchResult[0], wiselinkHtml);

                // search for the next <a> element with the parameter wiselink=true
                wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);
            }

            return html;
        }

        /**
         * Replace <button> elements that have the parameter wiselink=true
         * with <wiselink> elements
         * @param html the html
         * @return the modified html with certain <button> elements replaced with
         * <wiselink> elements
         */

    }, {
        key: "insertWISELinkButtons",
        value: function insertWISELinkButtons(html) {

            // find <button> elements with the parameter wiselink=true
            var wiseLinkRegEx = new RegExp(/<button.*?wiselink="true".*?>(.*?)<\/button>/);

            // find the first match
            var wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);

            // loop until we have replaced all the matches
            while (wiseLinkRegExMatchResult != null) {

                // get the whole <button> element
                var buttonHTML = wiseLinkRegExMatchResult[0];

                // get the inner html of the <button> element
                var buttonText = wiseLinkRegExMatchResult[1];

                // get the node id parameter of the <button> element
                var nodeId = this.getWISELinkNodeId(buttonHTML);

                if (nodeId == null) {
                    nodeId = '';
                }

                // create the <wiselink> element
                var wiselinkHtml = "<wiselink type='button' link-text='" + buttonText + "' node-id='" + nodeId + "'/>";

                // replace the <button> element with the <wiselink> element
                html = html.replace(wiseLinkRegExMatchResult[0], wiselinkHtml);

                // search for the next <button> element with the parameter wiselink=true
                wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);
            }

            return html;
        }

        /**
         * Get the node id from the wiselink element
         * e.g.
         * <wiselink node-id='node5'/>
         * the node id in this case is 'node5'
         * @param html the html for the element
         * @return the node id from the node id parameter in the element
         */

    }, {
        key: "getWISELinkNodeId",
        value: function getWISELinkNodeId(html) {

            var nodeId = null;

            if (html != null) {
                // create the regex to find the node id parameter
                var nodeIdRegEx = new RegExp(/node-id=["'b](.*?)["']/, 'g');

                // try to find a match
                var nodeIdRegExResult = nodeIdRegEx.exec(html);

                if (nodeIdRegExResult != null) {
                    // we have found a node id
                    nodeId = nodeIdRegExResult[1];
                }
            }

            return nodeId;
        }

        /**
         * Get the link type from the wiselink element
         * e.g.
         * <wiselink type='button'/>
         * the type in this case is 'button'
         * @param html the html for the element
         * @return the link type from the type parameter in the element
         */

    }, {
        key: "getWISELinkType",
        value: function getWISELinkType(html) {
            var type = null;

            if (html != null) {
                // create the regex to find the type
                var typeRegEx = new RegExp(/type=["'b](.*?)["']/, 'g');

                // try to find a match
                var typeRegExResult = typeRegEx.exec(html);

                if (typeRegExResult != null) {
                    // we have found a type
                    type = typeRegExResult[1];
                }
            }

            return type;
        }

        /**
         * Get the link text from the wiselink element
         * <wiselink link-text='Go to here'/>
         * the link text in this case is 'Go to here'
         * @param html the html for the element
         * @return the link text from the link text parameter in the element
         */

    }, {
        key: "getWISELinkLinkText",
        value: function getWISELinkLinkText(html) {
            var linkText = null;

            if (html != null) {
                // create the regex to find the link text
                var linkTextRegEx = new RegExp(/link-text=["'b](.*?)["']/, 'g');

                // try to find a match
                var linkTextRegExResult = linkTextRegEx.exec(html);

                if (linkTextRegExResult != null) {
                    // we have found a link text
                    linkText = linkTextRegExResult[1];
                }
            }

            return linkText;
        }

        /**
         * Replace <wiselink> elements with <a> and <button> elements
         * @param html the html
         * @return the modified html without <wiselink> elements
         */

    }, {
        key: "replaceWISELinks",
        value: function replaceWISELinks(html) {

            // replace wiselinks that look like <wiselink/>
            html = this.replaceWISELinksHelper(html, '<wiselink.*?\/>');

            // replace wiselinks that look like <wiselink></wiselink>
            html = this.replaceWISELinksHelper(html, '<wiselink.*?>.*?<\/wiselink>');

            return html;
        }

        /**
         * Helper function for replacing <wiselink> elements with <a> and <button>
         * elements
         * @param html the html
         * @param regex the regex string to search for
         * @return the html without <wiselink> elements
         */

    }, {
        key: "replaceWISELinksHelper",
        value: function replaceWISELinksHelper(html, regex) {

            // create the regex
            var wiseLinkRegEx = new RegExp(regex);

            // find the first match
            var wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);

            // loop until we have replaced all the matches
            while (wiseLinkRegExMatchResult != null) {

                /*
                 * get the whole match
                 * e.g. <wiselink type='link' node-id='node5' link-text='Go to here'/>
                 */
                var wiseLinkHTML = wiseLinkRegExMatchResult[0];

                // get the node id, type and link text from the match
                var nodeId = this.getWISELinkNodeId(wiseLinkHTML);
                var type = this.getWISELinkType(wiseLinkHTML);
                var linkText = this.getWISELinkLinkText(wiseLinkHTML);

                var newElement = null;

                if (type == 'link') {
                    // create a link that represents the wiselink
                    newElement = "<a wiselink='true' node-id='" + nodeId + "'>" + linkText + "</a>";
                } else if (type == 'button') {
                    // create a button that represents the wiselink
                    newElement = "<button wiselink='true' node-id='" + nodeId + "'>" + linkText + "</button>";
                }

                if (newElement != null) {
                    // replace the wiselink with the new element
                    html = html.replace(wiseLinkHTML, newElement);
                }

                // find the next match
                wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);
            }

            return html;
        }
    }, {
        key: "createInsertAssetButton",
        value: function createInsertAssetButton(controller, nodeId, componentId, target, tooltip) {
            // a custom button that opens the asset chooser
            var InsertAssetButton = function InsertAssetButton(context) {
                var ui = $.summernote.ui;

                // create button
                var button = ui.button({
                    contents: '<i class="note-icon-picture"></i>',
                    tooltip: tooltip,
                    click: function click() {
                        // remember the position of the cursor
                        context.invoke('editor.saveRange');

                        // create the params for opening the asset chooser
                        var params = {};
                        params.popup = true;
                        params.nodeId = nodeId;
                        params.componentId = componentId;
                        params.target = target;

                        controller.$rootScope.$broadcast('openAssetChooser', params);
                    }
                });

                return button.render(); // return button as jquery object
            };

            return InsertAssetButton;
        }
    }]);

    return UtilService;
}();

// Get the last element of the array


if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
};

UtilService.$inject = [];

exports.default = UtilService;
//# sourceMappingURL=utilService.js.map