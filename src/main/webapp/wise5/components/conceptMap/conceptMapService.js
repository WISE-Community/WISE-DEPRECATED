import ComponentService from '../componentService';

class ConceptMapService extends ComponentService {
  constructor(
      $anchorScroll,
      $filter,
      $location,
      $q,
      $timeout,
      ConfigService,
      StudentAssetService,
      StudentDataService,
      UtilService) {
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
    const component = super.createComponent();
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
      let submitRequired = node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);

      if (submitRequired) {
        // completion requires a submission, so check for isSubmit in any component states
        for (let i = 0, l = componentStates.length; i < l; i++) {
          let state = componentStates[i];
          if (state.isSubmit && state.studentData) {
            // component state is a submission
            if (state.isSubmit == true || (state.studentData.submitCounter != null && state.studentData.submitCounter > 0)) {
              // there is a response so the component is completed
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
          if (studentData.conceptMapData != null) {
            // there is a response so the component is completed
            result = true;
          }
        }
      }
    }

    return result;
  };

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
    return new ConceptMapNode(this, draw, id, originalId, filePath, label, x, y, width, height, showLabel);
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
  newConceptMapLink(draw, id, originalId, sourceNode, destinationNode, label, color, curvature, startCurveUp, startCurveDown) {
    return new ConceptMapLink(this, draw, id, originalId, sourceNode, destinationNode, label, color, curvature, startCurveUp, startCurveDown);
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

    var slope = null;

    if ((x2 - x1) == 0) {
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

    // calculate the distance
    var distance = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));

