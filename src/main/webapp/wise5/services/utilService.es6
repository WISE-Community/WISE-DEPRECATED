'use strict';

class UtilService {

  constructor($filter,
              $injector,
              $rootScope) {
    this.$filter = $filter;
    this.$injector = $injector;
    this.$rootScope = $rootScope;

    this.componentTypeToLabel = {};

    this.$translate = this.$filter('translate');
  }

  /**
   * Generates and returns a random key of the given length if
   * specified. If length is not specified, returns a key 10
   * characters in length.
   */
  generateKey(length) {
    this.CHARS = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r", "s","t",
      "u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9"];

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
  };

  /**
   * Try to convert a string to a number
   * @param str the string to convert
   * @returns a number if we were able to convert the string to a number.
   * if we couldn't convert the string to a number we will just return the string.
   */
  convertStringToNumber(str) {
    var result = str;

    if (str != null && str != '' && !isNaN(Number(str))) {
      result = Number(str);
    }

    return result;
  };

  /**
   * Create a copy of a JSON object
   * @param jsonObject the JSON object to get a copy of
   * @return a copy of the JSON object that was passed in
   */
  makeCopyOfJSONObject(jsonObject) {
    var copyOfJSONObject = null;

    if (jsonObject != null) {
      // create a JSON string from the JSON object
      var jsonObjectString = angular.toJson(jsonObject);

      // create a JSON object from the JSON string
      copyOfJSONObject = angular.fromJson(jsonObjectString);
    }

    return copyOfJSONObject;
  };

  /**
   * Get the image object
   * @params img_b64 the base64 image string
   * @returns an image object
   */
  getImageObjectFromBase64String(img_b64) {

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
  dataURItoBlob(dataURI) {

    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
  };

  /**
   * Get an image object from an image element
   * @param imageElement an image element (<img src='abc.jpg'/>)
   * @returns an image object
   */
  getImageObjectFromImageElement(imageElement) {

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
  hideIFrames() {

    // get all the iframes
    var iframes = angular.element('iframe');

    // loop through all the iframes
    for (var iframe of iframes) {
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
  showIFrames() {

    // get all the iframes
    var iframes = angular.element('iframe');

    // loop through all the iframes
    for (var iframe of iframes) {
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
  isImage(fileName) {
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
   * @return whether the asset is a video or not
   */
  isVideo(fileName) {
    var result = false;

    if (fileName != null) {
      var lowerCaseFileName = fileName.toLowerCase();

      // regex to match video extensions
      var videoExtensionsRegEx = new RegExp('.*\.(mp4|mpg|mpeg|m4v|m2v|avi|gifv|mov|qt)');

      var matchResult = lowerCaseFileName.match(videoExtensionsRegEx);

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
  insertWISELinks(html) {

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
  insertWISELinkAnchors(html) {

    // find <a> elements with the parameter wiselink=true
    let wiseLinkRegEx = new RegExp(/<a.*?wiselink="true".*?>(.*?)<\/a>/);

    // find the first match
    let wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);

    // loop until we have replaced all the matches
    while(wiseLinkRegExMatchResult != null) {

      // get the whole <a> element
      let anchorHTML = wiseLinkRegExMatchResult[0];

      // get the inner html of the <a> element
      let anchorText = wiseLinkRegExMatchResult[1];

      // get the node id parameter of the <a> element
      let nodeId = this.getWISELinkNodeId(anchorHTML);

      if (nodeId == null) {
        nodeId = '';
      }

      let componentIdAttr = "";
      let componentId = this.getWISELinkComponentId(anchorHTML);
      if (componentId != null) {
        componentIdAttr = "component-id='" + componentId + "'";
      }

      // create the <wiselink> element
      let wiselinkHtml = "<wiselink type='link' link-text='" + anchorText + "' node-id='" + nodeId + "' " + componentIdAttr + "/>";

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
  insertWISELinkButtons(html) {

    // find <button> elements with the parameter wiselink=true
    var wiseLinkRegEx = new RegExp(/<button.*?wiselink="true".*?>(.*?)<\/button>/);

    // find the first match
    var wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);

    // loop until we have replaced all the matches
    while(wiseLinkRegExMatchResult != null) {

      // get the whole <button> element
      var buttonHTML = wiseLinkRegExMatchResult[0];

      // get the inner html of the <button> element
      var buttonText = wiseLinkRegExMatchResult[1];

      // get the node id parameter of the <button> element
      var nodeId = this.getWISELinkNodeId(buttonHTML);

      if (nodeId == null) {
        nodeId = '';
      }

      let componentIdAttr = "";
      let componentId = this.getWISELinkComponentId(buttonHTML);
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
  getWISELinkNodeId(html) {

    let nodeId = null;

    if (html != null) {
      // create the regex to find the node id parameter
      let nodeIdRegEx = new RegExp(/node-id=["'b](.*?)["']/, 'g');

      // try to find a match
      let nodeIdRegExResult = nodeIdRegEx.exec(html);

      if (nodeIdRegExResult != null) {
        // we have found a node id
        nodeId = nodeIdRegExResult[1];
      }
    }

    return nodeId;
  }

  /**
   * Get the component id from the wiselink element
   * e.g.
   * <wiselink node-id='node5' component-id='xyzabc' />
   * the component id in this case is 'xyzabc'
   * @param html the html for the element
   * @return the component id from the component id parameter in the element
   */
  getWISELinkComponentId(html) {

    let componentId = null;

    if (html != null) {
      // create the regex to find the component id parameter
      let componentIdRegEx = new RegExp(/component-id=["'b](.*?)["']/, 'g');

      // try to find a match
      let componentIdRegExResult = componentIdRegEx.exec(html);

      if (componentIdRegExResult != null) {
        // we have found a node id
        componentId = componentIdRegExResult[1];
      }
    }

    return componentId;
  }

  /**
   * Get the link type from the wiselink element
   * e.g.
   * <wiselink type='button'/>
   * the type in this case is 'button'
   * @param html the html for the element
   * @return the link type from the type parameter in the element
   */
  getWISELinkType(html) {
    let type = null;

    if (html != null) {
      // create the regex to find the type
      let typeRegEx = new RegExp(/type=["'b](.*?)["']/, 'g');

      // try to find a match
      let typeRegExResult = typeRegEx.exec(html);

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
  getWISELinkLinkText(html) {
    let linkText = null;

    if (html != null) {
      // create the regex to find the link text
      let linkTextRegEx = new RegExp(/link-text=["'b](.*?)["']/, 'g');

      // try to find a match
      let linkTextRegExResult = linkTextRegEx.exec(html);

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
  replaceWISELinks(html) {

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
  replaceWISELinksHelper(html, regex) {

    // create the regex
    let wiseLinkRegEx = new RegExp(regex);

    // find the first match
    let wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);

    // loop until we have replaced all the matches
    while (wiseLinkRegExMatchResult != null) {

      /*
       * get the whole match
       * e.g. <wiselink type='link' node-id='node5' link-text='Go to here'/>
       */
      let wiseLinkHTML = wiseLinkRegExMatchResult[0];

      // get the node id, component id (if exists), type and link text from the match
      let nodeId = this.getWISELinkNodeId(wiseLinkHTML);
      let componentId = this.getWISELinkComponentId(wiseLinkHTML);
      let componentHTML = '';
      if (componentId != null && componentId != '') {
        componentHTML = "component-id='" + componentId + "'";
      }
      let type = this.getWISELinkType(wiseLinkHTML);
      let linkText = this.getWISELinkLinkText(wiseLinkHTML);

      let newElement = null;

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
  createInsertAssetButton(controller, projectId, nodeId, componentId, target, tooltip) {

    var thisRootScope = this.$rootScope;

    // a custom button that opens the asset chooser
    var InsertAssetButton = function(context) {
      var ui = $.summernote.ui;

      // create button
      var button = ui.button({
        contents: '<i class="note-icon-picture"></i>',
        tooltip: tooltip,
        click: function () {
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

      return button.render();   // return button as jquery object
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
  createInsertWISELinkButton(controller, projectId, nodeId, componentId, target, tooltip) {

    var thisRootScope = this.$rootScope;

    // a custom button that opens the WISE Link authoring popup
    var InsertWISELinkButton = function(context) {
      var ui = $.summernote.ui;

      // create button
      var button = ui.button({
        contents: '<i class="note-icon-link"></i>',
        tooltip: tooltip,
        click: function () {
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

      return button.render();   // return button as jquery object
    }

    return InsertWISELinkButton;
  }

  /**
   * Remove html tags from the string. Also remove new lines.
   * @param html an html string
   * @return text without html tags
   */
  removeHTMLTags(html) {

    var text = '';

    if (html != null) {
      // remove tags
      text = html.replace(/<\/?[^>]+(>|$)/g, " ");

      // remove new lines
      text = text.replace(/\n/g, " ");

      // remove line returns
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
  endsWith(subjectString, searchString, position) {
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
  sortByServerSaveTime(object1, object2) {

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
  convertMillisecondsToFormattedDateTime(milliseconds) {

    var dateTimeString = "";

    // create a Date object with the milliseconds
    var date = new Date(milliseconds);

    if (date != null) {
      // get the date time string e.g. Wed Apr 06 2016 9:05:38 AM
      dateTimeString = date.toDateString() + " " + date.toLocaleTimeString();
    }

    return dateTimeString;
  }

  /**
   * Get the label for the given component type
   * @param componentType string
   * @return string label for the component type
   */
  getComponentTypeLabel(componentType) {

    /*
     * check if we have already obtained the label for this component type
     * before
     */
    let label = this.componentTypeToLabel[componentType];

    if (label == null) {
      // we have not obtained the label before

      // get the service for the component type
      let componentService = this.$injector.get(componentType + 'Service');

      if (componentService != null && componentService.getComponentTypeLabel != null) {

        // get the label for the component type
        label = componentService.getComponentTypeLabel();

        // add the entry of component type to label for future lookup
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
  arraysContainSameValues(array1, array2) {

    if (array1 != null && array2 != null) {
      // make a copy of array 1 and sort it
      var array1Copy = this.makeCopyOfJSONObject(array1);
      array1Copy.sort();

      // make a copy of array 2 and sort it
      var array2Copy = this.makeCopyOfJSONObject(array2);
      array2Copy.sort();

      // compare the string values of both array
      if (angular.toJson(array1Copy) == angular.toJson(array2Copy)) {
        // the arrays are the same
        return true;
      }
    }

    // the arrays are not the same
    return false;
  }

  /**
   * Whether there are any connected components
   * @param componentContent the component content
   * @return whether there are any connected components
   */
  hasConnectedComponent(componentContent) {

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
  hasShowWorkConnectedComponent(componentContent) {

    if (componentContent != null) {

      var connectedComponents = componentContent.connectedComponents;

      if (connectedComponents != null) {
        for (var connectedComponent of connectedComponents) {
          if (connectedComponent != null) {

            if (connectedComponent.type == 'showWork') {
              return true;
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
  hasImportWorkConnectedComponent(componentContent) {

    if (componentContent != null) {

      var connectedComponents = componentContent.connectedComponents;

      if (connectedComponents != null) {
        for (var connectedComponent of connectedComponents) {
          if (connectedComponent != null) {

            if (connectedComponent.type == 'importWork') {
              return true;
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
  arrayHasNonNullElement(arrayToCheck) {
    if (arrayToCheck != null) {
      for (let element of arrayToCheck) {
        if (element != null) {
          return true;
        }
      }
    }
    return false;
  }
}

// Get the last element of the array
if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
};

UtilService.$inject = [
  '$filter',
  '$injector',
  '$rootScope'
];

export default UtilService;
