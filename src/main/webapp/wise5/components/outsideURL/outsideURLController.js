"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OutsideURLController = function () {
    function OutsideURLController($q, $scope, $sce, NodeService, OutsideURLService, ProjectService, StudentDataService) {
        var _this = this;

        _classCallCheck(this, OutsideURLController);

        this.$q = $q;
        this.$scope = $scope;
        this.$sce = $sce;
        this.NodeService = NodeService;
        this.OutsideURLService = OutsideURLService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the authoring component content
        this.authoringComponentContent = null;

        // the url to the web page to display
        this.url = null;

        // the max width of the iframe
        this.maxWidth = null;

        // the max height of the iframe
        this.maxHeight = null;

        // get the current node and node id
        var currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        } else {
            this.nodeId = this.$scope.nodeId;
        }

        // get the component content from the scope
        this.componentContent = this.$scope.componentContent;

        // get the authoring component content
        this.authoringComponentContent = this.$scope.authoringComponentContent;

        /*
         * get the original component content. this is used when showing
         * previous work from another component.
         */
        this.originalComponentContent = this.$scope.originalComponentContent;

        this.mode = this.$scope.mode;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            if (this.mode === 'authoring') {
                this.updateAdvancedAuthoringView();

                $scope.$watch(function () {
                    return _this.authoringComponentContent;
                }, function (newValue, oldValue) {
                    _this.componentContent = _this.ProjectService.injectAssetPaths(newValue);

                    // set the url
                    _this.setURL(_this.authoringComponentContent.url);
                }, true);
            }

            if (this.componentContent != null) {
                // set the url
                this.setURL(this.componentContent.url);
            }

            // get the max width
            this.maxWidth = this.componentContent.maxWidth ? this.componentContent.maxWidth : "none";

            // get the max height
            this.maxHeight = this.componentContent.maxHeight ? this.componentContent.maxHeight : "none";

            if (this.$scope.$parent.nodeController != null) {
                // register this component with the parent node
                this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
            }
        }

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a promise of a component state containing the student data
         */
        this.$scope.getComponentState = function () {
            var deferred = this.$q.defer();

            /*
             * the student does not have any unsaved changes in this component
             * so we don't need to save a component state for this component.
             * we will immediately resolve the promise here.
             */
            deferred.resolve();

            return deferred.promise;
        }.bind(this);
    }

    /**
     * Set the url
     * @param url the url
     */


    _createClass(OutsideURLController, [{
        key: "setURL",
        value: function setURL(url) {
            if (url != null) {
                var trustedURL = this.$sce.trustAsResourceUrl(url);
                this.url = trustedURL;
            }
        }
    }, {
        key: "authoringViewComponentChanged",


        /**
         * The component has changed in the regular authoring view so we will save the project
         */
        value: function authoringViewComponentChanged() {

            // set the url
            //this.setURL(this.authoringComponentContent.url);

            // update the JSON string in the advanced authoring view textarea
            this.updateAdvancedAuthoringView();

            /*
             * notify the parent node that the content has changed which will save
             * the project to the server
             */
            this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
        }
    }, {
        key: "advancedAuthoringViewComponentChanged",


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
                var authoringComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

                // replace the component in the project
                this.ProjectService.replaceComponent(this.nodeId, this.componentId, authoringComponentContent);

                // set the new authoring component content
                this.authoringComponentContent = authoringComponentContent;

                // set the component content
                this.componentContent = this.ProjectService.injectAssetPaths(authoringComponentContent);

                /*
                 * notify the parent node that the content has changed which will save
                 * the project to the server
                 */
                this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
            } catch (e) {
                this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
            }
        }
    }, {
        key: "updateAdvancedAuthoringView",


        /**
         * Update the component JSON string that will be displayed in the advanced authoring view textarea
         */
        value: function updateAdvancedAuthoringView() {
            this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
        }
    }, {
        key: "registerExitListener",


        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */
        value: function registerExitListener() {

            /*
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before the VLE exits.
             */
            this.exitListener = this.$scope.$on('exit', function (event, args) {});
        }
    }]);

    return OutsideURLController;
}();

OutsideURLController.$inject = ['$q', '$scope', '$sce', 'NodeService', 'OutsideURLService', 'ProjectService', 'StudentDataService'];

exports.default = OutsideURLController;
//# sourceMappingURL=outsideURLController.js.map