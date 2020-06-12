import * as angular from 'angular';
import ComponentService from '../componentService';
import { ConfigService } from '../../services/configService';
import StudentAssetService from '../../services/studentAssetService';
import ConceptMapNode from './conceptMapNode';
import ConceptMapLink from './conceptMapLink';

class ConceptMapService extends ComponentService {
  $anchorScroll: any;
  $location: any;
  $q: any;
  $timeout: any;
  ConfigService: ConfigService;
  StudentAssetService: StudentAssetService;

  static $inject = [
    '$anchorScroll',
    '$filter',
    '$location',
    '$q',
    '$timeout',
    'ConfigService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor(
    $anchorScroll,
    $filter,
    $location,
    $q,
    $timeout,
    ConfigService,
    StudentAssetService,
    StudentDataService,
    UtilService
  ) {
    super($filter, StudentDataService, UtilService);
    this.$anchorScroll = $anchorScroll;
    this.$location = $location;
    this.$q = $q;
    this.$timeout = $timeout;
    this.ConfigService = ConfigService;
    this.StudentAssetService = StudentAssetService;
  }

  getComponentTypeLabel() {
    return this.$translate('conceptMap.componentTypeLabel');
  }

  createComponent() {
    const component: any = super.createComponent();
    component.type = 'ConceptMap';
    component.width = 800;
    component.height = 600;
    component.background = null;
    component.stretchBackground = null;
    component.nodes = [];
    component.linksTitle = '';
    component.links = [];
    component.rules = [];
    component.starterConceptMap = null;
    component.customRuleEvaluator = '';
    component.showAutoScore = false;
    component.showAutoFeedback = false;
    component.showNodeLabels = true;
    return component;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
    let result = false;

    if (componentStates && componentStates.length) {
      const submitRequired =
        node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);

      if (submitRequired) {
        // completion requires a submission, so check for isSubmit in any component states
        for (let i = 0, l = componentStates.length; i < l; i++) {
          const state = componentStates[i];
          if (state.isSubmit && state.studentData) {
            // component state is a submission
            if (
              state.isSubmit == true ||
              (state.studentData.submitCounter != null && state.studentData.submitCounter > 0)
            ) {
              // there is a response so the component is completed
              result = true;
              break;
            }
          }
        }
      } else {
        // get the last component state
        const l = componentStates.length - 1;
        const componentState = componentStates[l];

        const studentData = componentState.studentData;

        if (studentData != null) {
          if (studentData.conceptMapData != null) {
            // there is a response so the component is completed
            result = true;
          }
        }
      }
    }

