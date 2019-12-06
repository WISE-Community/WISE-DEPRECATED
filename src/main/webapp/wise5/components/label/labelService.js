import ComponentService from '../componentService';

class LabelService extends ComponentService {

  constructor($filter,
      $q,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    super($filter, StudentDataService, UtilService);
    this.$q = $q;
    this.StudentAssetService = StudentAssetService;
  }

  getComponentTypeLabel() {
    return this.$translate('label.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'Label';
    component.backgroundImage = '';
    component.canCreateLabels = true;
    component.canEditLabels = true;
    component.canDeleteLabels = true;
    component.enableCircles = true;
    component.width = 800;
    component.height = 600;
    component.pointSize = 5;
    component.fontSize = 20;
    component.labelWidth = 20;
    component.labels = [];
    return component;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
    var result = false;
    if (!this.canEdit(component) && this.UtilService.hasNodeEnteredEvent(nodeEvents)) {
      /*
       * the student can't perform any work on this component and has visited
       * this step so we will mark it as completed
       */
      return true;
    }
    if (componentStates && componentStates.length) {
      let submitRequired = node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);

      if (submitRequired) {
        // completion requires a submission, so check for isSubmit in any component states
        for (let i = 0, l = componentStates.length; i < l; i++) {
          let state = componentStates[i];
          if (state.isSubmit && state.studentData) {
            // component state is a submission
            if (state.studentData.labels && state.studentData.labels.length) {
              // there are labels so the component is completed
              result = true;
              break;
            }
          }
        }
      } else {
        // get the last component state
        let l = componentStates.length - 1;
        let componentState = componentStates[l];

        let studentData = componentState.studentData;

        if (studentData != null) {
          if (studentData.labels && studentData.labels.length) {
            // there are labels so the component is completed
            result = true;
          }
        }
      }
    }

    return result;
  };

  /**
   * Determine if the student can perform any work on this component.
   * @param component The component content.
   * @return Whether the student can perform any work on this component.
   */
  canEdit(component) {
    if (this.UtilService.hasShowWorkConnectedComponent(component)) {
      return false;
    }
    return true;
  }

