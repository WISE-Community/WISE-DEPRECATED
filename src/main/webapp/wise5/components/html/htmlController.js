'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HTMLController = function () {
    function HTMLController($scope, $state, $stateParams, $sce, ConfigService, NodeService, ProjectService, StudentDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, HTMLController);

        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$sce = $sce;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the authoring component content
        this.authoringComponentContent = null;

        // whether this part is showing previous work
        this.isShowPreviousWork = false;

        this.mode = $scope.mode;

        // perform setup of this component

        // get the current node and node id
        var currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        } else {
            this.nodeId = $scope.nodeId;
        }

        // get the component content from the scope
        this.componentContent = this.$scope.componentContent;

        // get the authoring component content
        this.authoringComponentContent = this.$scope.authoringComponentContent;
        this.authoringComponentContentJSONString = this.$scope.authoringComponentContentJSONString;

        /*
         * get the original component content. this is used when showing
         * previous work from another component.
         */
        this.originalComponentContent = this.$scope.originalComponentContent;

        this.mode = $scope.mode;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            if (this.mode === 'authoring') {} else if (this.mode === 'grading') {
                /*
                 * do not display the html in the grading tool. we may want to
                 * change this in the future to allow the teacher to toggle
                 * seeing the html on and off.
                 */
                this.componentContent.html = '';
            } else if (this.mode === 'student') {
                if (this.componentContent != null) {
                    this.html = this.componentContent.html;
                }

                if ($scope.$parent.registerComponentController != null) {
                    // register this component with the parent node
                    $scope.$parent.registerComponentController($scope, this.componentContent);
                }
            }
        }

        /*
         * Listen for the requestImage event which is fired when something needs
         * an image representation of the student data from a specific
         * component.
         */
        this.$scope.$on('requestImage', function (event, args) {
            // get the node id and component id from the args
            var nodeId = args.nodeId;
            var componentId = args.componentId;

            // check if the image is being requested from this component
            if (_this.nodeId === nodeId && _this.componentId === componentId) {

                // obtain the image objects
                var imageObjects = _this.getImageObjects();

                if (imageObjects != null) {
                    var args = {};
                    args.nodeId = nodeId;
                    args.componentId = componentId;
                    args.imageObjects = imageObjects;

                    // fire an event that contains the image objects
                    _this.$scope.$emit('requestImageCallback', args);
                }
            }
        });
    }

    /**
     * The component has changed in the regular authoring view so we will save the project
     */


    _createClass(HTMLController, [{
        key: 'authoringViewComponentChanged',
        value: function authoringViewComponentChanged() {

            // update the JSON string in the advanced authoring view textarea
            this.updateAdvancedAuthoringView();
        }
    }, {
        key: 'updateAdvancedAuthoringView',


        /**
         * Update the component JSON string that will be displayed in the advanced authoring view textarea
         */
        value: function updateAdvancedAuthoringView() {
            this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
            this.advancedAuthoringViewComponentChanged();
        }
    }, {
        key: 'advancedAuthoringViewComponentChanged',


        /**
         * The component has changed in the advanced authoring view so we will update
         * the component and save the project.
         */
        value: function advancedAuthoringViewComponentChanged() {

            try {
                /*
                 * create a new component by converting the JSON string in the advanced
                 * authoring view into a JSON object
                 */
                var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

                // replace the component in the project
                this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

                // set the new component into the controller
                this.componentContent = editedComponentContent;

                /*
                 * notify the parent node that the content has changed which will save
                 * the project to the server
                 */
                this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
            } catch (e) {}
        }
    }, {
        key: 'getImageObjects',


        /**
         * Get the image object representation of the student data
         * @returns an image object
         */
        value: function getImageObjects() {
            var imageObjects = [];

            // get the image elements in the scope
            var componentId = this.componentId;
            var imageElements = angular.element('#' + componentId + ' img');

            if (imageElements != null) {

                // loop through all the image elements
                for (var i = 0; i < imageElements.length; i++) {
                    var imageElement = imageElements[i];

                    if (imageElement != null) {

                        // create an image object
                        var imageObject = this.UtilService.getImageObjectFromImageElement(imageElement);
                        imageObjects.push(imageObject);
                    }
                }
            }

            return imageObjects;
        }
    }]);

    return HTMLController;
}();

HTMLController.$inject = ['$scope', '$state', '$stateParams', '$sce', 'ConfigService', 'NodeService', 'ProjectService', 'StudentDataService', 'UtilService'];

exports.default = HTMLController;
//# sourceMappingURL=htmlController.js.map