    return result;
  }

  /**
   * Create an instance of the ConceptMapNode class
   * @param draw the svg.js draw object
   * @param id the node id
   * @param filePath the file path of the image
   * @param label the label of the node
   * @param x the x coordinate
   * @param y the y coordinate
   * @param width the width of the image
   * @param height the height of the image
   * @param showLabel whether to show the label
   * @param a ConceptMapNode
   */
  newConceptMapNode(draw, id, originalId, filePath, label, x, y, width, height, showLabel) {
    return new ConceptMapNode(
      draw,
      id,
      originalId,
      filePath,
      label,
      x,
      y,
      width,
      height,
      showLabel
    );
  }

  /**
   * Create an instance of the ConceptMapLink class
   * @param draw the svg.js draw object
   * @param id the link id
   * @param node the source ConceptMapNode that the link is coming out of
   * @param x the x position of the tail
   * @param y the y position of the tail
   * @returns a ConceptMapLink
   */
  newConceptMapLink(
    draw,
    id,
    originalId = null,
    sourceNode = null,
    destinationNode = null,
    label = null,
    color = null,
    curvature = null,
    startCurveUp = null,
    startCurveDown = null
  ) {
    return new ConceptMapLink(
      draw,
      id,
      originalId,
      sourceNode,
      destinationNode,
      label,
      color,
      curvature,
      startCurveUp,
      startCurveDown
    );
  }

  /**
   * Get the slope of the line between two points
   * @param x1 x position of the first point
   * @param y1 y position of the first point
   * @param x2 x position of the second point
   * @param y2 y position of the second point
   * @returns the slope of the line or null if the slope is infinite
   */
  getSlope(x1, y1, x2, y2) {
    let slope = null;

    if (x2 - x1 == 0) {
      // the slope is infinite so we will return null
      slope = null;
    } else {
      // calculate the slope
      slope = (y2 - y1) / (x2 - x1);
    }

    return slope;
  }

  /**
   * Calculate the euclidean distance between two points
   * @param x1 x position of the first point
   * @param y1 y position of the first point
   * @param x2 x position of the second point
   * @param y2 y position of the second point
   * @returns the distance between the two points
   */
  calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * Evaluate a rule name
   * @param componentContent the component content
   * @param conceptMapData the student concept map data
   * @param ruleName the rule name
   * @returns whether the rule was satisfied
   */
  evaluateRuleByRuleName(componentContent, conceptMapData, ruleName) {
    let result = false;

    if (ruleName === true) {
      // the rule name is not actually a rule but is the true boolean
      return true;
    } else if (ruleName === false) {
      // the rule name is not actually a rule but is the false boolean
      return false;
    }

    // get the rule
    const rule = this.getRuleByRuleName(componentContent, ruleName);

    if (rule == null) {
      /*
       * we didn't find a rule with the given rule name so we will look
       * for a category with that name
       */

      // get the rules that are in the category
      const rules = this.getRulesByCategoryName(componentContent, ruleName);

      let firstRule = true;

      if (rules != null) {
        /*
         * loop through all the rules in the category. we will say the
         * category is satisfied if all the rules in the category
         * evaluate to true.
         */
        for (let r = 0; r < rules.length; r++) {
          const tempRule = rules[r];

          // evaluate the rule
          const tempResult = this.evaluateRule(conceptMapData, tempRule);

          if (firstRule) {
            /*
             * this is the first rule so we will set the value
             * of the rule to the result
             */
            result = tempResult;
            firstRule = false;
          } else {
            /*
             * this is not the first rule so we will compute the
             * "logical and" of the result so far and this rule's
             * result
             */
            result = result && tempResult;
          }

          if (!result) {
            /*
             * the result is false so we can short circuit and
             * stop looping since we have now just found that
             * one of the rules is not satisfied which means
             * the category is not satisfied.
             */
            break;
          }
        }
      }
    } else {
      // evaluate the rule
      result = this.evaluateRule(conceptMapData, rule);
    }

    return result;
  }

  /**
   * Evaluate a rule
   * @param conceptMapData the concept map student data
   * @param rule the rule object
   * @returns whether the rule was satisfied
   */
  evaluateRule(conceptMapData, rule) {
    let result = false;

    if (rule != null) {
      if (rule.type == 'node') {
        // this is a node rule

        // get the node we are looking for
        const nodeLabel = rule.nodeLabel;

        // get all the nodes with the given label
        const nodes = this.getNodesByLabel(conceptMapData, nodeLabel);

        // get the number of nodes with the given label
        const nodeCount = nodes.length;

        /*
         * the comparison for the number which can be "exactly",
         * "more than", or "less than"
         */
        const comparison = rule.comparison;

        // the number to compare to
        const number = rule.number;

        if (comparison == 'exactly') {
          /*
           * we are looking for an exact number of nodes with the
           * given label
           */
          if (nodeCount == number) {
            result = true;
          }
        } else if (comparison == 'more than') {
          /*
           * we are looking for more than a certain number of nodes
           * with the given label
           */
          if (nodeCount > number) {
            result = true;
          }
        } else if (comparison == 'less than') {
          /*
           * we are looking for less than a certain number of nodes
           * with the given label
           */
          if (nodeCount < number) {
            result = true;
          }
        }

        if (rule.not) {
          /*
           * the rule is satisfied if the result is false so we will
           * negate the result
           */
          result = !result;
        }
      } else if (rule.type == 'link') {
        // this is a link rule

        // get the source node label
        const nodeLabel = rule.nodeLabel;

        // get the link label
        const linkLabel = rule.linkLabel;

        // get the destination node label
        const otherNodeLabel = rule.otherNodeLabel;

        // get all the links with the matching labels
        const links = this.getLinksByLabels(conceptMapData, nodeLabel, linkLabel, otherNodeLabel);

        // get the number of links with the matching labels
        const linkCount = links.length;

        /*
         * the comparison for the number which can be "exactly",
         * "more than", or "less than"
         */
        const comparison = rule.comparison;

        // the number to compare to
        const number = rule.number;

        if (comparison == 'exactly') {
          // we are looking for an exact number of links
          if (linkCount == number) {
            result = true;
          }
        } else if (comparison == 'more than') {
          // we are looking for more than a certain number of links
          if (linkCount > number) {
            result = true;
          }
        } else if (comparison == 'less than') {
          // we are looking for less than a certain number of links
          if (linkCount < number) {
            result = true;
          }
        }

        if (rule.not) {
          /*
           * the rule is satisfied if the result is false so we will
           * negate the result
           */
          result = !result;
        }
      }
    }

    return result;
  }

  /**
   * Get a rule by the rule name
   * @param componentContent the concept map component content
   * @param ruleName the rule name
   * @returns the rule with the given rule name
   */
  getRuleByRuleName(componentContent, ruleName) {
    let rule = null;

    if (ruleName != null) {
      // get the rules
      const rules = componentContent.rules;

      if (rules != null) {
        // loop through all the rules
        for (let r = 0; r < rules.length; r++) {
          // get a rule
          const tempRule = rules[r];

          if (tempRule != null) {
            if (ruleName == tempRule.name) {
              // we have found the rule with the name we want
              rule = tempRule;
            }
          }
        }
      }
    }

    return rule;
  }

  /**
   * Get the rules in the category
   * @param componentContent the component content
   * @param category the category name
   * @returns the rules in the category
   */
  getRulesByCategoryName(componentContent, category) {
    const rules = [];

    if (componentContent != null) {
      // get all the rules
      const tempRules = componentContent.rules;

      if (tempRules != null) {
        // loop through all the rules
        for (let r = 0; r < tempRules.length; r++) {
          const rule = tempRules[r];

          if (rule != null) {
            // get the categories the rule is in
            const categories = rule.categories;

            if (categories != null) {
              // loop through categories the rule is in
              for (let c = 0; c < categories.length; c++) {
                const tempCategory = categories[c];

                if (category == tempCategory) {
                  /*
                   * the rule is in the category we are
                   * searching for
                   */
                  rules.push(rule);
                  break;
                }
              }
            }
          }
        }
      }
    }

    return rules;
  }

  /**
   * Get nodes by label
   * @param conceptMapData the concept map student data
   * @param label the node label to look for
   * @returns all the nodes with the given label
   */
  getNodesByLabel(conceptMapData, label) {
    const nodesByLabel = [];

    if (conceptMapData != null) {
      const nodes = conceptMapData.nodes;

      if (nodes != null) {
        // loop through all the nodes
        for (let n = 0; n < nodes.length; n++) {
          const node = nodes[n];

          if (node != null) {
            if (label == node.label || label == 'any') {
              /*
               * we have found a node with the label we are
               * looking for
               */
              nodesByLabel.push(node);
            }
          }
        }
      }
    }

    return nodesByLabel;
  }

  /**
   * Get links with the given source node label, link label, and destination
   * node label
   * @param conceptMapData the concept map student data
   * @param nodeLabel the source node label
   * @param linkLabel the link label
   * @param otherNodeLabel the destination node label
   * @returns the links with the given source node label, link label, and
   * destination node label
   */
  getLinksByLabels(conceptMapData, nodeLabel, linkLabel, otherNodeLabel) {
    const resultLinks = [];

    if (conceptMapData != null) {
      const links = conceptMapData.links;

      if (links != null) {
        // loop through all the links
        for (let l = 0; l < links.length; l++) {
          const tempLink = links[l];

          if (tempLink != null) {
            // get the labels
            const tempLinkLabel = tempLink.label;
            const sourceNodeLabel = tempLink.sourceNodeLabel;
            const destinationNodeLabel = tempLink.destinationNodeLabel;

            if (
              (nodeLabel == sourceNodeLabel || nodeLabel == 'any') &&
              (linkLabel == tempLinkLabel || linkLabel == 'any') &&
              (otherNodeLabel == destinationNodeLabel || otherNodeLabel == 'any')
            ) {
              // the labels match the ones we are looking for
              resultLinks.push(tempLink);
            }
          }
        }
      }
    }

    return resultLinks;
  }

  /**
   * Check if any of the rules are satisfied
   * @param componentContent the concept map component content
   * @param conceptMapData the concept map student data
   * @param args an array of rule names
   * @returns true if any of the rules are satisifed
   * false if none of the rules are satisified
   */
  any(componentContent, conceptMapData, args) {
    // loop through all the rule names
    for (let n = 0; n < args.length; n++) {
      // get a rule name
      const ruleName = args[n];

      // check if the rule is satisifed
      const ruleResult = this.evaluateRuleByRuleName(componentContent, conceptMapData, ruleName);

      if (ruleResult) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if all the rules are satisfied
   * @param componentContent the concept map component content
   * @param conceptMapData the concept map student data
   * @param args an array of rule names
   * @returns true if all the rules are satisifed
   * false if any of the rules are not satisfied
   */
  all(componentContent, conceptMapData, args) {
    let result = true;

    // loop through all the rule names
    for (let n = 0; n < args.length; n++) {
      // get a rule name
      const ruleName = args[n];

      // check if the rule is satisfied
      const ruleResult = this.evaluateRuleByRuleName(componentContent, conceptMapData, ruleName);

      result = result && ruleResult;
    }
    return result;
  }

  /**
   * Populate the concept map data into the component
   * @param draw the SVG draw div
   * @param conceptMapData the concept map data which contains an array
   * of nodes and an array of links
   */
  populateConceptMapData(draw, conceptMapData) {
    if (conceptMapData != null) {
      // get the JSON nodes
      const nodes = conceptMapData.nodes;

      // this is used to hold the SVG node objects
      const conceptMapNodes = [];

      if (nodes != null) {
        // loop through all the nodes
        for (let n = 0; n < nodes.length; n++) {
          const node = nodes[n];

          const instanceId = node.instanceId;
          const originalId = node.originalId;
          const filePath = node.fileName;
          const label = node.label;
          const x = node.x;
          const y = node.y;
          const width = node.width;
          const height = node.height;
          const showLabel = true;

          // create a ConceptMapNode
          const conceptMapNode = this.newConceptMapNode(
            draw,
            instanceId,
            originalId,
            filePath,
            label,
            x,
            y,
            width,
            height,
            showLabel
          );

          conceptMapNodes.push(conceptMapNode);
        }
      }

      // get the JSON links
      const links = conceptMapData.links;

      // this is used to hold the SVG link objects
      const conceptMapLinks = [];

      if (links != null) {
        // loop through all the links
        for (let l = 0; l < links.length; l++) {
          const link = links[l];

          const instanceId = link.instanceId;
          const originalId = link.originalId;
          const sourceNodeId = link.sourceNodeInstanceId;
          const destinationNodeId = link.destinationNodeInstanceId;
          const label = link.label;
          const color = link.color;
          const curvature = link.curvature;
          const startCurveUp = link.startCurveUp;
          const endCurveUp = link.endCurveUp;
          let sourceNode = null;
          let destinationNode = null;

          if (sourceNodeId != null) {
            sourceNode = this.getNodeById(conceptMapNodes, sourceNodeId);
          }

          if (destinationNodeId != null) {
            destinationNode = this.getNodeById(conceptMapNodes, destinationNodeId);
          }

          // create a ConceptMapLink
          const conceptMapLink = this.newConceptMapLink(
            draw,
            instanceId,
            originalId,
            sourceNode,
            destinationNode,
            label,
            color,
            curvature,
            startCurveUp,
            endCurveUp
          );

          conceptMapLinks.push(conceptMapLink);
        }
      }

      /*
       * move the link text group to the front so that they are on top
       * of links
       */
      this.moveLinkTextToFront(conceptMapLinks);

      // move the nodes to the front so that they are on top of links
      this.moveNodesToFront(conceptMapNodes);

      /*
       * set a timeout to refresh the link labels so that the rectangles
       * around the labels are properly resized
       */
      // this.$timeout(() => {
      //   this.refreshLinkLabels(conceptMapNodes, conceptMapLinks);
      // });
      this.refreshLinkLabels(conceptMapNodes, conceptMapLinks);
    }
  }

  /**
   * Move the link text group to the front
   */
  moveLinkTextToFront(links) {
    // loop through all the links
    for (let l = 0; l < links.length; l++) {
      const link = links[l];

      if (link != null) {
        // move the link text group to the front
        link.moveTextGroupToFront();
      }
    }
  }

  /**
   * Move the nodes to the front so that they show up above links
   */
  moveNodesToFront(nodes) {
    // loop through all the nodes
    for (let n = 0; n < nodes.length; n++) {
      const node = nodes[n];

      if (node != null) {
        // get a node group
        const group = node.getGroup();

        if (group != null) {
          // move the node group to the front
          group.front();
        }
      }
    }
  }

  /**
   * Refresh the link labels so that the rectangles around the text
   * labels are resized to fit the text properly. This is required because
   * the rectangles are not properly sized when the ConceptMapLinks are
   * initialized. The rectangles need to be rendered first and then the
   * labels need to be set in order for the rectangles to be resized properly.
   * This is why this function is called in a $timeout.
   */
  refreshLinkLabels(nodes, links) {
    if (nodes != null) {
      // loop through all the nodes
      for (let n = 0; n < nodes.length; n++) {
        const node = nodes[n];

        if (node != null) {
          // get the label from the node
          const label = node.getLabel();

          /*
           * set the label back into the node so that the rectangle
           * around the text label is resized to the text
           */
          node.setLabel(label);
        }
      }
    }

    if (links != null) {
      // loop throgh all the links
      for (let l = 0; l < links.length; l++) {
        const link = links[l];

        if (link != null) {
          // get the label from the link
          const label = link.getLabel();

          /*
           * set the label back into the link so that the rectangle
           * around the text label is resized to the text
           */
          link.setLabel(label);
        }
      }
    }
  }

  /**
   * Get a node by id.
   * @param id the node id
   * @returns the node with the given id or null
   */
  getNodeById(nodes, id) {
    let node = null;

    if (id != null) {
      // loop through all the nodes
      for (let n = 0; n < nodes.length; n++) {
        const tempNode = nodes[n];
        const tempNodeId = tempNode.getId();

        if (id == tempNodeId) {
          // we have found the node we want
          node = tempNode;
          break;
        }
      }
    }

    return node;
  }

  /**
   * Create an image from the concept map data
   * @param conceptMapData concept map data from a student
   * @param width the width of the image we want to create
   * @param height the height of the image we want to create
   */
  createImage(conceptMapData, width, height) {
    // create a promise that will return an image of the concept map
    const deferred = this.$q.defer();

    // create a div to draw the SVG in
    const svgElement = document.createElement('div');

    if (width == null || width == '') {
      // we will default to a width of 800 pixels
      width = 800;
    }

    if (height == null || height == '') {
      // we will default to a height of 600 pixels
      height = 600;
    }

    const draw = SVG(svgElement);
    draw.width(width);
    draw.height(height);

    if (svgElement != null) {
      // populate the concept map data into the svg draw element
      this.populateConceptMapData(draw, conceptMapData);

      // get the svg element as a string
      let svgString = svgElement.innerHTML;

      // find all the images in the svg and replace them with Base64 images
      this.getHrefToBase64ImageReplacements(svgString, true).then(images => {
        /*
         * Loop through all the image objects. Each object contains
         * an image href and a Base64 image.
         */
        for (let i = 0; i < images.length; i++) {
          // get an image object
          const imagePair = images[i];

          // get the image href e.g. /wise/curriculum/25/assets/Sun.png
          let imageHref = imagePair.imageHref;

          // get the last index of '/'
          const lastIndexOfSlash = imageHref.lastIndexOf('/');

          if (lastIndexOfSlash != -1) {
            // only get everything after the last '/'
            imageHref = imageHref.substring(lastIndexOfSlash + 1);
          }

          // get the Base64 image
          const base64Image = imagePair.base64Image;

          // create a regex to match the image href
          const imageRegEx = new RegExp(imageHref, 'g');

          /*
           * replace all the instances of the image href with the
           * Base64 image
           */
          svgString = svgString.replace(imageRegEx, base64Image);
        }

        // create a canvas to draw the image on
        const myCanvas = document.createElement('canvas');
        const ctx = myCanvas.getContext('2d');

        // create an svg blob
        const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const domURL: any = self.URL || (self as any).webkitURL || self;
        const url = domURL.createObjectURL(svg);
        const image = new Image();

        /*
         * set the UtilService in a local variable so we can access it
         * in the onload callback function
         */
        const thisUtilService = this.UtilService;

        // the function that is called after the image is fully loaded
        image.onload = event => {
          // get the image that was loaded
          const image: any = event.target;

          // set the dimensions of the canvas
          myCanvas.width = image.width;
          myCanvas.height = image.height;
          ctx.drawImage(image, 0, 0);

          // get the canvas as a Base64 string
          const base64Image = myCanvas.toDataURL('image/png');

          // get the image object
          const imageObject = thisUtilService.getImageObjectFromBase64String(base64Image);

          // create a student asset image
          this.StudentAssetService.uploadAsset(imageObject).then(unreferencedAsset => {
            /*
             * make a copy of the unreferenced asset so that we
             * get a referenced asset
             */
            this.StudentAssetService.copyAssetForReference(unreferencedAsset).then(
              referencedAsset => {
                if (referencedAsset != null) {
                  /*
                   * get the asset url
                   * for example
                   * /wise/studentuploads/11261/297478/referenced/picture_1494016652542.png
                   */
                  const referencedAssetUrl = referencedAsset.url;

                  // remove the unreferenced asset
                  this.StudentAssetService.deleteAsset(unreferencedAsset);

                  // resolve the promise with the image url
                  deferred.resolve(referencedAssetUrl);
                }
              }
            );
          });
        };

        // set the src of the image so that the image gets loaded
        image.src = url;
      });
    }

    return deferred.promise;
  }

  /**
   * Get Base64 images from image hrefs
   * @param svgString the svg string
   * @param prependAssetsPath whether to prepend the assets directory path
   * to the image references
   * @return a promise that will return an array of objects. The objects will
   * contain an image href and a Base64 image.
   */
  getHrefToBase64ImageReplacements(svgString, prependAssetsPath = false) {
    // an array to hold all the promises
    const promises = [];

    // get all the image hrefs
    const imageHrefs = this.getImagesInSVG(svgString);

    // loop through all the images
    for (let i = 0; i < imageHrefs.length; i++) {
      // get an image href
      let imageHref = imageHrefs[i];

      if (prependAssetsPath) {
        /*
         * the image href is relative so we need to make it absolute
         * so that the browser can retrieve it
         */

        // prepend the project asset directory path
        imageHref = this.ConfigService.getProjectAssetsDirectoryPath(true) + '/' + imageHref;
      }

      // get the Base64 of the image
      const promise = this.getBase64Image(imageHref);

      promises.push(promise);
    }

    return this.$q.all(promises);
  }

  /**
   * Get all the image hrefs in the svg string
   * @param svgString the svg string
   * @return an array of image hrefs
   */
  getImagesInSVG(svgString) {
    // used to hold all the images we find
    const images = [];

    if (svgString != null) {
      /*
       * the regex to match href values in image elements
       * e.g.
       * if the svg contained in image element like this
       * <image id="SvgjsImage1007" xlink:href="/wise/curriculum/25/assets/Sun.png" width="100" height="100"/>
       * it would match it and the matching group would contain
       * /wise/curriculum/25/assets/Sun.png
       */
      const regex = /<image.*?xlink:href="(.*?)".*?\/?>/g;

      // find the first match in the svg string
      let result = regex.exec(svgString);

      while (result != null) {
        /*
         * get the href image from the match
         * e.g.
         * /wise/curriculum/25/assets/Sun.png
         */
        const imageHref = result[1];

        // add the href to our array of hrefs
        images.push(imageHref);

        // try to find the next match
        result = regex.exec(svgString);
      }
    }

    return images;
  }

  /**
   * Get the Base64 image from an image href. An image href will look like
   * /wise/curriculum/25/assets/Sun.png
   * @param imageHref the image href
   * @return a promise that will return an object containing the image href
   * and the Base64 image
   */
  getBase64Image(imageHref) {
    const deferred = this.$q.defer();

    // create the image object that we will load the image into
    const image = new Image();

    // create a new canvas to render the image in
    const myCanvas = document.createElement('canvas');
    const ctx = myCanvas.getContext('2d');

    // the function that is called after the image is fully loaded
    image.onload = function(event) {
      // get the image that was loaded
      const image: any = event.target;

      // set the canvas dimensions to match the image
      myCanvas.width = image.width;
      myCanvas.height = image.height;

      // draw the image in the canvas
      ctx.drawImage(image, 0, 0);

      // get the Base64 string of the canvas
      const base64Image = myCanvas.toDataURL('image/png');

      // create an object that will contain the image href and Base64 image
      const result: any = {};
      result.imageHref = imageHref;
      result.base64Image = base64Image;

      // resolve the promise with the object
      deferred.resolve(result);
    };

    // load the image
    image.src = imageHref;

    // return the promise
    return deferred.promise;
  }

  /**
   * Check if the component state has student work. Sometimes a component
   * state may be created if the student visits a component but doesn't
   * actually perform any work. This is where we will check if the student
   * actually performed any work.
   * @param componentState the component state object
   * @param componentContent the component content
   * @return whether the component state has any work
   */
  componentStateHasStudentWork(componentState, componentContent) {
    if (componentState != null) {
      const studentData = componentState.studentData;

      if (studentData != null) {
        let nodes = [];
        let links = [];
        const conceptMapData = studentData.conceptMapData;

        if (conceptMapData != null) {
          if (conceptMapData.nodes != null) {
            nodes = conceptMapData.nodes;
          }

          if (conceptMapData.links != null) {
            links = conceptMapData.links;
          }
        }

        if (componentContent == null) {
          // the component content was not provided

          if (nodes.length > 0) {
            // the student has created a node
            return true;
          }

          if (links.length > 0) {
            // the student has created a link
            return true;
          }
        } else {
          // the component content was provided

          let starterConceptMap = componentContent.starterConceptMap;

          if (starterConceptMap == null || starterConceptMap === '') {
            // there is no starter concept map

            if (nodes.length > 0) {
              // the student has created a node
              return true;
            }

            if (links.length > 0) {
              // the student has created a link
              return true;
            }
          } else {
            /*
             * there is a starter concept map so we will compare it
             * with the student concept map
             */
            if (
              this.isStudentConceptMapDifferentThanStarterConceptMap(
                conceptMapData,
                starterConceptMap
              )
            ) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Check if the student concept map is different than the starter conept map
   * @param studentConceptMap the student concept map
   * @param starterConceptMap the authored starter concept map
   * @return whether the student concept map is different than the starter
   * concept map
   */
  isStudentConceptMapDifferentThanStarterConceptMap(studentConceptMap, starterConceptMap) {
    if (studentConceptMap != null && starterConceptMap != null) {
      let studentNodes = studentConceptMap.nodes;
      let studentLinks = studentConceptMap.links;

      const starterNodes = starterConceptMap.nodes;
      const starterLinks = starterConceptMap.links;

      if (studentNodes.length == starterNodes.length) {
        /*
         * the student has the same number of nodes as the starter so
         * we will need to check if the nodes area actually different
         */

        // loop through all the nodes
        for (let n = 0; n < studentNodes.length; n++) {
          let studentNode = studentNodes[n];
          let starterNode = starterNodes[n];

          if (studentNode != null && starterNode != null) {
            // check if any of the fields have different values
            if (
              studentNode.originalId != starterNode.originalId ||
              studentNode.instanceId != starterNode.instanceId ||
              studentNode.x != starterNode.x ||
              studentNode.y != starterNode.y
            ) {
              // the student node is different than the starter node
              return true;
            }
          }
        }
      } else {
        // the student has a different number of nodes
        return true;
      }

      if (studentLinks.length == starterLinks.length) {
        /*
         * the student has the same number of links as the starter so
         * we will need to check if the links area actually different
         */

        // loop through all the links
        for (let l = 0; l < studentLinks.length; l++) {
          const studentLink = studentLinks[l];
          const starterLink = starterLinks[l];

          if (studentLink != null && starterLink != null) {
            // check if any of the fields have different values
            if (
              studentLink.label != starterLink.label ||
              studentLink.originalId != starterLink.originalId ||
              studentLink.instanceId != starterLink.instanceId ||
              studentLink.sourceNodeOriginalId != starterLink.sourceNodeOriginalId ||
              studentLink.sourceNodeInstanceId != starterLink.sourceNodeInstanceId ||
              studentLink.destinationNodeOriginalId != starterLink.destinationNodeOriginalId ||
              studentLink.destinationNodeInstanceId != starterLink.destinationNodeInstanceId
            ) {
              // the student link is different than the starter link
              return true;
            }
          }
        }
      } else {
        // the student has a different number of links
        return true;
      }
    }

    return false;
  }

  /**
   * The component state has been rendered in a <component></component> element
   * and now we want to take a snapshot of the work.
   * @param componentState The component state that has been rendered.
   * @return A promise that will return an image object.
   */
  generateImageFromRenderedComponentState(componentState) {
    const deferred = this.$q.defer();

    // get the svg element. this will obtain an array.
    let svgElement = angular.element(
      document.querySelector('#svg_' + componentState.nodeId + '_' + componentState.componentId)
    );

    if (svgElement != null && svgElement.length > 0) {
      // get the svg element
      svgElement = svgElement[0];

      // get the svg element as a string
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);

      // find all the images in the svg and replace them with Base64 images
      this.getHrefToBase64ImageReplacements(svgString).then(images => {
        /*
         * Loop through all the image objects. Each object contains
         * an image href and a Base64 image.
         */
        for (let i = 0; i < images.length; i++) {
          // get an image object
          const imagePair = images[i];

          // get the image href e.g. /wise/curriculum/25/assets/Sun.png
          const imageHref = imagePair.imageHref;

          // get the Base64 image
          const base64Image = imagePair.base64Image;

          // create a regex to match the image href
          const imageRegEx = new RegExp(imageHref, 'g');

          /*
           * replace all the instances of the image href with the
           * Base64 image
           */
          svgString = svgString.replace(imageRegEx, base64Image);
        }

        // create a canvas to draw the image on
        const myCanvas = document.createElement('canvas');
        const ctx = myCanvas.getContext('2d');

        // create an svg blob
        const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const domURL: any = self.URL || (self as any).webkitURL || self;
        const url = domURL.createObjectURL(svg);
        const image = new Image();

        // the function that is called after the image is fully loaded
        image.onload = event => {
          // get the image that was loaded
          let image: any = event.target;

          // set the dimensions of the canvas
          myCanvas.width = image.width;
          myCanvas.height = image.height;
          ctx.drawImage(image, 0, 0);

          // get the canvas as a Base64 string
          const base64Image = myCanvas.toDataURL('image/png');

          // get the image object
          const imageObject = this.UtilService.getImageObjectFromBase64String(base64Image);

          // add the image to the student assets
          this.StudentAssetService.uploadAsset(imageObject).then(asset => {
            deferred.resolve(asset);
          });
        };

        // set the src of the image so that the image gets loaded
        image.src = url;
      });
    }
    return deferred.promise;
  }

  /**
   * @param objects An array of nodes or links.
   * @param prefix The prefix for the given type of objects
   * For example the prefix for 'studentNode3' would be
   * 'studentNode'
   */
  getNextAvailableId(objects, prefix) {
    let nextAvailableNumber = 1;
    const usedNumbers = [];
    for (let object of objects) {
      const objectId = object.id;
      const objectIdNumber = parseInt(objectId.replace(prefix, ''));
      usedNumbers.push(objectIdNumber);
    }

    if (usedNumbers.length > 0) {
      const maxNumberUsed = Math.max.apply(Math, usedNumbers);
      if (!isNaN(maxNumberUsed)) {
        nextAvailableNumber = maxNumberUsed + 1;
      }
    }

    return prefix + nextAvailableNumber;
  }

  displayAnnotation(componentContent, annotation) {
    if (annotation.displayToStudent === false) {
      return false;
    } else {
      if (annotation.type == 'score') {
      } else if (annotation.type == 'comment') {
      } else if (annotation.type == 'autoScore') {
        return componentContent.showAutoScore;
      } else if (annotation.type == 'autoComment') {
        return componentContent.showAutoFeedback;
      }
    }
    return true;
  }
}

export default ConceptMapService;