  componentStateHasStudentWork(componentState, componentContent) {
    if (componentState != null) {
      let studentData = componentState.studentData;
      if (studentData != null) {
        // get the labels from the student data
        let labels = studentData.labels;

        if (componentContent == null) {
          // the component content was not provided
          if (labels != null && labels.length > 0) {
            // the student has work
            return true;
          }
        } else {
          // the component content was provided
          let starterLabels = componentContent.labels;
          if (starterLabels == null || starterLabels.length == 0) {
            // there are no starter labels
            if (labels != null && labels.length > 0) {
              // the student has work
              return true;
            }
          } else {
            /*
             * there are starter labels so we will compare it
             * with the student labels
             */
            if (!this.labelArraysAreTheSame(labels, starterLabels)) {
              /*
               * the student has a response that is different than
               * the starter sentence
               */
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Check if the component state has the exact same labels as the starter
   * labels.
   * @param componentState the component state object
   * @param componentContent the component content
   * @return whether the component state has the exact same labels as the
   * starter labels
   */
  componentStateIsSameAsStarter(componentState, componentContent) {
    if (componentState != null) {
      let studentData = componentState.studentData;

      // get the labels from the student data
      let labels = studentData.labels;
      let starterLabels = componentContent.labels;
      if (starterLabels == null || starterLabels.length == 0) {
        // there are no starter labels
        if (labels.length == 0) {
          // the student work doesn't have any labels either
          return true;
        } else if (labels != null && labels.length > 0) {
          // the student has labels
          return false;
        }
      } else {
        // there are starter labels so we will compare it with the student labels
        if (this.labelArraysAreTheSame(labels, starterLabels)) {
          // the student labels are the same as the starter labels
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if the two arrays of labels contain the same values
   * @param labels1 an array of label objects
   * @param labels2 an array of label objects
   * @return whether the labels contain the same values
   */
  labelArraysAreTheSame(labels1, labels2) {
    if (labels1 == null && labels2 == null) {
      return true;
    } else if ((labels1 == null && labels2 != null) ||
           (labels1 != null && labels2 == null)) {
      return false;
    } else {
      if (labels1.length != labels2.length) {
        return false;
      } else {
        for (let l = 0; l < labels1.length; l++) {
          let label1 = labels1[l];
          let label2 = labels2[l];
          if (!this.labelsAreTheSame(label1, label2)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Check if two labels contain the same values
   * @param label1 a label object
   * @param label2 a label object
   * @return whether the labels contain the same values
   */
  labelsAreTheSame(label1, label2) {
    if (label1 == null && label2 == null) {
      return true;
    } else if ((label1 == null && label2 != null) ||
        (label1 != null && label2 == null)) {
      return false;
    } else {
      if ((label1.text != label2.text) ||
        (label1.pointX != label2.pointX) ||
        (label1.pointY != label2.pointY) ||
        (label1.textX != label2.textX) ||
        (label1.textY != label2.textY) ||
        (label1.color != label2.color)) {
        // at least one of the fields are different
        return false
      }
    }

    return true;
  }

  /**
   * Create an image from the text string.
   * @param text A text string.
   * @param width The width of the image we will create.
   * @param height The height of the image we will create.
   * @param maxCharactersPerLine The max number of characters per line.
   * @param xPositionOfText The x position of the text in the image.
   * @param spaceInbetweenLines The amount of space inbetween each line.
   * @param fontSize The font size.
   */
  createImageFromText(text, width, height, maxCharactersPerLine,
      xPositionOfText, spaceInbetweenLines, fontSize) {

    if (width == null || width == '') {
      width = 800;
    }

    if (height == null || height == '') {
      height = 600;
    }

    if (maxCharactersPerLine == null || maxCharactersPerLine == '') {
      maxCharactersPerLine = 100;
    }

    if (xPositionOfText == null || xPositionOfText == '') {
      xPositionOfText = 10;
    }

    if (spaceInbetweenLines == null || spaceInbetweenLines == '') {
      spaceInbetweenLines = 40;
    }

    if (fontSize == null || fontSize == '') {
      fontSize = 16;
    }

    /*
     * Line wrap the text so that each line does not exceed the max number of
     * characters.
     */
    let textWrapped = this.UtilService.wordWrap(text, maxCharactersPerLine);

    // create a promise that will return an image of the concept map
    var deferred = this.$q.defer();

    // create a div to draw the SVG in
    var svgElement = document.createElement('div');

    var draw = SVG(svgElement);
    draw.width(width);
    draw.height(height);

    /*
     * We will create a tspan for each line.
     * Example
     * <tspan x="10" dy="40">The quick brown fox jumps over the lazy dog. One fish, two fish, red fish, blue fish. Green eggs</tspan>
     * <tspan x="10" dy="40">and ham.</tspan>
     */
    let tspans = '';
    let textLines = textWrapped.split('\n');
    for (let textLine of textLines) {
      tspans += '<tspan x="' + xPositionOfText + '" dy="' + spaceInbetweenLines + '">' + textLine + '</tspan>';
    }

    /*
     * Wrap the tspans in a text element.
     * Example
     * <text id="SvgjsText1008" font-family="Helvetica, Arial, sans-serif" font-size="16">
     *   <tspan x="10" dy="40">The quick brown fox jumps over the lazy dog. One fish, two fish, red fish, blue fish. Green eggs</tspan>
     *   <tspan x="10" dy="40">and ham.</tspan>
     * </text>
     */
    let svgTextElementString = '<text id="SvgjsText1008" font-family="Helvetica, Arial, sans-serif" font-size="' + fontSize + '">' + tspans + '</text>';

    /*
     * Insert the text element into the svg.
     * Example
     * <svg id="SvgjsSvg1010" width="800" height="600" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs">
     *   <defs id="SvgjsDefs1011"></defs>
     *   <text id="SvgjsText1008" font-family="Helvetica, Arial, sans-serif" font-size="16">
     *     <tspan x="10" dy="40">The quick brown fox jumps over the lazy dog. One fish, two fish, red fish, blue fish. Green eggs</tspan>
     *     <tspan x="10" dy="40">and ham.</tspan>
     *   </text>
     * </svg>
     */
    var svgString = svgElement.innerHTML;
    svgString = svgString.replace('</svg>', svgTextElementString + '</svg>');

    // create a canvas to draw the image on
    var myCanvas = document.createElement('canvas');
    var ctx = myCanvas.getContext('2d');

    // create an svg blob
    var svg = new Blob([svgString], {type:'image/svg+xml;charset=utf-8'});
    var domURL = self.URL || self.webkitURL || self;
    var url = domURL.createObjectURL(svg);
    var image = new Image;

    /*
     * set the UtilService in a local variable so we can access it
     * in the onload callback function
     */
    var thisUtilService = this.UtilService;

    // the function that is called after the image is fully loaded
    image.onload = (event) => {

      // get the image that was loaded
      var image = event.target;

      // set the dimensions of the canvas
      myCanvas.width = image.width;
      myCanvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      // get the canvas as a Base64 string
      var base64Image = myCanvas.toDataURL('image/png');

      // get the image object
      var imageObject = thisUtilService.getImageObjectFromBase64String(base64Image);

      // create a student asset image
      this.StudentAssetService.uploadAsset(imageObject).then((unreferencedAsset) => {

        /*
         * make a copy of the unreferenced asset so that we
         * get a referenced asset
         */
        this.StudentAssetService.copyAssetForReference(unreferencedAsset).then((referencedAsset) => {
          if (referencedAsset != null) {
            /*
             * get the asset url
             * for example
             * /wise/studentuploads/11261/297478/referenced/picture_1494016652542.png
             * if we are in preview mode this url will be a base64 string instead
             */
            var referencedAssetUrl = referencedAsset.url;

            // remove the unreferenced asset
            this.StudentAssetService.deleteAsset(unreferencedAsset);

            // resolve the promise with the image url
            deferred.resolve(referencedAssetUrl);
          }
        });
      });
    };

    // set the src of the image so that the image gets loaded
    image.src = url;

    return deferred.promise;
  }

  /**
   * The component state has been rendered in a <component></component> element
   * and now we want to take a snapshot of the work.
   * @param componentState The component state that has been rendered.
   * @return A promise that will return an image object.
   */
  generateImageFromRenderedComponentState(componentState) {
    let deferred = this.$q.defer();
    let canvas = angular.element(document.querySelector('#canvas_' + componentState.nodeId + '_' + componentState.componentId));
    if (canvas != null && canvas.length > 0) {
      canvas = canvas[0];

      // get the canvas as a base64 string
      let img_b64 = canvas.toDataURL('image/png');

      // get the image object
      let imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);

      // add the image to the student assets
      this.StudentAssetService.uploadAsset(imageObject).then((asset) => {
        deferred.resolve(asset);
      });
    }
    return deferred.promise;
  }
}

LabelService.$inject = [
  '$filter',
  '$q',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default LabelService;
