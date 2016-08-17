'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeService = require('../../services/nodeService');

var _nodeService2 = _interopRequireDefault(_nodeService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ConceptMapService = function (_NodeService) {
    _inherits(ConceptMapService, _NodeService);

    function ConceptMapService(StudentDataService, UtilService) {
        _classCallCheck(this, ConceptMapService);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ConceptMapService).call(this));

        _this.StudentDataService = StudentDataService;
        _this.UtilService = UtilService;
        return _this;
    }

    /**
     * Create a ConceptMap component object
     * @returns a new ConceptMap component object
     */


    _createClass(ConceptMapService, [{
        key: 'createComponent',
        value: function createComponent() {
            var component = {};
            component.id = this.UtilService.generateKey();
            component.type = 'ConceptMap';
            component.prompt = 'Enter prompt here';
            component.showSaveButton = false;
            component.showSubmitButton = false;
            component.isStudentAttachmentEnabled = false;
            return component;
        }

        /**
         * Copies a ConceptMap component object
         * @returns a copied ConceptMap component object
         */

    }, {
        key: 'copyComponent',
        value: function copyComponent(componentToCopy) {
            var component = this.createComponent();
            component.prompt = componentToCopy.prompt;
            component.showSaveButton = componentToCopy.showSaveButton;
            component.showSubmitButton = componentToCopy.showSubmitButton;
            component.starterSentence = componentToCopy.starterSentence;
            component.isStudentAttachmentEnabled = componentToCopy.isStudentAttachmentEnabled;
            return component;
        }
        /**
         * Populate a component state with the data from another component state
         * @param componentStateFromOtherComponent the component state to obtain the data from
         * @return a new component state that contains the student data from the other
         * component state
         */

    }, {
        key: 'populateComponentState',
        value: function populateComponentState(componentStateFromOtherComponent) {
            var componentState = null;

            if (componentStateFromOtherComponent != null) {

                // create an empty component state
                componentState = this.StudentDataService.createComponentState();

                // get the component type of the other component state
                var otherComponentType = componentStateFromOtherComponent.componentType;

                if (otherComponentType === 'ConceptMap') {
                    // the other component is an ConceptMap component

                    // get the student data from the other component state
                    var studentData = componentStateFromOtherComponent.studentData;

                    // create a copy of the student data
                    var studentDataCopy = this.UtilService.makeCopyOfJSONObject(studentData);

                    // set the student data into the new component state
                    componentState.studentData = studentDataCopy;
                }
            }

            return componentState;
        }
    }, {
        key: 'isCompleted',


        /**
         * Check if the component was completed
         * @param component the component object
         * @param componentStates the component states for the specific component
         * @param componentEvents the events for the specific component
         * @param nodeEvents the events for the parent node of the component
         * @param node parent node of the component
         * @returns whether the component was completed
         */
        value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
            var result = false;

            if (componentStates && componentStates.length) {
                var submitRequired = node.showSubmitButton || component.showSubmitButton && !node.showSaveButton;

                if (submitRequired) {
                    // completion requires a submission, so check for isSubmit in any component states
                    for (var i = 0, l = componentStates.length; i < l; i++) {
                        var state = componentStates[i];
                        if (state.isSubmit && state.studentData) {
                            // component state is a submission
                            if (state.studentData.response) {
                                // there is a response so the component is completed
                                result = true;
                                break;
                            }
                        }
                    }
                } else {
                    // get the last component state
                    var _l = componentStates.length - 1;
                    var componentState = componentStates[_l];

                    var studentData = componentState.studentData;

                    if (studentData != null) {
                        if (studentData.response) {
                            // there is a response so the component is completed
                            result = true;
                        }
                    }
                }
            }

            return result;
        }
    }, {
        key: 'newConceptMapNode',


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
         * @param a ConceptMapNode
         */
        value: function newConceptMapNode(draw, id, originalId, filePath, label, x, y, width, height) {
            return new ConceptMapNode(this, draw, id, originalId, filePath, label, x, y, width, height);
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

    }, {
        key: 'newConceptMapLink',
        value: function newConceptMapLink(draw, id, originalId, sourceNode, destinationNode, label, color, curvature, startCurveUp, startCurveDown) {
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

    }, {
        key: 'getSlope',
        value: function getSlope(x1, y1, x2, y2) {

            var slope = null;

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

    }, {
        key: 'calculateDistance',
        value: function calculateDistance(x1, y1, x2, y2) {

            // calculate the distance
            var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

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

    }, {
        key: 'arrowPathArrays',
        value: function arrowPathArrays(startx, starty, endx, endy, startCurveUp, endCurveUp, len, angle, curvature, nodeRadius) {

            if (startx === endx && starty === endy) {
                return [[""], [""]];
            }

            var start = new this.coord(startx, starty),
                tip = new this.coord(endx, endy),
                pathData = [],
                arrowHeadData = [];

            // calculate control points c2 and c3
            var curveDistance = (tip.x - start.x) * curvature,
                startYCurveDistance = curveDistance === 0 ? 1 : Math.max(Math.min(curveDistance, 100), -100),
                endYCurveDistance = startYCurveDistance,
                startUp = startCurveUp ? 1 : -1,
                endUp = endCurveUp ? 1 : -1;
            startYCurveDistance = startYCurveDistance * startUp > 0 ? startYCurveDistance : startYCurveDistance * -1;
            endYCurveDistance = endYCurveDistance * endUp > 0 ? endYCurveDistance : endYCurveDistance * -1;
            var c2 = new this.coord(start.x + curveDistance / 2, start.y - startYCurveDistance),
                c3 = new this.coord(tip.x - curveDistance / 2, tip.y - endYCurveDistance),
                cDistance = Math.sqrt(Math.pow(curveDistance / 2, 2) + Math.pow(startYCurveDistance, 2)),
                perimX = nodeRadius * (curveDistance / 2) / cDistance,
                perimYstart = nodeRadius * startYCurveDistance / cDistance,
                perimYend = nodeRadius * endYCurveDistance / cDistance;

            // update tip
            tip = new this.coord(tip.x - perimX, tip.y - perimYend);

            // draw arrow path

            pathData.push("M", start.x + perimX, start.y - perimYstart); // move to start of line
            pathData.push("C", c2.x, c2.y, c3.x, c3.y, tip.x, tip.y); // curve line to the tip

            // draw arrow head
            var percLengthOfHead = len / this.getLengthOfCubicBezier(start, c2, c3, tip),
                centerBaseOfHead = this.getPointOnCubicBezier(percLengthOfHead, start, c2, c3, tip),
                theta = Math.atan2(tip.y - centerBaseOfHead.y, tip.x - centerBaseOfHead.x),
                baseAngleA = theta + angle * Math.PI / 180,
                baseAngleB = theta - angle * Math.PI / 180,
                baseA = new this.coord(tip.x - len * Math.cos(baseAngleA), tip.y - len * Math.sin(baseAngleA)),
                baseB = new this.coord(tip.x - len * Math.cos(baseAngleB), tip.y - len * Math.sin(baseAngleB));

            arrowHeadData.push("M", tip.x, tip.y);
            arrowHeadData.push("L", baseA.x, baseA.y); // line to baseA
            arrowHeadData.push("L", baseB.x, baseB.y); // line to baseB
            arrowHeadData.push("L", tip.x, tip.y); // line back to the tip

            return [pathData, arrowHeadData];
        }

        /**
         * Note: This function is from
         * https://github.com/concord-consortium/mysystem_sc
         * The code is found in the arrow_drawing.js file.
         * mysystem_sc/apps/my_system/mixins/arrow_drawing.js
         */

    }, {
        key: 'coord',
        value: function coord(x, y) {
            if (!x) x = 0;
            if (!y) y = 0;
            /* 
            *   Limit precision of decimals for SVG rendering.
            *   otherwise we get really long SVG strings, 
            *   and webkit error messsages like of this sort:
            *   "Error: Problem parsing d='<svg string with long dec>'"
            */
            x = Math.round(x * 1000) / 1000;
            y = Math.round(y * 1000) / 1000;
            return { x: x, y: y };
        }

        /**
         * Note: This function is from
         * https://github.com/concord-consortium/mysystem_sc
         * The code is found in the arrow_drawing.js file.
         * mysystem_sc/apps/my_system/mixins/arrow_drawing.js
         */

    }, {
        key: 'getLengthOfCubicBezier',
        value: function getLengthOfCubicBezier(C1, C2, C3, C4) {
            var precision = 10,
                length = 0,
                t,
                currentPoint,
                previousPoint;

            for (var i = 0; i < precision; i++) {
                t = i / precision;
                currentPoint = this.getPointOnCubicBezier(t, C1, C2, C3, C4);
                if (i > 0) {
                    var xDif = currentPoint.x - previousPoint.x,
                        yDif = currentPoint.y - previousPoint.y;
                    length += Math.sqrt(xDif * xDif + yDif * yDif);
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

    }, {
        key: 'getPointOnCubicBezier',
        value: function getPointOnCubicBezier(percent, C1, C2, C3, C4) {
            if (percent < 0) percent = 0;
            if (percent > 1) percent = 1;
            var pos = new this.coord();
            pos.x = C1.x * this.B1(percent) + C2.x * this.B2(percent) + C3.x * this.B3(percent) + C4.x * this.B4(percent);
            pos.y = C1.y * this.B1(percent) + C2.y * this.B2(percent) + C3.y * this.B3(percent) + C4.y * this.B4(percent);
            return pos;
        }

        /**
         * Note: These functions are from
         * https://github.com/concord-consortium/mysystem_sc
         * The code is found in the arrow_drawing.js file.
         * mysystem_sc/apps/my_system/mixins/arrow_drawing.js
         */

    }, {
        key: 'B1',
        value: function B1(t) {
            return t * t * t;
        }
    }, {
        key: 'B2',
        value: function B2(t) {
            return 3 * t * t * (1 - t);
        }
    }, {
        key: 'B3',
        value: function B3(t) {
            return 3 * t * (1 - t) * (1 - t);
        }
    }, {
        key: 'B4',
        value: function B4(t) {
            return (1 - t) * (1 - t) * (1 - t);
        }
    }]);

    return ConceptMapService;
}(_nodeService2.default);

/**
 * A ConceptMapNode that represents a node in the ConceptMap component
 */


var ConceptMapNode = function () {

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
     */

    function ConceptMapNode(ConceptMapService, draw, id, originalId, filePath, label, x, y, width, height) {
        _classCallCheck(this, ConceptMapNode);

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


    _createClass(ConceptMapNode, [{
        key: 'toJSONObject',
        value: function toJSONObject() {
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

                /*
                 * create an object containing the instance id and original id
                 * of the link
                 */
                var tempLinkObject = {};
                tempLinkObject.originalId = originalId;
                tempLinkObject.instanceId = instanceId;

                jsonObject.outgoingLinks.push(tempLinkObject);
            }

            // loop through all the incoming links
            for (var il = 0; il < this.incomingLinks.length; il++) {
                var incomingLink = this.incomingLinks[il];

                var instanceId = incomingLink.getId();
                var originalId = incomingLink.getOriginalId();

                /*
                 * create an object containing the instance id and original id
                 * of the link
                 */
                var tempLinkObject = {};
                tempLinkObject.originalId = originalId;
                tempLinkObject.instanceId = instanceId;

                jsonObject.incomingLinks.push(tempLinkObject);
            }

            return jsonObject;
        }

        /**
         * Create the border that displays when the node is highlighted or
         * moused over.
         * @returns the svg rectangle that represents the border
         */

    }, {
        key: 'createBorder',
        value: function createBorder() {

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

    }, {
        key: 'createConnector',
        value: function createConnector() {

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

    }, {
        key: 'createDeleteButtonGroup',
        value: function createDeleteButtonGroup() {

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
            var topY = 0 - deleteButtonRadius * 0.7;

            // get the bottom location of the +
            var bottomX = 0;
            var bottomY = 0 + deleteButtonRadius * 0.7;

            // get the left position of the +
            var leftX = 0 - deleteButtonRadius * 0.7;
            var leftY = 0;

            // get the right position of the +
            var rightX = 0 + deleteButtonRadius * 0.7;
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
         * Get the id of the node
         * @returns the id of the node
         */

    }, {
        key: 'getId',
        value: function getId() {
            return this.id;
        }

        /**
         * Get the original id of the node
         * @returns the original id of the node
         */

    }, {
        key: 'getOriginalId',
        value: function getOriginalId() {
            return this.originalId;
        }

        /**
         * Get the group id of the node
         * @returns the group id of the node
         */

    }, {
        key: 'getGroupId',
        value: function getGroupId() {
            var groupId = null;

            if (this.group != null) {
                // get the id of the group which we will use as the id of the node
                groupId = this.group.id();
            }

            return groupId;
        }

        /**
         * Get the center x coordinate of the group
         */

    }, {
        key: 'cx',
        value: function cx() {
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

    }, {
        key: 'cy',
        value: function cy() {
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

    }, {
        key: 'connectorCX',
        value: function connectorCX() {
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

    }, {
        key: 'connectorCY',
        value: function connectorCY() {
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

    }, {
        key: 'isHighlighted',
        value: function isHighlighted(value) {

            if (value != null) {
                this.highlighted = value;
            }

            return this.highlighted;
        }

        /** 
         * Get the group
         * @returns the group
         */

    }, {
        key: 'getGroup',
        value: function getGroup() {
            return this.group;
        }

        /**
         * Show the delete button group
         */

    }, {
        key: 'showDeleteButton',
        value: function showDeleteButton() {
            this.deleteButtonGroup.show();
        }

        /**
         * Hide the delete button group
         */

    }, {
        key: 'hideDeleteButton',
        value: function hideDeleteButton() {
            this.deleteButtonGroup.hide();
        }

        /**
         * Show the border of the node
         */

    }, {
        key: 'showBorder',
        value: function showBorder() {
            this.border.show();
        }

        /**
         * Hide the border of the node
         */

    }, {
        key: 'hideBorder',
        value: function hideBorder() {
            this.border.hide();
        }

        /**
         * Get the connector of the node
         */

    }, {
        key: 'getConnector',
        value: function getConnector() {
            return this.connector;
        }

        /**
         * Get the id of the connector
         */

    }, {
        key: 'getConnectorId',
        value: function getConnectorId() {
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

    }, {
        key: 'getGroupX',
        value: function getGroupX() {

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

    }, {
        key: 'getGroupY',
        value: function getGroupY() {
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

    }, {
        key: 'getImageX',
        value: function getImageX() {

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

    }, {
        key: 'getImageY',
        value: function getImageY() {

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

    }, {
        key: 'getImageWidth',
        value: function getImageWidth() {
            var width = 0;

            if (this.image != null) {
                width = this.image.width();
            }

            return width;
        }

        /**
         * Get the height of the image
         * @returns the height of the image
         */

    }, {
        key: 'getImageHeight',
        value: function getImageHeight() {
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

    }, {
        key: 'setNodeMouseOver',
        value: function setNodeMouseOver(nodeMouseOverFunction) {

            if (this.group != null) {
                this.group.mouseover(nodeMouseOverFunction);
            }
        }

        /**
         * Set the mouseout listener for the group
         * @param nodeMouseOutFunction the function to call when the mouse moves
         * out of the group
         */

    }, {
        key: 'setNodeMouseOut',
        value: function setNodeMouseOut(nodeMouseOutFunction) {

            if (this.group != null) {
                this.group.mouseout(nodeMouseOutFunction);
            }
        }

        /**
         * Set the mousedown listener for the group
         * @param nodeMouseDownFunction the function to call when the mouse is 
         * down on the group
         */

    }, {
        key: 'setNodeMouseDown',
        value: function setNodeMouseDown(nodeMouseDownFunction) {

            if (this.group != null) {
                this.group.mousedown(nodeMouseDownFunction);
            }
        }

        /**
         * Set the mouseup listener for the group
         * @param nodeMouseUpFunction the function to call when the mouse is 
         * released over the group
         */

    }, {
        key: 'setNodeMouseUp',
        value: function setNodeMouseUp(nodeMouseUpFunction) {

            if (this.group != null) {
                this.group.mouseup(nodeMouseUpFunction);
            }
        }

        /**
         * Set the click listener for the image
         * @param nodeMouseClickFunction the function to call when the image is
         * clicked
         */

    }, {
        key: 'setNodeMouseClick',
        value: function setNodeMouseClick(nodeMouseClickFunction) {

            if (this.group != null) {
                this.image.click(nodeMouseClickFunction);
            }
        }

        /**
         * Set the mousedown listener for the connector
         * @param connectorMouseDownFunction the function to call when the mouse
         * is down on the connector
         */

    }, {
        key: 'setConnectorMouseDown',
        value: function setConnectorMouseDown(connectorMouseDownFunction) {

            if (this.connector != null) {
                this.connector.mousedown(connectorMouseDownFunction);
            }
        }

        /**
         * Set the mousedown listener for the delete button
         * @param deleteButtonMouseDownFunction the function to call when the mouse
         * is down on the delete button
         */

    }, {
        key: 'setDeleteButtonMouseDown',
        value: function setDeleteButtonMouseDown(deleteButtonMouseDownFunction) {

            if (this.deleteButtonCircle != null) {
                this.deleteButtonCircle.mousedown(deleteButtonMouseDownFunction);
            }
        }

        /**
         * Set the mouseover listener for the delete button
         * @param deleteButtonMouseOverFunction the function to call when the mouse
         * is over the delete button
         */

    }, {
        key: 'setDeleteButtonMouseOver',
        value: function setDeleteButtonMouseOver(deleteButtonMouseOverFunction) {

            if (this.deleteButtonCircle != null) {
                this.deleteButtonCircle.mouseover(deleteButtonMouseOverFunction);
            }
        }

        /**
         * Set the mouseout listener for the delete button
         * @param deleteButtonMouseOutFunction the function to call when the mouse
         * moves out of the delete button
         */

    }, {
        key: 'setDeleteButtonMouseOut',
        value: function setDeleteButtonMouseOut(deleteButtonMouseOutFunction) {

            if (this.deleteButtonCircle != null) {
                this.deleteButtonCircle.mouseout(deleteButtonMouseOutFunction);
            }
        }

        /**
         * Set the dragmove listener for the group
         * @param dragMoveFunction the function to call when the group is dragged
         */

    }, {
        key: 'setDragMove',
        value: function setDragMove(dragMoveFunction) {

            if (this.group != null) {

                // set a listener for when the node is dragged
                this.group.on('dragmove', dragMoveFunction);
            }
        }

        /**
         * Set the x position
         * @param x the x position
         */

    }, {
        key: 'setX',
        value: function setX(x) {
            this.x = x;
            this.group.x(x);
        }

        /**
         * Set the y position
         * @param y the y position
         */

    }, {
        key: 'setY',
        value: function setY(y) {
            this.y = y;
            this.group.y(y);
        }

        /**
         * Add an outgoing link to the node
         * @param outgoingLink a ConceptMapLink object
         */

    }, {
        key: 'addOutgoingLink',
        value: function addOutgoingLink(outgoingLink) {
            if (outgoingLink != null) {
                this.outgoingLinks.push(outgoingLink);
            }
        }

        /**
         * Remove an outgoing link from the node
         * @param outgoingLink a ConceptMapLink object
         */

    }, {
        key: 'removeOutgoingLink',
        value: function removeOutgoingLink(outgoingLink) {

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

    }, {
        key: 'getOutgoingLinks',
        value: function getOutgoingLinks() {
            return this.outgoingLinks;
        }

        /**
         * Add an incoming link to the node
         * @param incomingLink a ConceptMapLink object
         */

    }, {
        key: 'addIncomingLink',
        value: function addIncomingLink(incomingLink) {
            if (incomingLink != null) {
                this.incomingLinks.push(incomingLink);
            }
        }

        /**
         * Remove an incoming link from the node
         * @param incomingLink a ConceptMapLink object
         */

    }, {
        key: 'removeIncomingLink',
        value: function removeIncomingLink(incomingLink) {

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

    }, {
        key: 'getIncomingLinks',
        value: function getIncomingLinks() {
            return this.incomingLinks;
        }

        /**
         * The function that is called when the node is moved
         * @param event 
         */

    }, {
        key: 'dragMove',
        value: function dragMove(event) {

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

    }, {
        key: 'remove',
        value: function remove() {

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
    }]);

    return ConceptMapNode;
}();

/**
 * A ConceptMapLink that represents a link in the ConceptMap component
 */


var ConceptMapLink = function () {

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

    function ConceptMapLink(ConceptMapService, draw, id, originalId, sourceNode, destinationNode, label, color, curvature, startCurveUp, endCurveUp) {
        _classCallCheck(this, ConceptMapLink);

        // remember the ConceptMapService
        this.ConceptMapService = ConceptMapService;

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
        this.textPercentageLocationOnLink = 0.6;

        // remember the source node
        this.sourceNode = sourceNode;

        /*
         * used to remember the destination node later after the destination
         * node has been chosen
         */
        this.destinationNode = destinationNode;

        // remember the curvature
        this.curvature = curvature;

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


    _createClass(ConceptMapLink, [{
        key: 'toJSONObject',
        value: function toJSONObject() {
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
            jsonObject.destinationNodeOriginalId = this.destinationNode.getOriginalId();
            jsonObject.destinationNodeInstanceId = this.destinationNode.getId();

            return jsonObject;
        }

        /**
         * Get the id of the link
         * @returns the id of the link
         */

    }, {
        key: 'getId',
        value: function getId() {
            return this.id;
        }

        /**
         * Get the original id of the node
         * @returns the original id of the node
         */

    }, {
        key: 'getOriginalId',
        value: function getOriginalId() {
            return this.originalId;
        }

        /**
         * Get the id of the group
         * @returns the id of the group
         */

    }, {
        key: 'getGroupId',
        value: function getGroupId() {
            return this.group.id();
        }

        /**
         * Get the x1 value
         * @returns the x coordinate of the source of the link
         */

    }, {
        key: 'x1',
        value: function x1() {
            return this.path.attr('x1');
        }

        /**
         * Get the y1 value
         * @returns the y coordinate of the source of the link
         */

    }, {
        key: 'y1',
        value: function y1() {
            return this.path.attr('y1');
        }

        /**
         * Get the x2 value
         * @returns the x coordinate of the destination of the link
         */

    }, {
        key: 'x2',
        value: function x2() {
            return this.path.attr('x2');
        }

        /**
         * Get the y2 value
         * @returns the y coordinate of the destination of the link
         */

    }, {
        key: 'y2',
        value: function y2() {
            return this.path.attr('y2');
        }

        /**
         * Set the original id
         * @param originalId the original id
         */

    }, {
        key: 'setOriginalId',
        value: function setOriginalId(originalId) {
            this.originalId = originalId;
        }

        /**
         * Get the label
         * @returns the label
         */

    }, {
        key: 'getLabel',
        value: function getLabel() {
            return this.label;
        }

        /**
         * Getter/setter for the highlighted value
         * @param value (optional) the highlighted value
         * @returns whether the link is highlighted
         */

    }, {
        key: 'isHighlighted',
        value: function isHighlighted(value) {

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

    }, {
        key: 'updateCoordinates',
        value: function updateCoordinates(x1, y1, x2, y2, isDragging) {
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

    }, {
        key: 'calculateCurvedLine',
        value: function calculateCurvedLine(x1, y1, x2, y2, isDragging) {

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
            var arrowPathArraysObject = this.ConceptMapService.arrowPathArrays(startx, starty, endx, endy, startCurveUp, endCurveUp, len, angle, curvature, nodeRadius);

            return arrowPathArraysObject;
        }

        /**
         * Set the destination node
         * @param destinationNode the destination ConceptMapNode object
         */

    }, {
        key: 'setDestination',
        value: function setDestination(destinationNode) {

            if (destinationNode != null) {

                // get x and y of the tail
                var x1 = this.path.attr('x1');
                var y1 = this.path.attr('y1');

                // remember the destination node
                this.destinationNode = destinationNode;

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

    }, {
        key: 'getNearestPointToDestinationNode',
        value: function getNearestPointToDestinationNode(x, y) {

            // get the coordinates of the upper left corner of the image
            var rectMinX = this.destinationNode.getImageX();
            var rectMinY = this.destinationNode.getImageY();

            // get the width and height of the image
            var width = this.destinationNode.getImageWidth();
            var height = this.destinationNode.getImageHeight();

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

    }, {
        key: 'getNearestPointInPerimeter',
        value: function getNearestPointInPerimeter(l, t, w, h, x, y) {
            var r = l + w;
            var b = t + h;

            var x = this.clamp(x, l, r);
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

    }, {
        key: 'clamp',
        value: function clamp(x, lower, upper) {
            return Math.max(lower, Math.min(upper, x));
        }

        /**
         * Set the color of the link
         * @param color the color
         */

    }, {
        key: 'setColor',
        value: function setColor(color) {

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

    }, {
        key: 'setLabel',
        value: function setLabel(label) {

            if (label != null) {

                // remember the label
                this.label = label;

                // set the text into the text element
                this.text.text(label);

                // reset the width to adjust to the new text length
                var textBBox = this.text.node.getBBox();
                var width = textBBox.width;
                this.textRect.attr('width', width + 10);

                // recalculate the position of the svg text object
                var totalLength = this.path.node.getTotalLength();
                var midPoint = this.path.node.getPointAtLength(totalLength * this.textPercentageLocationOnLink);
                this.textGroup.cx(midPoint.x);
                this.textGroup.cy(midPoint.y);

                // show the text group now that it has a label
                this.showTextGroup();
            }
        }

        /**
         * Connect a link the its source and destination nodes
         */

    }, {
        key: 'connectLinkToNodes',
        value: function connectLinkToNodes() {

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

    }, {
        key: 'createDeleteButtonGroup',
        value: function createDeleteButtonGroup() {
            var _this2 = this;

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
            this.invisibleCircle.fill({ opacity: 0.0 });

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
            var topY = deleteButtonMidpointY - deleteButtonRadius * 0.7;

            // get the coordinates of the bottom of the +
            var bottomX = deleteButtonMidpointX;
            var bottomY = deleteButtonMidpointY + deleteButtonRadius * 0.7;

            // get the coordinates of the left of the +
            var leftX = deleteButtonMidpointX - deleteButtonRadius * 0.7;
            var leftY = deleteButtonMidpointY;

            // get the coordinates of the right of the +
            var rightX = deleteButtonMidpointX + deleteButtonRadius * 0.7;
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
            this.deleteButtonGroup.mouseover(function (event) {
                _this2.deleteButtonGroupMouseOver(event);
            });

            // set the listener for when the mouse moves out of the group
            this.deleteButtonGroup.mouseout(function (event) {
                _this2.deleteButtonGroupMouseOut(event);
            });

            // add the delete button group to the link group
            this.group.add(this.deleteButtonGroup);
        }

        /**
         * Called when the mouse is over the delete button group
         * @param event the mouseover event
         */

    }, {
        key: 'deleteButtonGroupMouseOver',
        value: function deleteButtonGroupMouseOver(event) {
            // show the delete button
            this.showDeleteButton();
        }

        /**
         * Called when the mouse leaves the delete button group
         * @param event the mouseout event
         */

    }, {
        key: 'deleteButtonGroupMouseOut',
        value: function deleteButtonGroupMouseOut(event) {
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

    }, {
        key: 'setDeleteButtonClicked',
        value: function setDeleteButtonClicked(deleteButtonClickedFunction) {
            // listen for the click event on the delete button to call the function
            this.deleteButton.click(deleteButtonClickedFunction);
        }

        /**
         * Called when the mouse is clicked down on the group
         * @param linkMouseDownFunction the function to call when the mouse is
         * clicked down on the group
         */

    }, {
        key: 'setLinkMouseDown',
        value: function setLinkMouseDown(linkMouseDownFunction) {
            if (this.group != null) {
                /*
                 * listen for the mousedown event on the group to call
                 * the function
                 */
                this.group.mousedown(linkMouseDownFunction);
            }
        }

        /**
         * Called when the mouse is over the group
         * @param linkMouseOverFunction the function to call when the mouse is over
         * the group
         */

    }, {
        key: 'setLinkMouseOver',
        value: function setLinkMouseOver(linkMouseOverFunction) {
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

    }, {
        key: 'setLinkMouseOut',
        value: function setLinkMouseOut(linkMouseOutFunction) {
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

    }, {
        key: 'getDeleteButtonLocation',
        value: function getDeleteButtonLocation() {
            //var line = raphaelObject.items[2];

            var line = this.path.node;
            var distanceAlongLine = 35;
            var distanceAlongNormal = 18;
            var len, p1, p2, scale, dx, dy, x, y, occluded;

            /*
            var link = this.get('content');
            if (!link.isComplete()) return;
            if (line.attr('path').length < 1) return;     // this can happen after our content is destroyed
            */

            len = line.getTotalLength();
            p2 = line.getPointAtLength(len);

            if (len > 50) {
                p1 = line.getPointAtLength(len - distanceAlongLine);

                dx = p2.x - p1.x;
                dy = p2.y - p1.y;
                scale = distanceAlongNormal / distanceAlongLine * (dx > 0 ? 1 : -1);

                x = p1.x + scale * dy;
                y = p1.y - scale * dx;
                //occluded = NO;
            } else {
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

    }, {
        key: 'showDeleteButton',
        value: function showDeleteButton() {
            if (this.deleteButtonGroup != null) {
                this.deleteButtonGroup.show();
            }
        }

        /**
         * Hide the delete button
         */

    }, {
        key: 'hideDeleteButton',
        value: function hideDeleteButton() {
            if (this.deleteButtonGroup != null) {
                this.deleteButtonGroup.hide();
            }
        }

        /**
         * Create the text group
         */

    }, {
        key: 'createTextGroup',
        value: function createTextGroup() {

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
            this.text = this.draw.text("");
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

            // get the bounding box around the text element
            var textBBox = this.text.node.getBBox();

            /*
             * set the width of the rectangle to be a little larger than the width
             * of the text element
             */
            var width = textBBox.width;
            this.textRect.attr('width', width + 10);

            // add the rectangle and text to the group
            this.textGroup.add(this.textRect);
            this.textGroup.add(this.text);

            // set the location of the text to be somewhere along the line of the link
            var totalLength = this.path.node.getTotalLength();
            var midPoint = this.path.node.getPointAtLength(totalLength * this.textPercentageLocationOnLink);
            this.textGroup.cx(midPoint.x);
            this.textGroup.cy(midPoint.y);

            // add the text group to the link group
            this.group.add(this.textGroup);

            // hide the text group until the student has chosen a link type
            this.textGroup.hide();
        }

        /**
         * Show the text group
         */

    }, {
        key: 'showTextGroup',
        value: function showTextGroup() {

            if (this.textGroup != null) {
                this.textGroup.show();
            }
        }

        /**
         * Hide the text group
         */

    }, {
        key: 'hideTextGroup',
        value: function hideTextGroup() {

            if (this.textGroup != null) {
                this.textGroup.hide();
            }
        }

        /**
         * Remove all the references to the link and also remove all the elements
         * from the svg
         */

    }, {
        key: 'remove',
        value: function remove() {

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
    }]);

    return ConceptMapLink;
}();

ConceptMapService.$inject = ['StudentDataService', 'UtilService'];

exports.default = ConceptMapService;
//# sourceMappingURL=conceptMapService.js.map