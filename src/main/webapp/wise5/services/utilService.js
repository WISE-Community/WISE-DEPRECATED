'use strict';

class UtilService {
  constructor(
      $filter,
      $injector,
      $mdDialog,
      $q,
      $rootScope,
      $timeout) {
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
  generateKey(length) {
    this.CHARS = ["a","b","c","d","e","f","g","h","i","j","k","l","m",
        "n","o","p","q","r", "s","t","u","v","w","x","y","z",
        "0","1","2","3","4","5","6","7","8","9"];

    if (!length) {
      length = 10;
    }

    let key = '';
    for (let a = 0; a < length; a++) {
      key += this.CHARS[Math.floor(Math.random() * (this.CHARS.length - 1))];
    }

    return key;
  };

  /**
   * Try to convert a string to a number
   * @param str the string to convert
   * @returns a number if we were able to convert the string to a number.
   * if we couldn't convert the string to a number we will just return the string.
   */
  convertStringToNumber(str) {
    if (str != null && str != '' && !isNaN(Number(str))) {
      return Number(str);
    }
    return str;
  };

  /**
   * Create a copy of a JSON object
   * @param jsonObject the JSON object to get a copy of
   * @return a copy of the JSON object that was passed in
   */
  makeCopyOfJSONObject(jsonObject) {
    if (jsonObject != null) {
      const jsonObjectString = angular.toJson(jsonObject);
      return angular.fromJson(jsonObjectString);
    }
    return null;
  };

  /**
   * Get the image object
   * @params img_b64 the base64 image string
   * @returns an image object
   */
  getImageObjectFromBase64String(img_b64) {
    // create a blob from the base64 image string
    const blob = this.dataURItoBlob(img_b64);

    const now = new Date().getTime();
    const filename = encodeURIComponent('picture_' + now + '.png');
    const pngFile = new File([blob], filename, {
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
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
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
    let imageObject = null;
    if (imageElement != null) {
      // create a canvas element that we will use to generate a base64 string
      const canvas = document.createElement("canvas");

      // set the width and height of the canvas to match the image dimensions
      canvas.width = imageElement.naturalWidth;
      canvas.height = imageElement.naturalHeight;

      // draw the image onto the canvas
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imageElement, 0, 0);

      const dataURL = canvas.toDataURL("image/png");
      imageObject = this.getImageObjectFromBase64String(dataURL);
    }
    return imageObject;
  }

  /**
   * Check if the asset is an image
   * @param fileName the file name of the asset
   * @return whether the asset is an image or not
   */
  isImage(fileName) {
    if (fileName != null) {
      const imageExtensionsRegEx =
          new RegExp('.*\.(png|jpg|jpeg|bmp|gif|tiff|svg)');
      const lowerCaseFileName = fileName.toLowerCase();
      const matchResult = lowerCaseFileName.match(imageExtensionsRegEx);

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
  isVideo(fileName) {
    if (fileName != null) {
      const videoExtensionsRegEx =
          new RegExp('.*\.(mp4|mpg|mpeg|m4v|m2v|avi|gifv|mov|qt)');
      const lowerCaseFileName = fileName.toLowerCase();
      const matchResult = lowerCaseFileName.match(videoExtensionsRegEx);

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
  insertWISELinks(html) {
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
  insertWISELinkAnchors(html) {
    let wiseLinkRegEx = new RegExp(/<a.*?wiselink="true".*?>(.*?)<\/a>/);
    let wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);

    // loop until we have replaced all the matches
    while (wiseLinkRegExMatchResult != null) {
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
    const wiseLinkRegEx = new RegExp(/<button.*?wiselink="true".*?>(.*?)<\/button>/);
    let wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);

    // loop until we have replaced all the matches
    while (wiseLinkRegExMatchResult != null) {
      // get the whole <button> element
      const buttonHTML = wiseLinkRegExMatchResult[0];

      // get the inner html of the <button> element
      const buttonText = wiseLinkRegExMatchResult[1];

      // get the node id parameter of the <button> element
      let nodeId = this.getWISELinkNodeId(buttonHTML);

      if (nodeId == null) {
        nodeId = '';
      }

      let componentIdAttr = "";
      let componentId = this.getWISELinkComponentId(buttonHTML);
      if (componentId != null) {
        componentIdAttr = "component-id='" + componentId + "'";
      }

      // create the <wiselink> element
      const wiselinkHtml = "<wiselink type='button' link-text='" + buttonText + "' node-id='" + nodeId + "' " + componentIdAttr + "/>";

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
    if (html != null) {
      let nodeIdRegEx = new RegExp(/node-id=["'b](.*?)["']/, 'g');
      let nodeIdRegExResult = nodeIdRegEx.exec(html);
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
  getWISELinkComponentId(html) {
    if (html != null) {
      let componentIdRegEx = new RegExp(/component-id=["'b](.*?)["']/, 'g');
      let componentIdRegExResult = componentIdRegEx.exec(html);
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
  getWISELinkType(html) {
    if (html != null) {
      let typeRegEx = new RegExp(/type=["'b](.*?)["']/, 'g');
      let typeRegExResult = typeRegEx.exec(html);
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
  getWISELinkLinkText(html) {
    if (html != null) {
      let linkTextRegEx = new RegExp(/link-text=["'b](.*?)["']/, 'g');
      let linkTextRegExResult = linkTextRegEx.exec(html);
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
  replaceWISELinks(html) {
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
  replaceWISELinksHelper(html, regex) {
    let wiseLinkRegEx = new RegExp(regex);
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
    const thisRootScope = this.$rootScope;

    const InsertAssetButton = function(context) {
      const ui = $.summernote.ui;

      const button = ui.button({
        contents: '<i class="note-icon-picture"></i>',
        tooltip: tooltip,
        click: function () {
          // remember the position of the cursor
          context.invoke('editor.saveRange');

          // create the params for opening the asset chooser
          const params = {};
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
    const thisRootScope = this.$rootScope;

    const InsertWISELinkButton = function(context) {
      const ui = $.summernote.ui;

      const button = ui.button({
        contents: '<i class="note-icon-link"></i>',
        tooltip: tooltip,
        click: function () {
          // remember the position of the cursor
          context.invoke('editor.saveRange');

          // create the params for opening the WISE Link chooser
          const params = {};

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
    };
    return InsertWISELinkButton;
  }

  /**
   * Remove html tags from the string. Also remove new lines.
   * @param html an html string
   * @return text without html tags
   */
  removeHTMLTags(html) {
    let text = '';
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
  endsWith(subjectString, searchString, position) {
    if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
      position = subjectString.length;
    }
    position -= searchString.length;
    const lastIndex = subjectString.lastIndexOf(searchString, position);
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
    const date = new Date(milliseconds);
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
  getComponentTypeLabel(componentType) {
    /*
     * check if we have already obtained the label for this component type
     * before
     */
    let label = this.componentTypeToLabel[componentType];

    if (label == null) {
      let componentService = this.$injector.get(componentType + 'Service');
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
  arraysContainSameValues(array1, array2) {
    if (array1 != null && array2 != null) {
      const array1Copy = this.makeCopyOfJSONObject(array1);
      array1Copy.sort();

      const array2Copy = this.makeCopyOfJSONObject(array2);
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
  hasConnectedComponent(componentContent) {
    if (componentContent != null) {
      const connectedComponents = componentContent.connectedComponents;
      if (connectedComponents != null && connectedComponents.length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param componentContent The component content.
   * @return Whether there are any connected components with a field we always
   * want to read or write.
   */
  hasConnectedComponentAlwaysField(componentContent) {
    if (componentContent != null) {
      const connectedComponents = componentContent.connectedComponents;
      if (connectedComponents != null && connectedComponents.length > 0) {
        for (let connectedComponent of connectedComponents) {
          if (connectedComponent.fields != null) {
            for (let field of connectedComponent.fields) {
              if (field.when == "always") {
                return true;
              }
            }
          }
        }
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
      const connectedComponents = componentContent.connectedComponents;
      if (connectedComponents != null) {
        for (let connectedComponent of connectedComponents) {
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
      const connectedComponents = componentContent.connectedComponents;
      if (connectedComponents != null) {
        for (let connectedComponent of connectedComponents) {
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
    for (let element of arrayToCheck) {
      if (element != null) {
        return true;
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
  wordWrap(str, maxWidth) {
    if (str.length <= maxWidth) {
      return str;
    }
    let newLineStr = "\n";
    let done = false;
    let res = '';
    do {
        let found = false;
        // Inserts new line at first whitespace of the line
        for (let i = maxWidth - 1; i >= 0; i--) {
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

        if (str.length < maxWidth)
            done = true;
    } while (!done);

    return res + str;
  }

  /**
   * Helper function for wordWrap().
   * @param x A single character string.
   * @return Whether the single character is a whitespace character.
   */
  testWhite(x) {
    let white = new RegExp(/^\s$/);
    return white.test(x.charAt(0));
  };

  /**
   * Get the number of words in the string.
   * @param str The string.
   * @return The number of words in the string.
   */
  wordCount(str) {
    return str.trim().split(/\s+/).length;
  }

  /**
   * Check if there is a 'nodeEntered' event in the array of events.
   * @param events An array of events.
   * @return Whether there is a 'nodeEntered' event in the array of events.
   */
  hasNodeEnteredEvent(events) {
    for (let event of events) {
      if (event.event == 'nodeEntered') {
        return true;
      }
    }
    return false;
  }

  /**
   * Determine whether the component has been authored to import work.
   * @param componentContent The component content.
   * @return Whether to import work in this component.
   */
  hasImportWorkConnectedComponent(componentContent) {
    return this.hasXConnectedComponent(componentContent, 'importWork');
  }

  /**
   * Determine whether the component has been authored to show work.
   * @param componentContent The component content.
   * @return Whether to show work in this component.
   */
  hasShowWorkConnectedComponent(componentContent) {
    return this.hasXConnectedComponent(componentContent, 'showWork');
  }

  /**
   * Determine whether the component has been authored to show classmate work.
   * @param componentContent The component content.
   * @return Whether to show classmate work in this component.
   */
  hasShowClassmateWorkConnectedComponent(componentContent) {
    return this.hasXConnectedComponent(componentContent, 'showClassmateWork');
  }

  /**
   * Determine whether the component has a connected component of the given type.
   * @param componentContent The component content.
   * @param connectedComponentType The connected component type.
   * @return Whether the component has a connected component of the given type.
   */
  hasXConnectedComponent(componentContent, connectedComponentType) {
    if (componentContent.connectedComponents != null) {
      let connectedComponents = componentContent.connectedComponents;
      // loop through all the connected components
      for (let connectedComponent of connectedComponents) {
        if (connectedComponent.type == connectedComponentType) {
          // the connected component is the type we're looking for
          return true;
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
  temporarilyHighlightElement(id, duration = 1000) {
    let element = $('#' + id);
    let originalBackgroundColor = element.css('backgroundColor');
    element.css('background-color', '#FFFF9C');

    /*
     * Use a timeout before starting to transition back to
     * the original background color. For some reason the
     * element won't get highlighted in the first place
     * unless this timeout is used.
     */
    this.$timeout(() => {
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
      this.$timeout(() => {
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
  generateImageFromComponentState(componentState) {
    let deferred = this.$q.defer();
    this.$mdDialog.show({
      template: `
        <div style="position: fixed; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(0,0,0,0.2); z-index: 2;"></div>
        <div align="center" style="position: absolute; top: 100px; left: 200px; z-index: 1000; padding: 20px; background-color: yellow;">
          <span>{{ "importingWork" | translate }}...</span>
          <br/>
          <br/>
          <md-progress-circular md-mode="indeterminate"></md-progress-circular>
        </div>
        <component node-id="{{nodeId}}"
                   component-id="{{componentId}}"
                   component-state="{{componentState}}"
                   mode="student"></component>
      `,
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
      $scope.closeDialog = function() {
        $mdDialog.hide();
      }
    }
    DialogController.$inject = ['$scope', '$mdDialog', 'nodeId', 'componentId', 'componentState'];
    // wait for the component in the dialog to finish rendering
    let doneRenderingComponentListener = this.$rootScope.$on('doneRenderingComponent', (event, args) => {
      if (componentState.nodeId == args.nodeId && componentState.componentId == args.componentId) {
        this.$timeout(() => {
          this.generateImageFromComponentStateHelper(componentState).then((image) => {
            /*
             * Destroy the listener otherwise this block of code will be called every time
             * doneRenderingComponent is fired in the future.
             */
            doneRenderingComponentListener();
            this.$timeout.cancel(destroyDoneRenderingComponentListenerTimeout);
            deferred.resolve(image);
          });
        }, 1000);
      }
    });
    /*
     * Set a timeout to destroy the listener in case there is an error creating the image and
     * we don't get to destroying it above.
     */
    let destroyDoneRenderingComponentListenerTimeout = this.$timeout(() => {
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
  generateImageFromComponentStateHelper(componentState) {
    let deferred = this.$q.defer();
    let componentService = this.$injector.get(componentState.componentType + 'Service');
    componentService.generateImageFromRenderedComponentState(componentState).then((image) => {
      deferred.resolve(image);
      this.$mdDialog.hide();
    });
    return deferred.promise;
  }

  /**
   * Get the connected component associated with the component state.
   * @param componentContent The component content.
   * @param componentState The component state.
   * @return A connected component object or null.
   */
  getConnectedComponentByComponentState(componentContent, componentState) {
    let nodeId = componentState.nodeId;
    let componentId = componentState.componentId;
    let connectedComponents = componentContent.connectedComponents;
    for (let connectedComponent of connectedComponents) {
      if (connectedComponent.nodeId == nodeId && connectedComponent.componentId == componentId) {
        return connectedComponent;
      }
    }
    return null;
  }

  showJSONValidMessage() {
    this.setIsJSONValidMessage(true);
  }

  showJSONInvalidMessage() {
    this.setIsJSONValidMessage(false);
  }

  hideJSONValidMessage() {
    this.setIsJSONValidMessage(null);
  }

  /**
   * Show the message in the toolbar that says "JSON Valid" or "JSON Invalid".
   * @param isJSONValid
   * true if we want to show "JSON Valid"
   * false if we want to show "JSON Invalid"
   * null if we don't want to show anything
   */
  setIsJSONValidMessage(isJSONValid) {
    this.$rootScope.$broadcast('setIsJSONValid', { isJSONValid: isJSONValid });
  }

  moveObjectUp(objects, index) {
    if (index !== 0) {
      const object = objects[index];
      objects.splice(index, 1);
      objects.splice(index - 1, 0, object);
    }
  }

  moveObjectDown(objects, index) {
    if (index !== objects.length - 1) {
      const object = objects[index];
      objects.splice(index, 1);
      objects.splice(index + 1, 0, object);
    }
  }

  restoreSummernoteCursorPosition(summernoteId) {
    angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.restoreRange');
    angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.focus');
  }

  insertImageIntoSummernote(summernoteId, fullAssetPath, fileName) {
    angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertImage', fullAssetPath, fileName);
  }

  insertVideoIntoSummernote(summernoteId, fullAssetPath) {
    const videoElement = document.createElement('video');
    videoElement.controls = 'true';
    videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
    angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertNode', videoElement);
  }

  rgbToHex(color, opacity) {
    let values = color
      .replace(/rgb?\(/, '')
      .replace(/\)/, '')
      .replace(/[\s+]/g, '')
      .split(',');
    let a = parseFloat(opacity || 1),
      r = Math.floor(a * parseInt(values[0]) + (1 - a) * 255),
      g = Math.floor(a * parseInt(values[1]) + (1 - a) * 255),
      b = Math.floor(a * parseInt(values[2]) + (1 - a) * 255);
    return "#" +
      ("0" + r.toString(16)).slice(-2) +
      ("0" + g.toString(16)).slice(-2) +
      ("0" + b.toString(16)).slice(-2);
  }

  isMatchingPeriods(periodId1, periodId2) {
    return this.isAllPeriods(periodId1) || this.isAllPeriods(periodId2) || periodId1 == periodId2;
  }

  isAllPeriods(periodId) {
    return periodId == null || periodId === -1;
  }
}

// Get the last element of the array
if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
}

UtilService.$inject = [
  '$filter',
  '$injector',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$timeout'
];

export default UtilService;