    return distance;
  }

  /**

  Returns an array representation of the path elements for an arrow

  First we calculate a simple curve for the tail.

  Then we pick a point on that curve to use as the base-center of the arrow head,
  then calculate the position of that triangle based on the angle between that
  point and the tip.

  @params startx {Number} X-coordinate of the start point
  @params starty {Number} Y-coordinate of the start point
  @params endx {Number} X-coordinate of the end point
  @params endy {Number} Y-coordinate of the end point
  @params len {Number} Length of the "tip" of the arrowhead
  @params angle {Number} Angle in degrees
    between the line and each wing of the arrowhead.
    Should be less than 90.

  Note: This function and the associated functions that are called by this
  function are taken from the Concord MySystem github project.
  https://github.com/concord-consortium/mysystem_sc
  The code is found in the arrow_drawing.js file.
  mysystem_sc/apps/my_system/mixins/arrow_drawing.js

  **/
  arrowPathArrays(startx,starty,endx,endy,startCurveUp,endCurveUp,len,angle,curvature,nodeRadius) {

    if (startx === endx && starty === endy){
      return [[""],[""]];
    }

    var start = this.coord(startx, starty),
    tip = this.coord(endx, endy),
    pathData   = [],
    arrowHeadData = [];

    // calculate control points c2 and c3
    var curveDistance = (tip.x - start.x) * curvature,
    startYCurveDistance = (curveDistance === 0 ? 1 : Math.max(Math.min(curveDistance, 100), -100)),
    endYCurveDistance = startYCurveDistance,
    startUp = startCurveUp ? 1 : -1,
    endUp = endCurveUp ? 1 : -1;
    startYCurveDistance = (startYCurveDistance * startUp > 0) ? startYCurveDistance : startYCurveDistance * -1;
    endYCurveDistance = (endYCurveDistance * endUp > 0) ? endYCurveDistance : endYCurveDistance * -1;
    var c2 = this.coord(start.x+(curveDistance/2), start.y-startYCurveDistance),
    c3 = this.coord(tip.x-(curveDistance/2), tip.y-endYCurveDistance),
    cDistance = Math.sqrt(Math.pow((curveDistance/2),2) + Math.pow(startYCurveDistance,2)),
    perimX = nodeRadius*(curveDistance/2)/cDistance,
    perimYstart = nodeRadius*startYCurveDistance/cDistance,
    perimYend = nodeRadius*endYCurveDistance/cDistance;

    // update tip
    tip = this.coord(tip.x - perimX, tip.y - perimYend);

    // draw arrow path

    pathData.push("M", start.x + perimX, start.y - perimYstart);  // move to start of line
    pathData.push("C", c2.x, c2.y, c3.x, c3.y, tip.x, tip.y); // curve line to the tip

    // draw arrow head
    var percLengthOfHead = len / this.getLengthOfCubicBezier(start, c2, c3, tip),
    centerBaseOfHead = this.getPointOnCubicBezier(percLengthOfHead, start, c2, c3, tip),
    theta  = Math.atan2((tip.y-centerBaseOfHead.y),(tip.x-centerBaseOfHead.x)),
    baseAngleA = theta + angle * Math.PI/180,
    baseAngleB = theta - angle * Math.PI/180,
    baseA    = this.coord(tip.x - len * Math.cos(baseAngleA), tip.y - len * Math.sin(baseAngleA)),
    baseB    = this.coord(tip.x - len * Math.cos(baseAngleB), tip.y - len * Math.sin(baseAngleB));

    arrowHeadData.push("M", tip.x, tip.y);
    arrowHeadData.push("L", baseA.x, baseA.y);  // line to baseA
    arrowHeadData.push("L", baseB.x, baseB.y);  // line to baseB
    arrowHeadData.push("L", tip.x,   tip.y  );  // line back to the tip

    return [pathData, arrowHeadData];
  }

  /**
   * Note: This function is from
   * https://github.com/concord-consortium/mysystem_sc
   * The code is found in the arrow_drawing.js file.
   * mysystem_sc/apps/my_system/mixins/arrow_drawing.js
   */
  coord(x,y) {
    if(!x) x = 0;
    if(!y) y = 0;
    /*
    *   Limit precision of decimals for SVG rendering.
    *   otherwise we get really long SVG strings,
    *   and webkit error messsages like of this sort:
    *   "Error: Problem parsing d='<svg string with long dec>'"
    */
    x = Math.round(x * 1000)/1000;
    y = Math.round(y * 1000)/1000;
    return {x: x, y: y};
  }

  /**
   * Note: This function is from
   * https://github.com/concord-consortium/mysystem_sc
   * The code is found in the arrow_drawing.js file.
   * mysystem_sc/apps/my_system/mixins/arrow_drawing.js
   */
  getLengthOfCubicBezier(C1,C2,C3,C4)
  {
    var precision = 10,
    length  = 0,
    t,
    currentPoint,
    previousPoint;

    for (var i = 0; i<precision; i++){
      t = i/precision;
      currentPoint = this.getPointOnCubicBezier(t, C1,C2,C3,C4);
      if (i > 0){
        var xDif = currentPoint.x - previousPoint.x,
        yDif = currentPoint.y - previousPoint.y;
        length += Math.sqrt((xDif*xDif) + (yDif*yDif));
      }
      previousPoint = currentPoint;
    }
    return length;
  }

  /**
   * Note: This function is from
   * https://github.com/concord-consortium/mysystem_sc
   * The code is found in the arrow_drawing.js file.
   * mysystem_sc/apps/my_system/mixins/arrow_drawing.js
   */
  getPointOnCubicBezier(percent,C1,C2,C3,C4) {
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;
    var pos = this.coord();
    pos.x = C1.x*this.B1(percent) + C2.x*this.B2(percent) + C3.x*this.B3(percent) + C4.x*this.B4(percent);
    pos.y = C1.y*this.B1(percent) + C2.y*this.B2(percent) + C3.y*this.B3(percent) + C4.y*this.B4(percent);
    return pos;
  }

  /**
   * Note: These functions are from
   * https://github.com/concord-consortium/mysystem_sc
   * The code is found in the arrow_drawing.js file.
   * mysystem_sc/apps/my_system/mixins/arrow_drawing.js
   */
  B1(t) { return t*t*t; }
  B2(t) { return 3*t*t*(1-t); }
  B3(t) { return 3*t*(1-t)*(1-t); }
  B4(t) { return (1-t)*(1-t)*(1-t); }

  /**
   * Evaluate a rule name
   * @param componentContent the component content
   * @param conceptMapData the student concept map data
   * @param ruleName the rule name
   * @returns whether the rule was satisfied
   */
  evaluateRuleByRuleName(componentContent, conceptMapData, ruleName) {

    var result = false;

    if (ruleName === true) {
      // the rule name is not actually a rule but is the true boolean
      return true;
    } else if (ruleName === false) {
      // the rule name is not actually a rule but is the false boolean
      return false;
    }

    // get the rule
    var rule = this.getRuleByRuleName(componentContent, ruleName);

    if (rule == null) {
      /*
       * we didn't find a rule with the given rule name so we will look
       * for a category with that name
       */

      // get the rules that are in the category
      var rules = this.getRulesByCategoryName(componentContent, ruleName);

      var firstRule = true;

      if (rules != null) {

        /*
         * loop through all the rules in the category. we will say the
         * category is satisfied if all the rules in the category
         * evaluate to true.
         */
        for (var r = 0; r < rules.length; r++) {
          var tempRule = rules[r];

          // evaluate the rule
          var tempResult = this.evaluateRule(conceptMapData, tempRule);

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

    var result = false;

    if (rule != null) {

      if (rule.type == 'node') {
        // this is a node rule

        // get the node we are looking for
        var nodeLabel = rule.nodeLabel;

        // get all the nodes with the given label
        var nodes = this.getNodesByLabel(conceptMapData, nodeLabel);

        // get the number of nodes with the given label
        var nodeCount = nodes.length;

        /*
         * the comparison for the number which can be "exactly",
         * "more than", or "less than"
         */
        var comparison = rule.comparison;

        // the number to compare to
        var number = rule.number;

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
        var nodeLabel = rule.nodeLabel;

        // get the link label
        var linkLabel = rule.linkLabel;

        // get the destination node label
        var otherNodeLabel = rule.otherNodeLabel;

        // get all the links with the matching labels
        var links = this.getLinksByLabels(conceptMapData, nodeLabel, linkLabel, otherNodeLabel);

        // get the number of links with the matching labels
        var linkCount = links.length;

        /*
         * the comparison for the number which can be "exactly",
         * "more than", or "less than"
         */
        var comparison = rule.comparison;

        // the number to compare to
        var number = rule.number;

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

    var rule = null;

    if (ruleName != null) {

      // get the rules
      var rules = componentContent.rules;

      if (rules != null) {

        // loop through all the rules
        for (var r = 0; r < rules.length; r++) {

          // get a rule
          var tempRule = rules[r];

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

    var rules = [];

    if (componentContent != null) {

      // get all the rules
      var tempRules = componentContent.rules;

      if (tempRules != null) {

        // loop through all the rules
        for (var r = 0; r < tempRules.length; r++) {
          var rule = tempRules[r];

          if (rule != null) {

            // get the categories the rule is in
            var categories = rule.categories;

            if (categories != null) {

              // loop through categories the rule is in
              for (var c = 0; c < categories.length; c++) {
                var tempCategory = categories[c];

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

    var nodesByLabel = [];

    if (conceptMapData != null) {

      var nodes = conceptMapData.nodes;

      if (nodes != null) {

        // loop through all the nodes
        for (var n = 0; n < nodes.length; n++) {
          var node = nodes[n];

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

    var resultLinks = [];

    if (conceptMapData != null) {

      var links = conceptMapData.links;

      if (links != null) {

        // loop through all the links
        for (var l = 0; l < links.length; l++) {
          var tempLink = links[l];

          if (tempLink != null) {

            // get the labels
            var tempLinkLabel = tempLink.label;
            var sourceNodeLabel = tempLink.sourceNodeLabel;
            var destinationNodeLabel = tempLink.destinationNodeLabel;

            if ((nodeLabel == sourceNodeLabel || nodeLabel == 'any') &&
              (linkLabel == tempLinkLabel || linkLabel == 'any') &&
              (otherNodeLabel == destinationNodeLabel || otherNodeLabel == 'any')) {

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
    for (var n = 0; n < args.length; n++) {

      // get a rule name
      var ruleName = args[n];

      // check if the rule is satisifed
      var ruleResult = this.evaluateRuleByRuleName(componentContent, conceptMapData, ruleName);

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
    var result = true;

    // loop through all the rule names
    for (var n = 0; n < args.length; n++) {

      // get a rule name
      var ruleName = args[n];

      // check if the rule is satisfied
      var ruleResult = this.evaluateRuleByRuleName(componentContent, conceptMapData, ruleName);

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
      var nodes = conceptMapData.nodes;

      // this is used to hold the SVG node objects
      var conceptMapNodes = [];

      if (nodes != null) {

        // loop through all the nodes
        for (var n = 0; n < nodes.length; n++) {
          var node = nodes[n];

          var instanceId = node.instanceId;
          var originalId = node.originalId;
          var filePath = node.fileName;
          var label = node.label;
          var x = node.x;
          var y = node.y;
          var width = node.width;
          var height = node.height;
          var showLabel = true;

          // create a ConceptMapNode
          var conceptMapNode = this.newConceptMapNode(
              draw, instanceId, originalId, filePath, label, x, y, width, height, showLabel);

          conceptMapNodes.push(conceptMapNode);
        }
      }

      // get the JSON links
      var links = conceptMapData.links;

      // this is used to hold the SVG link objects
      var conceptMapLinks = [];

      if (links != null) {

        // loop through all the links
        for (var l = 0; l < links.length; l++) {
          var link = links[l];

          var instanceId = link.instanceId;
          var originalId = link.originalId;
          var sourceNodeId = link.sourceNodeInstanceId;
          var destinationNodeId = link.destinationNodeInstanceId;
          var label = link.label;
          var color = link.color;
          var curvature = link.curvature;
          var startCurveUp = link.startCurveUp;
          var endCurveUp = link.endCurveUp;
          var sourceNode = null;
          var destinationNode = null;

          if (sourceNodeId != null) {
            sourceNode = this.getNodeById(conceptMapNodes, sourceNodeId);
          }

          if (destinationNodeId != null) {
            destinationNode = this.getNodeById(conceptMapNodes, destinationNodeId);
          }

          // create a ConceptMapLink
          var conceptMapLink = this.newConceptMapLink(draw, instanceId, originalId, sourceNode, destinationNode, label, color, curvature, startCurveUp, endCurveUp);

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
    for (var l = 0; l < links.length; l++) {
      var link = links[l];

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
    for (var n = 0; n < nodes.length; n++) {
      var node = nodes[n];

      if (node != null) {

        // get a node group
        var group = node.getGroup();

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
      for (var n = 0; n < nodes.length; n++) {
        var node = nodes[n];

        if (node != null) {
          // get the label from the node
          var label = node.getLabel();

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
      for (var l = 0; l < links.length; l++) {
        var link = links[l];

        if (link != null) {
          // get the label from the link
          var label = link.getLabel();

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
    var node = null;

    if (id != null) {

      // loop through all the nodes
      for (var n = 0; n < nodes.length; n++) {
        var tempNode = nodes[n];
        var tempNodeId = tempNode.getId();

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
    var deferred = this.$q.defer();

    // create a div to draw the SVG in
    var svgElement = document.createElement('div');

    if (width == null || width == '') {
      // we will default to a width of 800 pixels
      width = 800;
    }

    if (height == null || height == '') {
      // we will default to a height of 600 pixels
      height = 600;
    }

    var draw = SVG(svgElement);
    draw.width(width);
    draw.height(height);

    if (svgElement != null) {

      // populate the concept map data into the svg draw element
      this.populateConceptMapData(draw, conceptMapData);

      // get the svg element as a string
      var svgString = svgElement.innerHTML;

      // find all the images in the svg and replace them with Base64 images
      this.getHrefToBase64ImageReplacements(svgString, true).then((images) => {

        /*
         * Loop through all the image objects. Each object contains
         * an image href and a Base64 image.
         */
        for (var i = 0; i < images.length; i++) {

          // get an image object
          var imagePair = images[i];

          // get the image href e.g. /wise/curriculum/25/assets/Sun.png
          var imageHref = imagePair.imageHref;

          // get the last index of '/'
          var lastIndexOfSlash = imageHref.lastIndexOf('/');

          if (lastIndexOfSlash != -1) {
            // only get everything after the last '/'
            imageHref = imageHref.substring(lastIndexOfSlash + 1);
          }

          // get the Base64 image
          var base64Image = imagePair.base64Image;

          // create a regex to match the image href
          var imageRegEx = new RegExp(imageHref, 'g');

          /*
           * replace all the instances of the image href with the
           * Base64 image
           */
          svgString = svgString.replace(imageRegEx, base64Image);
        }

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
  getHrefToBase64ImageReplacements(svgString, prependAssetsPath) {

    // an array to hold all the promises
    var promises = [];

    // get all the image hrefs
    var imageHrefs = this.getImagesInSVG(svgString);

    // loop through all the images
    for (var i = 0; i < imageHrefs.length; i++) {

      // get an image href
      var imageHref = imageHrefs[i];

      if (prependAssetsPath) {
        /*
         * the image href is relative so we need to make it absolute
         * so that the browser can retrieve it
         */

        // prepend the project asset directory path
        imageHref = this.ConfigService.getProjectAssetsDirectoryPath(true) + '/' + imageHref;
      }

      // get the Base64 of the image
      var promise = this.getBase64Image(imageHref);

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
    var images = [];

    if (svgString != null) {

      /*
       * the regex to match href values in image elements
       * e.g.
       * if the svg contained in image element like this
       * <image id="SvgjsImage1007" xlink:href="/wise/curriculum/25/assets/Sun.png" width="100" height="100"/>
       * it would match it and the matching group would contain
       * /wise/curriculum/25/assets/Sun.png
       */
      var regex = /<image.*?xlink:href="(.*?)".*?\/?>/g;

      // find the first match in the svg string
      var result = regex.exec(svgString);

      while(result != null) {

        /*
         * get the href image from the match
         * e.g.
         * /wise/curriculum/25/assets/Sun.png
         */
        var imageHref = result[1];

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

    var deferred = this.$q.defer();

    // create the image object that we will load the image into
    var image = new Image;

    // create a new canvas to render the image in
    var myCanvas = document.createElement('canvas');
    var ctx = myCanvas.getContext('2d');

    // the function that is called after the image is fully loaded
    image.onload = function(event) {

      // get the image that was loaded
      var image = event.target;

      // set the canvas dimensions to match the image
      myCanvas.width = image.width;
      myCanvas.height = image.height;

      // draw the image in the canvas
      ctx.drawImage(image, 0, 0);

      // get the Base64 string of the canvas
      var base64Image = myCanvas.toDataURL('image/png');

      // create an object that will contain the image href and Base64 image
      var result = {};
      result.imageHref = imageHref;
      result.base64Image = base64Image;

      // resolve the promise with the object
      deferred.resolve(result);
    }

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

      let studentData = componentState.studentData;

      if (studentData != null) {

        let nodes = [];
        let links = [];
        let conceptMapData = studentData.conceptMapData;

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
            if (this.isStudentConceptMapDifferentThanStarterConceptMap(conceptMapData, starterConceptMap)) {
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

      let starterNodes = starterConceptMap.nodes;
      let starterLinks = starterConceptMap.links;

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
            if (studentNode.originalId != starterNode.originalId ||
              studentNode.instanceId != starterNode.instanceId ||
              studentNode.x != starterNode.x ||
              studentNode.y != starterNode.y) {

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
          let studentLink = studentLinks[l];
          let starterLink = starterLinks[l];

          if (studentLink != null && starterLink != null) {

            // check if any of the fields have different values
            if (studentLink.label != starterLink.label ||
              studentLink.originalId != starterLink.originalId ||
              studentLink.instanceId != starterLink.instanceId ||
              studentLink.sourceNodeOriginalId != starterLink.sourceNodeOriginalId ||
              studentLink.sourceNodeInstanceId != starterLink.sourceNodeInstanceId ||
              studentLink.destinationNodeOriginalId != starterLink.destinationNodeOriginalId ||
              studentLink.destinationNodeInstanceId != starterLink.destinationNodeInstanceId) {

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
    let deferred = this.$q.defer();

    // get the svg element. this will obtain an array.
    let svgElement = angular.element(document.querySelector('#svg_' + componentState.nodeId + '_' + componentState.componentId));

    if (svgElement != null && svgElement.length > 0) {
      // get the svg element
      svgElement = svgElement[0];

      // get the svg element as a string
      let serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);

      // find all the images in the svg and replace them with Base64 images
      this.getHrefToBase64ImageReplacements(svgString).then((images) => {

        /*
         * Loop through all the image objects. Each object contains
         * an image href and a Base64 image.
         */
        for (let i = 0; i < images.length; i++) {

          // get an image object
          let imagePair = images[i];

          // get the image href e.g. /wise/curriculum/25/assets/Sun.png
          let imageHref = imagePair.imageHref;

          // get the Base64 image
          let base64Image = imagePair.base64Image;

          // create a regex to match the image href
          let imageRegEx = new RegExp(imageHref, 'g');

          /*
           * replace all the instances of the image href with the
           * Base64 image
           */
          svgString = svgString.replace(imageRegEx, base64Image);
        }

        // create a canvas to draw the image on
        let myCanvas = document.createElement('canvas');
        let ctx = myCanvas.getContext('2d');

        // create an svg blob
        let svg = new Blob([svgString], {type:'image/svg+xml;charset=utf-8'});
        let domURL = self.URL || self.webkitURL || self;
        let url = domURL.createObjectURL(svg);
        let image = new Image();

        // the function that is called after the image is fully loaded
        image.onload = (event) => {

          // get the image that was loaded
          let image = event.target;

          // set the dimensions of the canvas
          myCanvas.width = image.width;
          myCanvas.height = image.height;
          ctx.drawImage(image, 0, 0);

          // get the canvas as a Base64 string
          let base64Image = myCanvas.toDataURL('image/png');

          // get the image object
          let imageObject = this.UtilService.getImageObjectFromBase64String(base64Image, false);

          // add the image to the student assets
          this.StudentAssetService.uploadAsset(imageObject).then((asset) => {
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

  // end of ConceptMapService class
}


/**
 * A ConceptMapNode that represents a node in the ConceptMap component
 */
class ConceptMapNode {

  /**
   * The constructor for creating ConceptMapNodes
   * @param ConceptMapService the ConceptMapService
   * @param draw the svg.js draw object
   * @param filePath the path of the image file that represents the node
   * @param label the label of the node
   * @param x the x position of the node
   * @param y the y position of the node
   * @param width the the width of the node
   * @param height the height of the node
   * @param showLabel whether to show the label
   */
  constructor(ConceptMapService, draw, id, originalId, filePath, label, x, y, width, height, showLabel) {

    // remember the ConceptMapService
    this.ConceptMapService = ConceptMapService;

    this.type = 'ConceptMapNode';

    // remember the svg.js draw object so we can draw onto it
    this.draw = draw;

    // set the id
    this.id = id;

    // set the original id
    this.originalId = originalId;

    // remember the file path e.g. "/wise/curriculum/108/assets/Space.png"
    this.filePath = filePath;

    if (this.filePath != null) {
      // get the file name e.g. "Space.png"
      this.fileName = this.filePath.substring(this.filePath.lastIndexOf('/') + 1);
    }

    // remember the label
    this.label = label;
    this.showLabel = showLabel;

    // create the svg image object
    this.image = this.draw.image(this.filePath, width, height);

    // remember the width
    this.width = width;

    // remember the height
    this.height = height;

    // create a group to contain all the elements of this node
    this.group = this.draw.group();

    // flag that specifies whether this node is highlighted by the student
    this.highlighted = false;

    // the color of the delete button
    this.deleteButtonColor = 'gray';

    // create the connector that students will use to create links
    this.connector = this.createConnector();

    // create the delete button
    this.deleteButtonGroup = this.createDeleteButtonGroup();

    /*
     * create the border that displays when the node is highighted or
     * moused over
     */
    this.border = this.createBorder();

    // remember the x and y coordinates
    this.x = x;
    this.y = y;

    // initialize the outgoing and incoming links arrays
    this.outgoingLinks = [];
    this.incomingLinks = [];

    // add all the elements to the group
    this.group.add(this.border);
    this.group.add(this.image);
    this.group.add(this.connector);
    this.group.add(this.deleteButtonGroup);
    if (showLabel) {
      this.textGroup = this.createTextGroup();
      this.group.add(this.textGroup);
    }

    // hide the border and delete button
    this.border.hide();
    this.deleteButtonGroup.hide();

    // set the position of the group
    this.group.x(x);
    this.group.y(y);
  }

  /**
   * Get the JSON object representation of the ConceptMapNode
   * @returns a JSON object containing the data of the ConceptMapNode
   */
  toJSONObject() {
    var jsonObject = {};

    jsonObject.originalId = this.originalId;
    jsonObject.instanceId = this.id;
    jsonObject.fileName = this.fileName;
    jsonObject.filePath = this.filePath;
    jsonObject.label = this.label;
    jsonObject.x = this.x;
    jsonObject.y = this.y;
    jsonObject.width = this.width;
    jsonObject.height = this.height;

    jsonObject.outgoingLinks = [];
    jsonObject.incomingLinks = [];

    // loop through all the outgoing links
    for (var ol = 0; ol < this.outgoingLinks.length; ol++) {
      var outgoingLink = this.outgoingLinks[ol];

      var instanceId = outgoingLink.getId();
      var originalId = outgoingLink.getOriginalId();
      var label = outgoingLink.getLabel();

      /*
       * create an object containing the instance id, original id
       * and label of the link
       */
      var tempLinkObject = {};
      tempLinkObject.originalId = originalId;
      tempLinkObject.instanceId = instanceId;
      tempLinkObject.label = label;

      jsonObject.outgoingLinks.push(tempLinkObject);
    }

    // loop through all the incoming links
    for (var il = 0; il < this.incomingLinks.length; il++) {
      var incomingLink = this.incomingLinks[il];

      var instanceId = incomingLink.getId();
      var originalId = incomingLink.getOriginalId();
      var label = incomingLink.getLabel();

      /*
       * create an object containing the instance id, original id
       * and label of the link
       */
      var tempLinkObject = {};
      tempLinkObject.originalId = originalId;
      tempLinkObject.instanceId = instanceId;
      tempLinkObject.label = label;

      jsonObject.incomingLinks.push(tempLinkObject);
    }

    return jsonObject;
  }

  /**
   * Create the border that displays when the node is highlighted or
   * moused over.
   * @returns the svg rectangle that represents the border
   */
  createBorder() {

    // create the rectangle
    this.border = this.draw.rect(this.width, this.height);
    this.border.fill('none');
    this.border.stroke({ color: '#333333', opacity: 0.2, width: 2 });

    return this.border;
  }

  /**
   * Create the connector that students will use to create links from this
   * node.
   * @returns the svg circle that represents the connector
   */
  createConnector() {

    // create the circle
    var connectorRadius = 10;
    this.connector = this.draw.circle();
    this.connector.radius(connectorRadius);
    this.connector.cx(this.width / 2);
    this.connector.cy(0);
    this.connector.fill({ color: '#cccccc', opacity: 0.4 });
    this.connector.stroke({ color: '#333333', opacity: 0.2 });

    return this.connector;
  }

  /**
   * Create the delete button. The delete button is a group that contains
   * a circle and an x.
   * @returns a group that contains a circle and an x
   */
  createDeleteButtonGroup() {

    // create a group to contain the circle and x for the delete button
    this.deleteButtonGroup = this.draw.group();

    // create the delete button circle
    var deleteButtonRadius = 10;
    this.deleteButtonCircle = this.draw.circle();
    this.deleteButtonCircle.radius(deleteButtonRadius);
    this.deleteButtonCircle.cx(this.width);
    this.deleteButtonCircle.cy(0);
    this.deleteButtonCircle.fill({ opacity: 0.0 });
    this.deleteButtonCircle.stroke({ color: '#333333', opacity: 0.2, width: 2 });

    // create the x by first creating a + and then rotating it 45 degrees

    // get the top location of the +
    var topX = 0;
    var topY = 0 - (deleteButtonRadius * 0.7);

    // get the bottom location of the +
    var bottomX = 0;
    var bottomY = 0 + (deleteButtonRadius * 0.7);

    // get the left position of the +
    var leftX = 0 - (deleteButtonRadius * 0.7);
    var leftY = 0;

    // get the right position of the +
    var rightX = 0 + (deleteButtonRadius * 0.7);
    var rightY = 0;

    // draw the +
    var deleteButtonXPath = 'M' + topX + ',' + topY + 'L' + bottomX + ',' + bottomY + 'M' + leftX + ',' + leftY + 'L' + rightX + ',' + rightY;
    this.deleteButtonX = this.draw.path(deleteButtonXPath);
    this.deleteButtonX.stroke({ color: '#333333', opacity: 0.2, width: 2 });

    // rotate the + to turn it into an x
    this.deleteButtonX.transform({ rotation: 45 });

    // move the x to the upper right of the group
    this.deleteButtonX.translate(this.width, 0);

    /*
     * disable pointer events on the x so that clicks will pass through
     * and hit the circle. this way we only need to set a listener on the
     * circle for click events.
     */
    this.deleteButtonX.attr('pointer-events', 'none');

    // add the circle and the x
    this.deleteButtonGroup.add(this.deleteButtonCircle);
    this.deleteButtonGroup.add(this.deleteButtonX);

    return this.deleteButtonGroup;
  }

  /**
   * Create the text group
   * @returns the text group
   */
  createTextGroup() {

    // create the group
    this.textGroup = this.draw.group();

    // create a rectangle to surround the text
    this.textRect = this.draw.rect(100, 15);
    this.textRect.attr('fill', 'white');
    this.textRect.attr('stroke', 'black');
    this.textRect.attr('x', 0);
    this.textRect.attr('y', 10);
    this.textRect.attr('width', 100);
    this.textRect.attr('height', 20);
    this.textRect.radius(5);

    // create the text element
    this.text = this.draw.text(this.label);
    this.text.attr('x', 5);
    //this.text.attr('x', 0);
    this.text.attr('y', 9);
    this.text.font({
      family: 'Arial',
      size: 12
    });

    // prevent the text from being highlighted when the user drags the mouse
    this.text.style('user-select:none');
    this.text.node.setAttribute('user-select', 'none');
    this.text.node.setAttribute('style', 'user-select:none');

    // add the rectangle and text to the group
    this.textGroup.add(this.textRect);
    this.textGroup.add(this.text);

    // add the text group to the link group
    this.group.add(this.textGroup);

    var width = 0;

    try {
      // get the width of the bounding box of the text node
      var textBBox = this.text.node.getBBox();

      if (textBBox.width == 0) {
        width = this.calculateTextRectWidth(this.label);
      } else {
        width = textBBox.width + 10;
      }
    } catch(e) {
      /*
       * we were unable to get the bounding box (likely because
       * Firefox threw an error when trying to call getBBox())
       * so we will calculate the width based on the label text
       */
      width = this.calculateTextRectWidth(this.label);
    }

    this.textRect.attr('width', width);

    // set the position of the text group
    var x = this.getImageWidth() / 2;
    var y = this.getImageHeight();
    this.textGroup.cx(x);
    this.textGroup.cy(y);

    return this.textGroup;
  }

  /**
   * Get the id of the node
   * @returns the id of the node
   */
  getId() {
    return this.id;
  }

  /**
   * Get the original id of the node
   * @returns the original id of the node
   */
  getOriginalId() {
    return this.originalId;
  }

  /**
   * Get the group id of the node
   * @returns the group id of the node
   */
  getGroupId() {
    var groupId = null;

    if (this.group != null) {
      // get the id of the group which we will use as the id of the node
      groupId = this.group.id();
    }

    return groupId;
  }

  /**
   * Get the label
   * @returns the label of the node
   */
  getLabel() {
    return this.label;
  }

  /**
   * Set the label of the node
   * @param label the label of the node
   */
  setLabel(label) {

    // remember the label
    this.label = label;

    // set the label into the text element
    this.text.text(label);

    var width = 0;

    try {
      // get the width of the bounding box of the text node
      var textBBox = this.text.node.getBBox();

      if (textBBox.width == 0) {
        width = this.calculateTextRectWidth(this.label);
      } else {
        width = textBBox.width + 10;
      }
    } catch(e) {
      /*
       * we were unable to get the bounding box (likely because
       * Firefox threw an error when trying to call getBBox())
       * so we will calculate the width based on the label text
       */
      width = this.calculateTextRectWidth(this.label);
    }

    this.textRect.attr('width', width);

    // set the position of the text group
    var x = this.getImageWidth() / 2;
    var y = this.getImageHeight();
    this.textGroup.cx(x);
    this.textGroup.cy(y);
  }

  /**
   * Get the center x coordinate of the group
   */
  cx() {
    var val = 0;

    if (this.group != null && this.image != null) {

      // get the group
      var groupX = this.group.x();

      /*
       * get the center x coordinate of the image relative to the group.
       * this will be equal to half the width of the image.
       */
      var imageCX = this.image.cx();

      /*
       * get the x coordinate of the center of the group relative to the
       * svg parent
       */
      val = groupX + imageCX;
    }

    return val;
  }

  /**
   * Get the center y coordinate of the group
   */
  cy() {
    var val = 0;

    if (this.group != null && this.image != null) {

      // get the group
      var groupY = this.group.y();

      /*
       * get the center y coordinate of the image relative to the group.
       * this will be equal to half the height of the image.
       */
      var imageCY = this.image.cy();

      /*
       * get the y coordinate of the center of the group relative to the
       * svg parent
       */
      val = groupY + imageCY;
    }

    return val;
  }

  /**
   * Get the center x coordinate of the group
   */
  connectorCX() {
    var val = 0;

    if (this.group != null && this.image != null) {

      // get the group
      var groupX = this.group.x();

      /*
       * get the center x coordinate of the image relative to the group.
       * this will be equal to half the width of the image.
       */
      var imageCX = this.connector.cx();

      /*
       * get the x coordinate of the center of the group relative to the
       * svg parent
       */
      val = groupX + imageCX;
    }

    return val;
  }

  /**
   * Get the center y coordinate of the group
   */
  connectorCY() {
    var val = 0;

    if (this.group != null && this.image != null) {

      // get the group
      var groupY = this.group.y();

      /*
       * get the center y coordinate of the image relative to the group.
       * this will be equal to half the height of the image.
       */
      var imageCY = this.connector.cy();

      /*
       * get the y coordinate of the center of the group relative to the
       * svg parent
       */
      val = groupY + imageCY;
    }

    return val;
  }

  /**
   * Getter/setter for whether the node is highlighted
   * @parm value (optional) boolean value that sets the highlighted value
   * @returns whether the node is highlighted
   */
  isHighlighted(value) {

    if (value != null) {
      this.highlighted = value;
    }

    return this.highlighted;
  }

  /**
   * Get the group
   * @returns the group
   */
  getGroup() {
    return this.group;
  }

  /**
   * Show the delete button group
   */
  showDeleteButton() {
    this.deleteButtonGroup.show();
  }

  /**
   * Hide the delete button group
   */
  hideDeleteButton() {
    this.deleteButtonGroup.hide();
  }

  /**
   * Show the border of the node
   */
  showBorder() {
    this.border.show();
  }

  /**
   * Hide the border of the node
   */
  hideBorder() {
    this.border.hide();
  }

  /**
   * Get the connector of the node
   */
  getConnector() {
    return this.connector;
  }

  /**
   * Get the id of the connector
   */
  getConnectorId() {
    var id = null;

    if (this.connector != null) {
      id = this.connector.id();
    }

    return id;
  }

  /**
   * Get the x position of the group within the svg
   * @returns the x position of the group
   */
  getGroupX() {

    var x = 0;

    if (this.group != null) {
      /*
       * the image is located at 0, 0 within the group so we will obtain
       * the x location of the group
       */
      x = this.group.x();
    }

    return x;
  }

  /**
   * Get the y position of the group within the svg
   * @returns the y position of the group
   */
  getGroupY() {
    var y = 0;

    if (this.group != null) {
      /*
       * the image is located at 0, 0 within the group so we will obtain
       * the y location of the group
       */
      y = this.group.y();
    }

    return y;
  }

  /**
   * Get the x position of the image within the svg
   * @returns the x position of the image
   */
  getImageX() {

    // get the x position of the group
    var groupX = this.getGroupX();

    // get the x position of the image relative to the group
    var imageRelativeX = this.image.x();

    // add the values together to get the absolute x position of the image
    var imageX = groupX + imageRelativeX;

    // get the group
    var group = this.getGroup();

    // check if the group is shifted
    if (group != null) {
      // get the bounding box of the group
      var bbox = group.bbox();

      if (bbox != null) {
        // get the x position of the bounding box on the group
        var bboxX = bbox.x;

        // compensate for the shift of the group
        imageX = imageX - bboxX;
      }
    }

    return imageX;
  }

  /**
   * Get the y position of the image within the svg
   * @returns the y position of the image
   */
  getImageY() {

    // get the y position of the group
    var groupY = this.getGroupY();

    // get the y position of the image relative to the group
    var imageRelativeY = this.image.y();

    // add the values together to get the absolute y position of the image
    var imageY = groupY + imageRelativeY;

    // get the group
    var group = this.getGroup();

    // check if the group is shifted
    if (group != null) {
      // get the bounding box of the group
      var bbox = group.bbox();

      // get the y position of the bounding box on the group
      var bboxY = bbox.y;

      // compensate for the shift of the group
      imageY = imageY - bboxY;
    }

    return imageY;
  }

  /**
   * Get the width of the image
   * @returns the width of th eimage
   */
  getImageWidth() {
    var width = 0;

    if (this.image != null) {
      width = this.image.width();
    }

    return width
  }

  /**
   * Get the height of the image
   * @returns the height of the image
   */
  getImageHeight() {
    var height = 0;

    if (this.image != null) {
      height = this.image.height();
    }

    return height;
  }

  /**
   * Set the mouseover listener for the group
   * @param nodeMouseOverFunction the function to call when the mouse is over
   * the group
   */
  setNodeMouseOver(nodeMouseOverFunction) {

    if (this.group != null) {
      this.group.mouseover(nodeMouseOverFunction);
    }
  }

  /**
   * Set the mouseout listener for the group
   * @param nodeMouseOutFunction the function to call when the mouse moves
   * out of the group
   */
  setNodeMouseOut(nodeMouseOutFunction) {

    if (this.group != null) {
      this.group.mouseout(nodeMouseOutFunction);
    }
  }

  /**
   * Set the mousedown listener for the group
   * @param nodeMouseDownFunction the function to call when the mouse is
   * down on the group
   */
  setNodeMouseDown(nodeMouseDownFunction) {

    if (this.group != null) {
      this.group.mousedown(nodeMouseDownFunction);
    }
  }

  /**
   * Set the mouseup listener for the group
   * @param nodeMouseUpFunction the function to call when the mouse is
   * released over the group
   */
  setNodeMouseUp(nodeMouseUpFunction) {

    if (this.group != null) {
      this.group.mouseup(nodeMouseUpFunction);
    }
  }

  /**
   * Set the click listener for the image
   * @param nodeMouseClickFunction the function to call when the image is
   * clicked
   */
  setNodeMouseClick(nodeMouseClickFunction) {

    if (this.group != null) {
      this.image.click(nodeMouseClickFunction);
    }
  }

  /**
   * Set the mousedown listener for the connector
   * @param connectorMouseDownFunction the function to call when the mouse
   * is down on the connector
   */
  setConnectorMouseDown(connectorMouseDownFunction) {

    if (this.connector != null) {
      this.connector.mousedown(connectorMouseDownFunction);
    }
  }

  /**
   * Set the mousedown listener for the delete button
   * @param deleteButtonMouseDownFunction the function to call when the mouse
   * is down on the delete button
   */
  setDeleteButtonMouseDown(deleteButtonMouseDownFunction) {

    if (this.deleteButtonCircle != null) {
      this.deleteButtonCircle.mousedown(deleteButtonMouseDownFunction);
    }
  }

  /**
   * Set the mouseover listener for the delete button
   * @param deleteButtonMouseOverFunction the function to call when the mouse
   * is over the delete button
   */
  setDeleteButtonMouseOver(deleteButtonMouseOverFunction) {

    if (this.deleteButtonCircle != null) {
      this.deleteButtonCircle.mouseover(deleteButtonMouseOverFunction);
    }
  }

  /**
   * Set the mouseout listener for the delete button
   * @param deleteButtonMouseOutFunction the function to call when the mouse
   * moves out of the delete button
   */
  setDeleteButtonMouseOut(deleteButtonMouseOutFunction) {

    if (this.deleteButtonCircle != null) {
      this.deleteButtonCircle.mouseout(deleteButtonMouseOutFunction);
    }
  }

  /**
   * Set the dragmove listener for the group
   * @param dragMoveFunction the function to call when the group is dragged
   */
  setDragMove(dragMoveFunction) {

    if (this.group != null) {

      // set a listener for when the node is dragged
      this.group.on('dragmove', dragMoveFunction);
    }
  }

  /**
   * Set the x position
   * @param x the x position
   */
  setX(x) {
    this.x = x;
    this.group.x(x);
  }

  /**
   * Set the y position
   * @param y the y position
   */
  setY(y) {
    this.y = y;
    this.group.y(y);
  }

  /**
   * Add an outgoing link to the node
   * @param outgoingLink a ConceptMapLink object
   */
  addOutgoingLink(outgoingLink) {
    if (outgoingLink != null) {
      this.outgoingLinks.push(outgoingLink);
    }
  }

  /**
   * Remove an outgoing link from the node
   * @param outgoingLink a ConceptMapLink object
   */
  removeOutgoingLink(outgoingLink) {

    if (outgoingLink != null) {

      // loop through all the outgoing links in this node
      for (var ol = 0; ol < this.outgoingLinks.length; ol++) {

        // get an outgoing link
        var tempOutgoingLink = this.outgoingLinks[ol];

        if (outgoingLink == tempOutgoingLink) {
          // we have found the outgoing link we want to remove
          this.outgoingLinks.splice(ol, 1);
          break;
        }
      }
    }
  }

  /**
   * Get the outgoing links
   * @return the outgoing links
   */
  getOutgoingLinks() {
    return this.outgoingLinks;
  }

  /**
   * Add an incoming link to the node
   * @param incomingLink a ConceptMapLink object
   */
  addIncomingLink(incomingLink) {
    if (incomingLink != null) {
      this.incomingLinks.push(incomingLink);
    }
  }

  /**
   * Remove an incoming link from the node
   * @param incomingLink a ConceptMapLink object
   */
  removeIncomingLink(incomingLink) {

    if (incomingLink != null) {

      // loop through the incoming links in the node
      for (var il = 0; il < this.incomingLinks.length; il++) {

        // get an incoming link
        var tempIncomingLink = this.incomingLinks[il];

        if (incomingLink == tempIncomingLink) {
          // we have found the incoming link we want to remove
          this.incomingLinks.splice(il, 1);
          break;
        }
      }
    }
  }

  /**
   * Get the incoming links
   * @return the incoming links
   */
  getIncomingLinks() {
    return this.incomingLinks;
  }

  /**
   * The function that is called when the node is moved
   * @param event
   */
  dragMove(event) {

    // get the group
    var group = this.getGroup();

    // get the x and y coordinates of the center of the image
    var cx = this.cx();
    var cy = this.cy();

    // update the local x, y values of the node for bookkeeping
    this.x = group.x();
    this.y = group.y();

    // get the outgoing links and incoming links
    var outgoingLinks = this.outgoingLinks;
    var incomingLinks = this.incomingLinks;

    if (outgoingLinks != null) {

      // loop through all the outgoing links
      for (var ol = 0; ol < outgoingLinks.length; ol++) {

        // get an outgoing link
        var outgoingLink = outgoingLinks[ol];

        // update the x, y coordinate of the tail of the link
        var x1 = cx;
        var y1 = cy;

        // calculate the nearest point to the destination node
        var nearestPoint = outgoingLink.getNearestPointToDestinationNode(x1, y1);
        x2 = nearestPoint.x;
        y2 = nearestPoint.y;

        // update the coordinates of the link
        outgoingLink.updateCoordinates(x1, y1, x2, y2);
      }

      // loop through all the incoming links
      for (var il = 0; il < incomingLinks.length; il++) {

        // get an incoming link
        var incomingLink = incomingLinks[il];

        // reuse the coordinates of the tail of the link
        var x1 = incomingLink.x1();
        var y1 = incomingLink.y1();

        // calculate the nearest point to the source node
        var nearestPoint = incomingLink.getNearestPointToDestinationNode(x1, y1);
        var x2 = nearestPoint.x;
        var y2 = nearestPoint.y;

        // update the coordinates of the link
        incomingLink.updateCoordinates(x1, y1, x2, y2);
      }
    }

    if (this.controller != null) {
      // handle the student data changing
      this.controller.studentDataChanged();
    }

    // move the group to the front so that it shows up above other elements
    group.front();
  }

  /**
   * Remove the node from the svg
   */
  remove() {

    // make the group not draggable
    this.group.draggable(false);

    // remove the group
    this.group.remove();

    // remove the image
    this.image.remove();

    // remove the connector
    this.connector.remove();

    // remove the delete button
    this.deleteButtonCircle.remove();
    this.deleteButtonX.remove();
    this.deleteButtonGroup.remove();

    // loop through all the outgoing links
    for (var ol = 0; ol < this.outgoingLinks.length; ol++) {

      // get an outgoing link
      var outgoingLink = this.outgoingLinks[ol];

      if (outgoingLink != null) {
        // remove the outgoing link
        outgoingLink.remove();

        /*
         * move the counter back one because calling outgoingLink.remove()
         * has removed the outgoingLink from the outgoingLinks array
         */
        ol--;
      }
    }

    // loop through all the incoming links
    for (var il = 0; il < this.incomingLinks.length; il++) {

      // get an incoming link
      var incomingLink = this.incomingLinks[il];

      if (incomingLink != null) {
        // remove the incoming link
        incomingLink.remove();

        /*
         * move the counter back one because calling incomingLink.remove()
         * has removed the incomingLink from the incomingLinks array
         */
        il--;
      }
    }
  }

  /**
   * Get the links from this node to a given destination node
   * @param destinationNode the destination node
   */
  getLinksToDestination(destinationNode) {

    var linksToDestination = [];

    // loop through all the outgoing links
    for (var ol = 0; ol < this.outgoingLinks.length; ol++) {

      // get an outgoing link
      var outgoingLink = this.outgoingLinks[ol];

      if (outgoingLink != null) {
        if (destinationNode == outgoingLink.destinationNode) {
          /*
           * the destination of the link is the destination we are
           * looking for
           */
          linksToDestination.push(outgoingLink);
        }
      }
    }

    return linksToDestination;
  }

  /**
   * Calculate the width that the text rectangle should be set to
   * @param labelText the label text that will be displayed in the rectangle
   * @return the width that the text rectangle should be set to
   */
  calculateTextRectWidth(labelText) {
    var width = 0;

    if (labelText != null) {
      width = (labelText.length * 6) + 10;
    }

    return width;
  }

  // end of ConceptMapNode class
}

/**
 * A ConceptMapLink that represents a link in the ConceptMap component
 */
class ConceptMapLink {

  /**
   * The constructor to create a ConceptMapLink object
   * @param ConceptMapService the ConceptMapService
   * @param draw the svg.js draw object
   * @param id the instance id of the link
   * @param originalId the original authored id of the link
   * @param sourceNode the source ConceptMapNode
   * @param destinationNode the destination ConceptMapNode
   * @param label the text label
   * @param color the color of the link
   * @param curvature the curvature of the link
   * @param startCurveUp whether the start of the link curves up
   * @param endCurveUp whether the end of the link curves up
   */
  constructor(ConceptMapService, draw, id, originalId, sourceNode, destinationNode, label, color, curvature, startCurveUp, endCurveUp) {

    // remember the ConceptMapService
    this.ConceptMapService = ConceptMapService;

    this.type = 'ConceptMapLink';

    // remember the svg.js draw object
    this.draw = draw;

    // set the id
    this.id = id;

    // set the original id
    this.originalId = originalId;

    // the arrow head of the link
    this.head = null;

    // the line of the link
    this.path = null;

    // set the color of the link
    this.color = color;

    if (this.color == null) {
      // if no color is specified, use a default color
      this.color = 'blue';
    }

    // whether the link is highlighted
    this.highlighted = false;

    // create a group to contain the path and head
    this.group = this.draw.group();

    // where to place the text of the link along the line
    this.textPercentageLocationOnLink = 0.6

    // remember the source node
    this.sourceNode = sourceNode;

    /*
     * used to remember the destination node later after the destination
     * node has been chosen
     */
    this.destinationNode = destinationNode;

    // remember the curvature
    this.curvature = curvature;

    if (this.curvature == null) {
      this.curvature = 0.5;
    }

    // set whether the link curves up or down
    this.startCurveUp = startCurveUp;
    this.endCurveUp = endCurveUp;

    if (this.startCurveUp == null || this.endCurveUp == null) {
      /*
       * start and end curve up have not been specified so we will set
       * it at random
       */

      // choose a random integer 0 or 1
      var randInt = Math.floor(Math.random() * 2);

      if (randInt == 0) {
        // set the link to curve down
        this.startCurveUp = false;
        this.endCurveUp = false;
      } else {
        // set the link to curve up
        this.startCurveUp = true;
        this.endCurveUp = true;
      }
    }

    // create a curved link
    this.curvedLink = true;

    // initialize the coordinates of both ends of the link
    var x1 = this.sourceNode.cx();
    var y1 = this.sourceNode.cy();
    var x2 = x1;
    var y2 = y1;

    if (this.destinationNode != null) {

      /*
       * get the nearest point from the center of the source node to the
       * destination node along the perimeter of the destination node
       * image
       */
      var nearestPoint = this.getNearestPointToDestinationNode(x1, y1);
      x2 = nearestPoint.x;
      y2 = nearestPoint.y;

      // connect the link to the nodes
      this.connectLinkToNodes();
    }

    if (this.curvedLink) {
      // create a curved link

      // calculate the curved line in svg
      var arrowPathArraysObject = this.calculateCurvedLine(x1, y1, x2, y2);

      // get the line
      var tail = arrowPathArraysObject[0];

      // get the arrow head
      var head = arrowPathArraysObject[1];

      // draw the head and tail
      this.head = this.draw.path(head.toString());
      this.path = this.draw.path(tail.toString());
    } else {
      // create a straight line
      this.path = this.draw.path('M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2);
    }

    // set the style of the link
    this.path.attr('stroke', this.color);
    this.path.attr('stroke-width', 3);
    this.path.attr('fill', 'transparent');
    this.head.attr('stroke', this.color);
    this.head.attr('fill', this.color);
    this.head.attr('pointer-events', 'none');

    /*
     * remember the x and y coordinates of the source and destination
     * so that we can look them up easily later
     */
    this.path.attr('x1', x1);
    this.path.attr('y1', y1);
    this.path.attr('x2', x2);
    this.path.attr('y2', y2);

    // add the tail and head to the group
    this.group.add(this.path);
    this.group.add(this.head);

    // create the text group for the link
    this.createTextGroup();

    // text that describes the type of link chosen by the student
    this.setLabel(label);

    if (this.label == null || this.label == '') {
      // there is no label so we will hide the text group
      this.hideTextGroup();
    } else {
      // there is a label so we will show the text group
      this.showTextGroup();
    }

    // create the delete button group
    this.createDeleteButtonGroup();
  }

  /**
   * Get the JSON object representation of the ConceptMapLink
   * @returns a JSON object containing the data of the ConceptMapLink
   */
  toJSONObject() {
    var jsonObject = {};

    jsonObject.originalId = this.originalId;
    jsonObject.instanceId = this.id;
    jsonObject.color = this.color;
    jsonObject.label = this.label;
    jsonObject.curvature = this.curvature;
    jsonObject.startCurveUp = this.startCurveUp;
    jsonObject.endCurveUp = this.endCurveUp;
    jsonObject.sourceNodeOriginalId = this.sourceNode.getOriginalId();
    jsonObject.sourceNodeInstanceId = this.sourceNode.getId();
    jsonObject.sourceNodeLabel = this.sourceNode.getLabel();
    jsonObject.destinationNodeOriginalId = this.destinationNode.getOriginalId();
    jsonObject.destinationNodeInstanceId = this.destinationNode.getId();
    jsonObject.destinationNodeLabel = this.destinationNode.getLabel();

    return jsonObject;
  }

  /**
   * Get the id of the link
   * @returns the id of the link
   */
  getId() {
    return this.id;
  }

  /**
   * Get the original id of the node
   * @returns the original id of the node
   */
  getOriginalId() {
    return this.originalId;
  }

  /**
   * Get the id of the group
   * @returns the id of the group
   */
  getGroupId() {
    return this.group.id();
  }

  /**
   * Get the x1 value
   * @returns the x coordinate of the source of the link
   */
  x1() {
    return this.path.attr('x1');
  }

  /**
   * Get the y1 value
   * @returns the y coordinate of the source of the link
   */
  y1() {
    return this.path.attr('y1');
  }

  /**
   * Get the x2 value
   * @returns the x coordinate of the destination of the link
   */
  x2() {
    return this.path.attr('x2');
  }

  /**
   * Get the y2 value
   * @returns the y coordinate of the destination of the link
   */
  y2() {
    return this.path.attr('y2');
  }

  /**
   * Set the original id
   * @param originalId the original id
   */
  setOriginalId(originalId) {
    this.originalId = originalId;
  }

  /**
   * Get the label
   * @returns the label
   */
  getLabel() {
    return this.label;
  }

  /**
   * Getter/setter for the highlighted value
   * @param value (optional) the highlighted value
   * @returns whether the link is highlighted
   */
  isHighlighted(value) {

    if (value != null) {
      this.highlighted = value;
    }

    return this.highlighted;
  }

  /**
   * Update the coordinates of the link
   * @param x1 (optional) the x position of the source
   * @param y1 (optional) the y position of the source
   * @param x2 (optional) the x position of the destination
   * @param y2 (optional) the y position of the destination
   * @param isDragging whether the link is currently being dragged
   */
  updateCoordinates(x1, y1, x2, y2, isDragging) {
    var array = this.path.array();

    if (this.curvedLink) {
      // draw a curved link

      if (x1 == null) {
        /*
         * the x1 parameter was not provided so we will reuse the
         * existing value
         */
        x1 = this.path.attr('x1');
      }

      if (y1 == null) {
        /*
         * the y1 parameter was not provided so we will reuse the
         * existing value
         */
        y1 = this.path.attr('y1');
      }

      if (x2 == null) {
        /*
         * the x2 parameter was not provided so we will reuse the
         * existing value
         */
        x2 = this.path.attr('x2');
      }

      if (y2 == null) {
        /*
         * the y2 parameter was not provided so we will reuse the
         * existing value
         */
        y2 = this.path.attr('y2');
      }

      // calculate the line
      var arrowPathArraysObject = this.calculateCurvedLine(x1, y1, x2, y2, isDragging);

      // get the svg tail
      var tail = arrowPathArraysObject[0];

      // get the svg head
      var head = arrowPathArraysObject[1];

      // re-plot the head and path
      this.head.plot(head.toString());
      this.path.plot(tail.toString());
    } else {
      // draw a straight line

      if (x1 == null) {
        /*
         * the x1 parameter was not provided so we will reuse the
         * existing value
         */
        x1 = this.path.attr('x1');
      }

      if (y1 == null) {
        /*
         * the y1 parameter was not provided so we will reuse the
         * existing value
         */
        y1 = this.path.attr('y1');
      }

      if (x2 == null) {
        /*
         * the x2 parameter was not provided so we will reuse the
         * existing value
         */
        x2 = this.path.attr('x2');
      }

      if (y2 == null) {
        /*
         * the y2 parameter was not provided so we will reuse the
         * existing value
         */
        y2 = this.path.attr('y2');
      }

      // re-plot the line
      this.path.plot('M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2);
    }

    // update the coordinate values
    this.path.attr('x1', x1);
    this.path.attr('y1', y1);
    this.path.attr('x2', x2);
    this.path.attr('y2', y2);

    if (this.deleteButtonGroup != null) {
      // update the location of the delete button
      var deleteButtonLocation = this.getDeleteButtonLocation();
      this.deleteButtonGroup.x(deleteButtonLocation.x);
      this.deleteButtonGroup.y(deleteButtonLocation.y);
    }

    if (this.textGroup != null) {
      // update the location of the text group

      // get the length of the line
      var totalLength = this.path.node.getTotalLength();

      // get the coordinate of a point somewhere in the middel of the line
      var midPoint = this.path.node.getPointAtLength(totalLength * this.textPercentageLocationOnLink);

      this.textGroup.cx(midPoint.x);
      this.textGroup.cy(midPoint.y);
    }
  }

  /**
   * Calculate the curved line
   * @param x1 the x coordinate of the source
   * @param y1 the y coordinate of the source
   * @param x2 the x coordinate of the destination
   * @param y2 the y coordinate of the destination
   * @param isDragging whether the line is currently being dragged
   * @returns an array that contains the svg objects for the arrow head and line
   */
  calculateCurvedLine(x1, y1, x2, y2, isDragging) {

    var startx = x1;
    var starty = y1;
    var endx = x2;
    var endy = y2;
    var startCurveUp = true;
    var endCurveUp = true;
    var len = 15;
    var angle = 45;
    var curvature = 0.5;
    var nodeRadius = 10;

    // set the amount of curvature of the line
    curvature = this.curvature;

    // whether the link should curve up or down
    startCurveUp = this.startCurveUp;
    endCurveUp = this.endCurveUp;

    // calculate the svg objects for the arrow head and line
    var arrowPathArraysObject = this.ConceptMapService.arrowPathArrays(startx,starty,endx,endy,startCurveUp,endCurveUp,len,angle,curvature,nodeRadius);

    return arrowPathArraysObject;
  }

  /**
   * Set the destination node
   * @param destinationNode the destination ConceptMapNode object
   */
  setDestination(destinationNode) {

    if (destinationNode != null) {

      // get x and y of the tail
      var x1 = this.path.attr('x1');
      var y1 = this.path.attr('y1');

      // remember the destination node
      this.destinationNode = destinationNode;

      /*
       * check if there are any links with that have the same source,
       * destination, and direction. if there is a link that has the
       * same source, destination, and direction, we will try to use
       * a different direction that hasn't already been used. if all
       * directions have already been used, we will use the original
       * direction the user specified. there are three link directions,
       * up, straight, and down.
       *    ___
       * up  /   \
       *  o  o
       *
       * straight o------o
       *
       *    o   o
       * down \__/
       */

      var directionAlreadyUsed = false;
      var direction = '';

      if (this.curvature == 0) {
        // the user has created the curve to be straight
        direction = 'straight';
      } else if (this.startCurveUp && this.endCurveUp) {
        // the user has created the curve that starts by pointing up
        direction = 'up';
      } else if (!this.startCurveUp && !this.endCurveUp) {
        // the user has created the curve that starts by pointing down
        direction = 'down';
      }

      // get all the links that have the same source and destination
      var parallelLinks = this.sourceNode.getLinksToDestination(destinationNode);

      var usedDirections = [];

      // loop through all the links that have the same source and destination
      for (var p = 0; p < parallelLinks.length; p++) {
        var parallelLink = parallelLinks[p];

        if (parallelLink != null) {

          var curvature = parallelLink.curvature;
          var startCurveUp = parallelLink.startCurveUp;
          var endCurveUp = parallelLink.endCurveUp;

          var tempDirection = '';

          if (curvature == 0) {
            // the other link is straight
            tempDirection = 'straight';
          } else if (startCurveUp && endCurveUp) {
            // the other link points up
            tempDirection = 'up';
          } else if (!startCurveUp && !endCurveUp) {
            // the other link points down
            tempDirection = 'down'
          }

          if (direction == tempDirection) {
            /*
             * the direction is the same as the direction the user
             * has specified
             */
            directionAlreadyUsed = true;
          }

          // keep track of the directions that were used
          usedDirections.push(tempDirection);
        }
      }

      if (directionAlreadyUsed) {
        /*
         * the direction the user specified is already used so we will
         * try to find a direction that hasn't been used
         */

        if (usedDirections.indexOf('up') == -1) {
          /*
           * we have not used the up direction yet so we will make
           * the link point up
           */
          this.curvature = 0.5;
          this.startCurveUp = true;
          this.endCurveUp = true;
        } else if (usedDirections.indexOf('straight') == -1) {
          /*
           * we have not used the straight direction yet so we will
           * make the link point straight
           */
          this.curvature = 0.0;
          this.startCurveUp = true;
          this.endCurveUp = true;
        } else if (usedDirections.indexOf('down') == -1) {
          /*
           * we have not used the down direction yet so we will make
           * the link point down
           */
          this.curvature = 0.5;
          this.startCurveUp = false;
          this.endCurveUp = false;
        }
      }

      /*
       * get the nearest point from the center of the source node to the
       * destination node along the perimeter of the destination node
       * image
       */
      var nearestPoint = this.getNearestPointToDestinationNode(x1, y1);
      var x2 = nearestPoint.x;
      var y2 = nearestPoint.y;

      // update the coordinates of the link
      var isDragging = false;
      this.updateCoordinates(x1, y1, x2, y2, isDragging);

      // connect the link to the nodes
      this.connectLinkToNodes();

      // hide the delete button
      this.hideDeleteButton();
    }
  }

  /**
   * Get the nearest point to the destination node from a given x, y point
   * @param x the x value of the source point
   * @param y the y value of the source point
   * @returns an object containing an x and y field
   */
  getNearestPointToDestinationNode(x, y) {

    // get the coordinates of the upper left corner of the image
    var rectMinX = this.destinationNode.getImageX();
    var rectMinY = this.destinationNode.getImageY();

    /*
     * add padding of 25 pixels to resolve the problem of the arrow head
     * being placed behind the destination image
     */
    rectMinY = rectMinY - 25;

    // get the width and height of the image
    var width = this.destinationNode.getImageWidth();
    var height = this.destinationNode.getImageHeight();

    // compensate for the 25 pixel padding that we added above
    height = height + 25;

    /*
    var destinationNodeGroup = this.destinationNode.getGroup();
    var destinationNodeGroupBBox = destinationNodeGroup.bbox();

    rectMinX = this.destinationNode.getGroupX();
    rectMinY = this.destinationNode.getGroupY();

    width = destinationNodeGroupBBox.width;
    height = destinationNodeGroupBBox.height;
    */

    if (x == null && y == null) {
      // get the coordinates of the source if x and y were not provided
      x = this.path.attr('x1');
      y = this.path.attr('y1');
    }

    /*
     * find the nearest point from the source to anywhere along the
     * rectangular perimeter of the destination image
     */
    var point = this.getNearestPointInPerimeter(rectMinX, rectMinY, width, height, x, y);

    return point;
  }

  /**
   * Get the nearest point on a rectangle from a source point
   * @param l the upper left x value of the rectangle
   * @param t the upper left y value of the rectangle
   * @param w the width of the rectangle
   * @param h the height of the rectangle
   * @param x the source point x value
   * @param y the source point y value
   * @returns the point on the rectangle that is closest to the
   */
  getNearestPointInPerimeter(l, t, w, h, x, y) {
    var r = l + w;
    var b = t + h;

    var x = this.clamp(x, l , r);
    var y = this.clamp(y, t, b);

    var dl = Math.abs(x - l);
    var dr = Math.abs(x - r);
    var dt = Math.abs(y - t);
    var db = Math.abs(y - b);

    var m = Math.min(dl, dr, dt, db);

    var point = {};

    if (m == dt) {
      point.x = x;
      point.y = t;
    } else if (m == db) {
      point.x = x;
      point.y = b;
    } else if (m == dl) {
      point.x = l;
      point.y = y;
    } else {
      point.x = r;
      point.y = y;
    }

    return point;
  }

  /**
   * Helper function for getNearestPointInPerimeter
   */
  clamp(x, lower, upper) {
    return Math.max(lower, Math.min(upper, x));
  }

  /**
   * Set the color of the link
   * @param color the color
   */
  setColor(color) {

    if (color != null) {
      // set the color styling
      this.color = color;
      this.path.attr('stroke', this.color);
      this.head.attr('stroke', this.color);
      this.head.attr('fill', this.color);
      this.deleteButton.attr('stroke', this.color);
      this.deleteButtonX.attr('stroke', this.color);
    }
  }

  /**
   * Set the label
   * @param label the text label
   */
  setLabel(label) {

    if (label != null) {

      // remember the label
      this.label = label;

      // set the text into the text element
      this.text.text(label);

      // show the text group now that it has a label
      this.showTextGroup();

      // reset the width to adjust to the new text length
      var width = 0;

      try {
        // get the width of the bounding box of the text node
        var textBBox = this.text.node.getBBox();

        if (textBBox.width == 0) {
          width = this.calculateTextRectWidth(this.label);
        } else {
          width = textBBox.width + 10;
        }
      } catch(e) {
        /*
         * we were unable to get the bounding box (likely because
         * Firefox threw an error when trying to call getBBox())
         * so we will calculate the width based on the label text
         */
        width = this.calculateTextRectWidth(this.label);
      }

      this.textRect.attr('width', width);

      // recalculate the position of the svg text object
      var totalLength = this.path.node.getTotalLength();
      var midPoint = this.path.node.getPointAtLength(totalLength * this.textPercentageLocationOnLink);
      this.textGroup.cx(midPoint.x);
      this.textGroup.cy(midPoint.y);
    }
  }

  /**
   * Connect a link the its source and destination nodes
   */
  connectLinkToNodes() {

    if (this.sourceNode != null && this.destinationNode != null) {

      // add the link to the outgoing links of its source node
      this.sourceNode.addOutgoingLink(this);

      // add the link to the incoming links of its destination node
      this.destinationNode.addIncomingLink(this);
    }
  }

  /**
   * Create the delete button for the link
   */
  createDeleteButtonGroup() {
    // create a group to contain the elements of the delete button
    this.deleteButtonGroup = this.draw.group();

    /*
     * create an invisible circle that is placed behind the delete button
     * and has a larger radius than the delete button. this is used for
     * mouse over purposes so that we can keep the delete button visible
     * when the mouse is around the area of the delete button
     */
    var invisibleCircleRadius = 30;
    this.invisibleCircle = this.draw.circle();
    this.invisibleCircle.radius(invisibleCircleRadius);
    this.invisibleCircle.fill({ opacity: 0.0});

    // create the delete button circle
    var deleteButtonRadius = 10;
    this.deleteButton = this.draw.circle();
    this.deleteButton.radius(deleteButtonRadius);
    this.deleteButton.fill({ opacity: 0.0 });
    this.deleteButton.stroke({ color: this.color, opacity: 1.0, width: 2 });

    /*
     * create the x part of the delete button by creating a + and then
     * rotating it 45 degrees
     */

    // get the coordinate of the center of the delete button
    var deleteButtonMidpointX = this.deleteButton.cx();
    var deleteButtonMidpointY = this.deleteButton.cy();

    // get the coordinates of the top of the +
    var topX = deleteButtonMidpointX;
    var topY = deleteButtonMidpointY - (deleteButtonRadius * 0.7);

    // get the coordinates of the bottom of the +
    var bottomX = deleteButtonMidpointX;
    var bottomY = deleteButtonMidpointY + (deleteButtonRadius * 0.7);

    // get the coordinates of the left of the +
    var leftX = deleteButtonMidpointX - (deleteButtonRadius * 0.7);
    var leftY = deleteButtonMidpointY;

    // get the coordinates of the right of the +
    var rightX = deleteButtonMidpointX + (deleteButtonRadius * 0.7);
    var rightY = deleteButtonMidpointY;

    // create the path for the +
    var deleteButtonXPath = 'M' + topX + ',' + topY + 'L' + bottomX + ',' + bottomY + 'M' + leftX + ',' + leftY + 'L' + rightX + ',' + rightY;

    // draw the path
    this.deleteButtonX = this.draw.path(deleteButtonXPath);
    this.deleteButtonX.stroke({ color: this.color, opacity: 1.0, width: 2 });

    /// rotate the + to create the x
    this.deleteButtonX.rotate(45);

    /*
     * disable pointer events on the x so that we only need to set a
     * mouse listener on the circle
     */
    this.deleteButtonX.attr('pointer-events', 'none');

    // add the invisible circle, regular circle, and x to the group
    this.deleteButtonGroup.add(this.invisibleCircle);
    this.deleteButtonGroup.add(this.deleteButton);
    this.deleteButtonGroup.add(this.deleteButtonX);

    // set the location of the delete button group
    var location = this.getDeleteButtonLocation();
    var x = location.x;
    var y = location.y;
    this.deleteButtonGroup.x(x);
    this.deleteButtonGroup.y(y);

    // set the listener for when the mouse is over the group
    this.deleteButtonGroup.mouseover((event) => {
      this.deleteButtonGroupMouseOver(event);
    });

    // set the listener for when the mouse moves out of the group
    this.deleteButtonGroup.mouseout((event) => {
      this.deleteButtonGroupMouseOut(event);
    });

    // add the delete button group to the link group
    this.group.add(this.deleteButtonGroup);

    /*
     * hide the delete button. we only need to show the delete button
     * when the link is active.
     */
    this.deleteButtonGroup.hide();
  }

  /**
   * Called when the mouse is over the delete button group
   * @param event the mouseover event
   */
  deleteButtonGroupMouseOver(event) {
    // show the delete button
    this.showDeleteButton();
  }

  /**
   * Called when the mouse leaves the delete button group
   * @param event the mouseout event
   */
  deleteButtonGroupMouseOut(event) {
    if (!this.highlighted) {
      // the link is not highlighted so we will hide the delete button
      this.hideDeleteButton();
    }
  }

  /**
   * Called when the delete button is clicked
   * @param deleteButtonClickedFunction the function to call when the delete
   * button is clicked
   */
  setDeleteButtonClicked(deleteButtonClickedFunction) {
    // listen for the click event on the delete button to call the function
    this.deleteButton.click(deleteButtonClickedFunction);
  }

  /**
   * Called when the mouse is clicked down on the group
   * @param linkMouseDownFunction the function to call when the mouse is
   * clicked down on the group
   */
  setLinkMouseDown(linkMouseDownFunction) {

    if (this.group != null) {
      /*
       * listen for the mousedown event on the group to call
       * the function
       */
      this.group.mousedown(linkMouseDownFunction);
    }
  }

  /**
   * Called when the mouse is clicked down on the link text group
   * @param linkTextMouseDownFunction the function to call when the mouse is
   * clicked down on the link text group
   */
  setLinkTextMouseDown(linkTextMouseDownFunction) {

    if (this.textGroup != null) {
      /*
       * listen for the mousedown event on the link text group to call
       * the function
       */
      this.textGroup.mousedown(linkTextMouseDownFunction);
    }
  }

  /**
   * Called when the mouse is over the group
   * @param linkMouseOverFunction the function to call when the mouse is over
   * the group
   */
  setLinkMouseOver(linkMouseOverFunction) {
    if (this.group != null) {
      // listen for the mouseover event on the group to call the function
      this.group.mouseover(linkMouseOverFunction);
    }
  }

  /**
   * Called when the mouse leaves the group
   * @param linkMouseOutFunction the function to call when the mouse leaves
   * the group
   */
  setLinkMouseOut(linkMouseOutFunction) {
    if (this.group != null) {
      // listen for the mouseout event on the group to call the function
      this.group.mouseout(linkMouseOutFunction);
    }
  }

  /**
  * Calculate the location of the delete button for the link
  *
  * Note: This function and the associated functions that are called by this
  * function are taken from the Concord MySystem github project.
  * https://github.com/concord-consortium/mysystem_sc
  * The code is found in the _setRemoveButtonLocation function in the link.js file.
  * mysystem_sc/apps/my_system/views/link.js
  */
  getDeleteButtonLocation() {
    //var line = raphaelObject.items[2];

    var line = this.path.node;
    var distanceAlongLine = 35;
    var distanceAlongNormal = 18;
    var len, p1, p2, scale, dx, dy, x, y, occluded;

    /*
    var link = this.get('content');
    if (!link.isComplete()) return;
    if (line.attr('path').length < 1) return;   // this can happen after our content is destroyed
    */

    len = line.getTotalLength();
    p2  = line.getPointAtLength(len);

    if (len > 50) {
      p1 = line.getPointAtLength(len - distanceAlongLine);

      dx = p2.x - p1.x;
      dy = p2.y - p1.y;
      scale = distanceAlongNormal / distanceAlongLine * (dx > 0 ? 1 : -1);

      x = p1.x + scale * dy;
      y = p1.y - scale * dx;
      //occluded = NO;
    }
    else {
      x = 0;
      y = 0;
      //occluded = YES;
    }

    /*
    this.set('removeButtonX', x);
    this.set('removeButtonY', y);
    this.set('isRemoveButtonOccluded', occluded);
    */

    var location = {};
    location.x = x;
    location.y = y;

    return location;
  }

  /**
   * Show the delete button
   */
  showDeleteButton() {
    if (this.deleteButtonGroup != null) {
      this.deleteButtonGroup.show();
    }
  }

  /**
   * Hide the delete button
   */
  hideDeleteButton() {
    if (this.deleteButtonGroup != null) {
      this.deleteButtonGroup.hide();
    }
  }

  /**
   * Create the text group
   * @returns the text group
   */
  createTextGroup() {

    // create the group
    this.textGroup = this.draw.group();

    // create a rectangle to surround the text
    this.textRect = this.draw.rect(100, 15);
    this.textRect.attr('fill', 'white');
    this.textRect.attr('stroke', 'black');
    this.textRect.attr('x', 0);
    this.textRect.attr('y', 10);
    this.textRect.attr('width', 100);
    this.textRect.attr('height', 20);
    this.textRect.radius(5);

    var label = '';

    // create the text element
    this.text = this.draw.text(label);
    this.text.attr('x', 5);
    this.text.attr('y', 9);
    this.text.font({
      family: 'Arial',
      size: 12
    });

    // prevent the text from being highlighted when the user drags the mouse
    this.text.style('user-select:none');
    this.text.node.setAttribute('user-select', 'none');
    this.text.node.setAttribute('style', 'user-select:none');

    // add the rectangle and text to the group
    this.textGroup.add(this.textRect);
    this.textGroup.add(this.text);

    var width = 0;

    try {
      // get the width of the bounding box of the text node
      var textBBox = this.text.node.getBBox();

      if (textBBox.width == 0) {
        width = this.calculateTextRectWidth(this.label);
      } else {
        width = textBBox.width + 10;
      }
    } catch(e) {
      /*
       * we were unable to get the bounding box (likely because
       * Firefox threw an error when trying to call getBBox())
       * so we will calculate the width based on the label text
       */
      width = this.calculateTextRectWidth(this.label);
    }

    this.textRect.attr('width', width);

    // set the location of the text to be somewhere along the line of the link
    var totalLength = this.path.node.getTotalLength();
    var midPoint = this.path.node.getPointAtLength(totalLength * this.textPercentageLocationOnLink);
    this.textGroup.cx(midPoint.x);
    this.textGroup.cy(midPoint.y);

    // hide the text group until the student has chosen a link type
    this.textGroup.hide();

    /*
     * set the link group id into the text group so we can look it up
     * later when the mouse is clicked down on the text group
     */
    this.textGroup.node.linkGroupId = this.group.id();

    return this.textGroup;
  }

  /**
   * Move the text group to the front so that it won't be blocked behind
   * another element when the student tries to click on the text group.
   */
  moveTextGroupToFront() {
    this.textGroup.front();
  }

  /**
   * Show the text group
   */
  showTextGroup() {

    if (this.textGroup != null) {
      this.textGroup.show();
    }
  }

  /**
   * Hide the text group
   */
  hideTextGroup() {

    if (this.textGroup != null) {
      this.textGroup.hide();
    }
  }

  /**
   * Remove all the references to the link and also remove all the elements
   * from the svg
   */
  remove() {

    if (this.sourceNode != null) {
      // remove the link from the source node's outgoing links
      this.sourceNode.removeOutgoingLink(this);
    }

    if (this.destinationNode != null) {
      // remove the link from the destination node's incoming links
      this.destinationNode.removeIncomingLink(this);
    }

    if (this.path != null) {
      // remove the line
      this.path.remove();
    }

    if (this.head != null) {
      // remove the arrow head
      this.head.remove();
    }

    if (this.deleteButtonGroup != null) {
      // remove the delete button group
      this.deleteButtonGroup.remove();
    }

    if (this.textGroup != null) {
      // remove the text group
      this.textGroup.remove();
    }

    if (this.group != null) {
      // remove the link group
      this.group.remove();
    }
  }

  /**
   * Calculate the width that the text rectangle should be set to
   * @param labelText the label text that will be displayed in the rectangle
   * @return the width that the text rectangle should be set to
   */
  calculateTextRectWidth(labelText) {
    var width = 0;

    if (labelText != null) {
      width = (labelText.length * 6) + 10;
    }

    return width;
  }

  // end of ConceptMapLink class
}


ConceptMapService.$inject = [
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

export default ConceptMapService;
