'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UtilService = function () {
  function UtilService($filter, $injector, $mdDialog, $q, $rootScope, $timeout) {
    _classCallCheck(this, UtilService);

    this.$filter = $filter;
    this.$injector = $injector;
    this.$mdDialog = $mdDialog;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
    this.componentTypeToLabel = {};
    this.$translate = this.$filter('translate');
  }

  /**
   * Generates and returns a random key of the given length if
   * specified. If length is not specified, returns a key 10
   * characters in length.
   */


  _createClass(UtilService, [{
    key: 'generateKey',
    value: function generateKey(length) {
      this.CHARS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

      if (!length) {
        length = 10;
      }

      var key = '';
      for (var a = 0; a < length; a++) {
        key += this.CHARS[Math.floor(Math.random() * (this.CHARS.length - 1))];
      }

      return key;
    }
  }, {
    key: 'convertStringToNumber',


    /**
     * Try to convert a string to a number
     * @param str the string to convert
     * @returns a number if we were able to convert the string to a number.
     * if we couldn't convert the string to a number we will just return the string.
     */
    value: function convertStringToNumber(str) {
      if (str != null && str != '' && !isNaN(Number(str))) {
        return Number(str);
      }
      return str;
    }
  }, {
    key: 'makeCopyOfJSONObject',


    /**
     * Create a copy of a JSON object
     * @param jsonObject the JSON object to get a copy of
     * @return a copy of the JSON object that was passed in
     */
    value: function makeCopyOfJSONObject(jsonObject) {
      if (jsonObject != null) {
        var jsonObjectString = angular.toJson(jsonObject);
        return angular.fromJson(jsonObjectString);
      }
      return null;
    }
  }, {
    key: 'getImageObjectFromBase64String',


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
    key: 'dataURItoBlob',
    value: function dataURItoBlob(dataURI) {
      var byteString = void 0;
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
    key: 'getImageObjectFromImageElement',


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

        var dataURL = canvas.toDataURL("image/png");
        imageObject = this.getImageObjectFromBase64String(dataURL);
      }
      return imageObject;
    }

    /**
     * Check if the asset is an image
     * @param fileName the file name of the asset
     * @return whether the asset is an image or not
     */

  }, {
    key: 'isImage',
    value: function isImage(fileName) {
      if (fileName != null) {
        var imageExtensionsRegEx = new RegExp('.*\.(png|jpg|jpeg|bmp|gif|tiff|svg)');
        var lowerCaseFileName = fileName.toLowerCase();
        var matchResult = lowerCaseFileName.match(imageExtensionsRegEx);

        if (matchResult != null) {
          return true;
        }
      }
      return false;
    }

    /**
     * Check if the asset is a video
     * @param fileName the file name of the asset
     * @return whether the asset is a video or not
     */

  }, {
    key: 'isVideo',
    value: function isVideo(fileName) {
      if (fileName != null) {
        var videoExtensionsRegEx = new RegExp('.*\.(mp4|mpg|mpeg|m4v|m2v|avi|gifv|mov|qt)');
        var lowerCaseFileName = fileName.toLowerCase();
        var matchResult = lowerCaseFileName.match(videoExtensionsRegEx);

        if (matchResult != null) {
          return true;
        }
      }
      return false;
    }

    /**
     * Replace <a> and <button> elements with <wiselink> elements where
     * applicable
     * @param html the html
     * @return the modified html with <wiselink> elements
     */

  }, {
    key: 'insertWISELinks',
    value: function insertWISELinks(html) {
      html = this.insertWISELinkAnchors(html);
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
    key: 'insertWISELinkAnchors',
    value: function insertWISELinkAnchors(html) {
      var wiseLinkRegEx = new RegExp(/<a.*?wiselink="true".*?>(.*?)<\/a>/);
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

        var componentIdAttr = "";
        var componentId = this.getWISELinkComponentId(anchorHTML);
        if (componentId != null) {
          componentIdAttr = "component-id='" + componentId + "'";
        }

        // create the <wiselink> element
        var wiselinkHtml = "<wiselink type='link' link-text='" + anchorText + "' node-id='" + nodeId + "' " + componentIdAttr + "/>";

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
    key: 'insertWISELinkButtons',
    value: function insertWISELinkButtons(html) {
      var wiseLinkRegEx = new RegExp(/<button.*?wiselink="true".*?>(.*?)<\/button>/);
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

        var componentIdAttr = "";
        var componentId = this.getWISELinkComponentId(buttonHTML);
        if (componentId != null) {
          componentIdAttr = "component-id='" + componentId + "'";
        }

        // create the <wiselink> element
        var wiselinkHtml = "<wiselink type='button' link-text='" + buttonText + "' node-id='" + nodeId + "' " + componentIdAttr + "/>";

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
    key: 'getWISELinkNodeId',
    value: function getWISELinkNodeId(html) {
      if (html != null) {
        var nodeIdRegEx = new RegExp(/node-id=["'b](.*?)["']/, 'g');
        var nodeIdRegExResult = nodeIdRegEx.exec(html);
        if (nodeIdRegExResult != null) {
          return nodeIdRegExResult[1];
        }
      }
      return null;
    }

    /**
     * Get the component id from the wiselink element
     * e.g.
     * <wiselink node-id='node5' component-id='xyzabc' />
     * the component id in this case is 'xyzabc'
     * @param html the html for the element
     * @return the component id from the component id parameter in the element
     */

  }, {
    key: 'getWISELinkComponentId',
    value: function getWISELinkComponentId(html) {
      if (html != null) {
        var componentIdRegEx = new RegExp(/component-id=["'b](.*?)["']/, 'g');
        var componentIdRegExResult = componentIdRegEx.exec(html);
        if (componentIdRegExResult != null) {
          return componentIdRegExResult[1];
        }
      }
      return null;
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
    key: 'getWISELinkType',
    value: function getWISELinkType(html) {
      if (html != null) {
        var typeRegEx = new RegExp(/type=["'b](.*?)["']/, 'g');
        var typeRegExResult = typeRegEx.exec(html);
        if (typeRegExResult != null) {
          return typeRegExResult[1];
        }
      }
      return null;
    }

    /**
     * Get the link text from the wiselink element
     * <wiselink link-text='Go to here'/>
     * the link text in this case is 'Go to here'
     * @param html the html for the element
     * @return the link text from the link text parameter in the element
     */

  }, {
    key: 'getWISELinkLinkText',
    value: function getWISELinkLinkText(html) {
      if (html != null) {
        var linkTextRegEx = new RegExp(/link-text=["'b](.*?)["']/, 'g');
        var linkTextRegExResult = linkTextRegEx.exec(html);
        if (linkTextRegExResult != null) {
          return linkTextRegExResult[1];
        }
      }
      return null;
    }

    /**
     * Replace <wiselink> elements with <a> and <button> elements
     * @param html the html
     * @return the modified html without <wiselink> elements
     */

  }, {
    key: 'replaceWISELinks',
    value: function replaceWISELinks(html) {
      html = this.replaceWISELinksHelper(html, '<wiselink.*?\/>');
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
    key: 'replaceWISELinksHelper',
    value: function replaceWISELinksHelper(html, regex) {
      var wiseLinkRegEx = new RegExp(regex);
      var wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);

      // loop until we have replaced all the matches
      while (wiseLinkRegExMatchResult != null) {
        /*
         * get the whole match
         * e.g. <wiselink type='link' node-id='node5' link-text='Go to here'/>
         */
        var wiseLinkHTML = wiseLinkRegExMatchResult[0];

        // get the node id, component id (if exists), type and link text from the match
        var nodeId = this.getWISELinkNodeId(wiseLinkHTML);
        var componentId = this.getWISELinkComponentId(wiseLinkHTML);
        var componentHTML = '';
        if (componentId != null && componentId != '') {
          componentHTML = "component-id='" + componentId + "'";
        }
        var type = this.getWISELinkType(wiseLinkHTML);
        var linkText = this.getWISELinkLinkText(wiseLinkHTML);

        var newElement = null;

        if (type == 'link') {
          // create a link that represents the wiselink
          newElement = "<a wiselink='true' node-id='" + nodeId + "' " + componentHTML + ">" + linkText + "</a>";
        } else if (type == 'button') {
          // create a button that represents the wiselink
          newElement = "<button wiselink='true' node-id='" + nodeId + "' " + componentHTML + ">" + linkText + "</button>";
        } else {
          // default to creating a link that represents the wiselink
          newElement = "<a wiselink='true' node-id='" + nodeId + "' " + componentHTML + ">" + linkText + "</a>";
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

    /**
     * Create a custom summernote button that inserts a WISE asset into
     * summernote
     * @param controller the controller that is creating the button
     * e.g. openResponseController
     * @param nodeId the node id of the component that is creating the button
     * @param componentId the component id of the component that is creating the button
     * @param target the target element in the component to insert the asset into
     * e.g. 'prompt' or 'rubricSummernoteId'
     * @param tooltip the tooltip text for the custom button
     * @return custom summernote button
     */

  }, {
    key: 'createInsertAssetButton',
    value: function createInsertAssetButton(controller, projectId, nodeId, componentId, target, tooltip) {
      var thisRootScope = this.$rootScope;

      var InsertAssetButton = function InsertAssetButton(context) {
        var ui = $.summernote.ui;

        var button = ui.button({
          contents: '<i class="note-icon-picture"></i>',
          tooltip: tooltip,
          click: function click() {
            // remember the position of the cursor
            context.invoke('editor.saveRange');

            // create the params for opening the asset chooser
            var params = {};
            params.isPopup = true;

            if (projectId != null) {
              params.projectId = projectId;
            }

            if (nodeId != null) {
              params.nodeId = nodeId;
            }

            if (componentId != null) {
              params.componentId = componentId;
            }

            params.target = target;

            // display the asset chooser
            thisRootScope.$broadcast('openAssetChooser', params);
          }
        });
        return button.render(); // return button as jquery object
      };
      return InsertAssetButton;
    }

    /**
     * Create a custom summernote button that inserts a WISE link into
     * summernote
     * @param controller the controller that is creating the WISE link
     * e.g. openResponseController
     * @param nodeId the node id of the component that is creating the WISE link
     * @param componentId the component id of the component that is creating the WISE link
     * @param target the target element in the component to insert the WISE link into
     * e.g. 'prompt' or 'rubricSummernoteId'
     * @param tooltip the tooltip text for the custom button
     * @return custom summernote button
     */

  }, {
    key: 'createInsertWISELinkButton',
    value: function createInsertWISELinkButton(controller, projectId, nodeId, componentId, target, tooltip) {
      var thisRootScope = this.$rootScope;

      var InsertWISELinkButton = function InsertWISELinkButton(context) {
        var ui = $.summernote.ui;

        var button = ui.button({
          contents: '<i class="note-icon-link"></i>',
          tooltip: tooltip,
          click: function click() {
            // remember the position of the cursor
            context.invoke('editor.saveRange');

            // create the params for opening the WISE Link chooser
            var params = {};

            if (projectId != null) {
              params.projectId = projectId;
            }

            if (nodeId != null) {
              params.nodeId = nodeId;
            }

            if (componentId != null) {
              params.componentId = componentId;
            }

            params.target = target;

            // display the WISE Link authoring popup
            thisRootScope.$broadcast('openWISELinkChooser', params);
          }
        });
        return button.render(); // return button as jquery object
      };
      return InsertWISELinkButton;
    }

    /**
     * Remove html tags from the string. Also remove new lines.
     * @param html an html string
     * @return text without html tags
     */

  }, {
    key: 'removeHTMLTags',
    value: function removeHTMLTags(html) {
      var text = '';
      if (html != null) {
        // remove tags
        text = html.replace(/<\/?[^>]+(>|$)/g, " ");
        text = text.replace(/\n/g, " ");
        text = text.replace(/\r/g, " ");
      }
      return text;
    }

    /**
     * Check if a string ends with a specific string
     * @param subjectString the main string
     * @param searchString the potential end of the string
     * @param position (optional) the position to start searching
     * @return whether the subjectString ends with the searchString
     */

  }, {
    key: 'endsWith',
    value: function endsWith(subjectString, searchString, position) {
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.lastIndexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    }

    /**
     * Sort the objects by server save time
     * @param object1 an object
     * @param object2 an object
     * @return -1 if object1 server save time comes before object2 server save time
     * 1 if object1 server save time comes after object2 server save time
     * 0 if object1 server save time is equal to object2 server save time
     */

  }, {
    key: 'sortByServerSaveTime',
    value: function sortByServerSaveTime(object1, object2) {
      if (object1.serverSaveTime < object2.serverSaveTime) {
        return -1;
      } else if (object1.serverSaveTime > object2.serverSaveTime) {
        return 1;
      } else {
        return 0;
      }
    }

    /**
     * Convert milliseconds since the epoch to a pretty printed date time
     * @param milliseconds the milliseconds since the epoch
     * @return a string containing the pretty printed date time
     * example
     * Wed Apr 06 2016 9:05:38 AM
     */

  }, {
    key: 'convertMillisecondsToFormattedDateTime',
    value: function convertMillisecondsToFormattedDateTime(milliseconds) {
      var date = new Date(milliseconds);
      if (date != null) {
        return date.toDateString() + " " + date.toLocaleTimeString();
      }
      return "";
    }

    /**
     * Get the label for the given component type
     * @param componentType string
     * @return string label for the component type
     */

  }, {
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel(componentType) {
      /*
       * check if we have already obtained the label for this component type
       * before
       */
      var label = this.componentTypeToLabel[componentType];

      if (label == null) {
        var componentService = this.$injector.get(componentType + 'Service');
        if (componentService != null && componentService.getComponentTypeLabel != null) {
          label = componentService.getComponentTypeLabel();
          this.componentTypeToLabel[componentType] = label;
        }
      }

      if (label == null) {
        /*
         * we were unable to find the label so we will just use the
         * component type as the label
         */
        label = componentType;
      }
      return label;
    }

    /**
     * Check if two arrays contain the same values. This is commonly used to
     * check if two arrays of ids contain the same values. The order of the
     * elements is not compared, only the actual values. This means the elements
     * can be in different orders but still contain the same values.
     * Example:
     * array1=['1234567890', 'abcdefghij']
     * array2=['abcdefghij', '1234567890']
     * If these two arrays are passed in as the two arguments, this function
     * will return true.
     * Note: This may only work if the elements are strings, numbers or
     * booleans. If the elements are objects, this function may or may not work.
     * @param array1 an array of strings, numbers, or booleans
     * @param array2 an array of strings, numbers, or booleans
     * @return whether the arrays contain the same values
     */

  }, {
    key: 'arraysContainSameValues',
    value: function arraysContainSameValues(array1, array2) {
      if (array1 != null && array2 != null) {
        var array1Copy = this.makeCopyOfJSONObject(array1);
        array1Copy.sort();

        var array2Copy = this.makeCopyOfJSONObject(array2);
        array2Copy.sort();

        if (angular.toJson(array1Copy) == angular.toJson(array2Copy)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Whether there are any connected components
     * @param componentContent the component content
     * @return whether there are any connected components
     */

  }, {
    key: 'hasConnectedComponent',
    value: function hasConnectedComponent(componentContent) {
      if (componentContent != null) {
        var connectedComponents = componentContent.connectedComponents;
        if (connectedComponents != null && connectedComponents.length > 0) {
          return true;
        }
      }
      return false;
    }

    /**
     * Whether this component shows work from a connected component
     * @param componentContent the component content
     * @return whether this component shows work from a connected component
     */

  }, {
    key: 'hasShowWorkConnectedComponent',
    value: function hasShowWorkConnectedComponent(componentContent) {
      if (componentContent != null) {
        var connectedComponents = componentContent.connectedComponents;
        if (connectedComponents != null) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = connectedComponents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var connectedComponent = _step.value;

              if (connectedComponent != null) {
                if (connectedComponent.type == 'showWork') {
                  return true;
                }
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
      }
      return false;
    }

    /**
     * Whether this component imports work from a connected component
     * @param componentContent the component content
     * @return whether this component imports work from a connected component
     */

  }, {
    key: 'hasImportWorkConnectedComponent',
    value: function hasImportWorkConnectedComponent(componentContent) {
      if (componentContent != null) {
        var connectedComponents = componentContent.connectedComponents;
        if (connectedComponents != null) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = connectedComponents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var connectedComponent = _step2.value;

              if (connectedComponent != null) {
                if (connectedComponent.type == 'importWork') {
                  return true;
                }
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      }
      return false;
    }

    /**
     * Check if an array has any non null elements.
     * @param arrayToCheck An array which may have null and non null elements.
     * @return True if the array has at least one non null element.
     * False if the array has all null elements.
     */

  }, {
    key: 'arrayHasNonNullElement',
    value: function arrayHasNonNullElement(arrayToCheck) {
      if (arrayToCheck != null) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = arrayToCheck[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var element = _step3.value;

            if (element != null) {
              return true;
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
      return false;
    }

    /**
     * Takes a string and breaks it up into multiple lines so that the length of
     * each line does not exceed a certain number of characters. This code was
     * found on stackoverflow.
     * https://stackoverflow.com/questions/14484787/wrap-text-in-javascript
     * @param str The string to break up.
     * @param maxWidth The max width of a line.
     * @return A string that has been broken up into multiple lines using \n.
     */

  }, {
    key: 'wordWrap',
    value: function wordWrap(str, maxWidth) {
      if (str.length <= maxWidth) {
        return str;
      }
      var newLineStr = "\n";
      var done = false;
      var res = '';
      do {
        var found = false;
        // Inserts new line at first whitespace of the line
        for (var i = maxWidth - 1; i >= 0; i--) {
          if (this.testWhite(str.charAt(i))) {
            res = res + [str.slice(0, i), newLineStr].join('');
            str = str.slice(i + 1);
            found = true;
            break;
          }
        }
        // Inserts new line at maxWidth position, the word is too long to wrap
        if (!found) {
          res += [str.slice(0, maxWidth), newLineStr].join('');
          str = str.slice(maxWidth);
        }

        if (str.length < maxWidth) done = true;
      } while (!done);

      return res + str;
    }

    /**
     * Helper function for wordWrap().
     * @param x A single character string.
     * @return Whether the single character is a whitespace character.
     */

  }, {
    key: 'testWhite',
    value: function testWhite(x) {
      var white = new RegExp(/^\s$/);
      return white.test(x.charAt(0));
    }
  }, {
    key: 'wordCount',


    /**
     * Get the number of words in the string.
     * @param str The string.
     * @return The number of words in the string.
     */
    value: function wordCount(str) {
      return str.trim().split(/\s+/).length;
    }

    /**
     * Check if there is a 'nodeEntered' event in the array of events.
     * @param events An array of events.
     * @return Whether there is a 'nodeEntered' event in the array of events.
     */

  }, {
    key: 'hasNodeEnteredEvent',
    value: function hasNodeEnteredEvent(events) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = events[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var event = _step4.value;

          if (event.event == 'nodeEntered') {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return false;
    }

    /**
     * Determine whether the component has been authored to import work.
     * @param componentContent The component content.
     * @return Whether to import work in this component.
     */

  }, {
    key: 'hasImportWorkConnectedComponent',
    value: function hasImportWorkConnectedComponent(componentContent) {
      return this.hasXConnectedComponent(componentContent, 'importWork');
    }

    /**
     * Determine whether the component has been authored to show work.
     * @param componentContent The component content.
     * @return Whether to show work in this component.
     */

  }, {
    key: 'hasShowWorkConnectedComponent',
    value: function hasShowWorkConnectedComponent(componentContent) {
      return this.hasXConnectedComponent(componentContent, 'showWork');
    }

    /**
     * Determine whether the component has been authored to show classmate work.
     * @param componentContent The component content.
     * @return Whether to show classmate work in this component.
     */

  }, {
    key: 'hasShowClassmateWorkConnectedComponent',
    value: function hasShowClassmateWorkConnectedComponent(componentContent) {
      return this.hasXConnectedComponent(componentContent, 'showClassmateWork');
    }

    /**
     * Determine whether the component has a connected component of the given type.
     * @param componentContent The component content.
     * @param connectedComponentType The connected component type.
     * @return Whether the component has a connected component of the given type.
     */

  }, {
    key: 'hasXConnectedComponent',
    value: function hasXConnectedComponent(componentContent, connectedComponentType) {
      if (componentContent.connectedComponents != null) {
        var connectedComponents = componentContent.connectedComponents;
        // loop through all the connected components
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = connectedComponents[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var connectedComponent = _step5.value;

            if (connectedComponent.type == connectedComponentType) {
              // the connected component is the type we're looking for
              return true;
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      }
      return false;
    }

    /**
     * Temporarily highlight an element in the DOM.
     * @param id The id of the element.
     * @param duration The number of milliseconds to keep the element highlighted.
     */

  }, {
    key: 'temporarilyHighlightElement',
    value: function temporarilyHighlightElement(id) {
      var _this = this;

      var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;

      var element = $('#' + id);
      var originalBackgroundColor = element.css('backgroundColor');
      element.css('background-color', '#FFFF9C');

      /*
       * Use a timeout before starting to transition back to
       * the original background color. For some reason the
       * element won't get highlighted in the first place
       * unless this timeout is used.
       */
      this.$timeout(function () {
        // slowly fade back to the original background color
        element.css({
          'transition': 'background-color 2s ease-in-out',
          'background-color': originalBackgroundColor
        });

        /*
         * remove these styling fields after we perform
         * the fade otherwise the regular mouseover
         * background color change will not work
         */
        _this.$timeout(function () {
          element.css({
            'transition': '',
            'background-color': ''
          });
        }, 2000);
      }, duration);
    }

    /**
     * Render the component state and then generate an image from it.
     * @param componentState The component state to render.
     * @return A promise that will return an image.
     */

  }, {
    key: 'generateImageFromComponentState',
    value: function generateImageFromComponentState(componentState) {
      var _this2 = this;

      var deferred = this.$q.defer();
      this.$mdDialog.show({
        template: '\n        <div style="position: fixed; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(0,0,0,0.2); z-index: 2;"></div>\n        <div align="center" style="position: absolute; top: 100px; left: 200px; z-index: 1000; padding: 20px; background-color: yellow;">\n          <span>{{ "importingWork" | translate }}...</span>\n          <br/>\n          <br/>\n          <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n        </div>\n        <component node-id="{{nodeId}}"\n                   component-id="{{componentId}}"\n                   component-state="{{componentState}}"\n                   mode="student"></component>\n      ',
        locals: {
          nodeId: componentState.nodeId,
          componentId: componentState.componentId,
          componentState: componentState
        },
        controller: DialogController
      });
      function DialogController($scope, $mdDialog, nodeId, componentId, componentState) {
        $scope.nodeId = nodeId;
        $scope.componentId = componentId;
        $scope.componentState = componentState;
        $scope.closeDialog = function () {
          $mdDialog.hide();
        };
      }
      DialogController.$inject = ['$scope', '$mdDialog', 'nodeId', 'componentId', 'componentState'];
      // wait for the component in the dialog to finish rendering
      var doneRenderingComponentListener = this.$rootScope.$on('doneRenderingComponent', function (event, args) {
        if (componentState.nodeId == args.nodeId && componentState.componentId == args.componentId) {
          _this2.$timeout(function () {
            _this2.generateImageFromComponentStateHelper(componentState).then(function (image) {
              /*
               * Destroy the listener otherwise this block of code will be called every time
               * doneRenderingComponent is fired in the future.
               */
              doneRenderingComponentListener();
              _this2.$timeout.cancel(destroyDoneRenderingComponentListenerTimeout);
              deferred.resolve(image);
            });
          }, 1000);
        }
      });
      /*
       * Set a timeout to destroy the listener in case there is an error creating the image and
       * we don't get to destroying it above.
       */
      var destroyDoneRenderingComponentListenerTimeout = this.$timeout(function () {
        // destroy the listener
        doneRenderingComponentListener();
      }, 10000);
      return deferred.promise;
    }

    /**
     * The component state has been rendered in the DOM and now we want to create an image
     * from it.
     * @param componentState The component state that has been rendered.
     * @return A promise that will return an image.
     */

  }, {
    key: 'generateImageFromComponentStateHelper',
    value: function generateImageFromComponentStateHelper(componentState) {
      var _this3 = this;

      var deferred = this.$q.defer();
      var componentService = this.$injector.get(componentState.componentType + 'Service');
      componentService.generateImageFromRenderedComponentState(componentState).then(function (image) {
        deferred.resolve(image);
        _this3.$mdDialog.hide();
      });
      return deferred.promise;
    }

    /**
     * Get the connected component associated with the component state.
     * @param componentContent The component content.
     * @param componentState The component state.
     * @return A connected component object or null.
     */

  }, {
    key: 'getConnectedComponentByComponentState',
    value: function getConnectedComponentByComponentState(componentContent, componentState) {
      var nodeId = componentState.nodeId;
      var componentId = componentState.componentId;
      var connectedComponents = componentContent.connectedComponents;
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = connectedComponents[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var connectedComponent = _step6.value;

          if (connectedComponent.nodeId == nodeId && connectedComponent.componentId == componentId) {
            return connectedComponent;
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return null;
    }
  }]);

  return UtilService;
}();

// Get the last element of the array


if (!Array.prototype.last) {
  Array.prototype.last = function () {
    return this[this.length - 1];
  };
}

UtilService.$inject = ['$filter', '$injector', '$mdDialog', '$q', '$rootScope', '$timeout'];

exports.default = UtilService;
//# sourceMappingURL=utilService.js.map
