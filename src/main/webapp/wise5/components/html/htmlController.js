'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HTMLController = function () {
    function HTMLController($scope, $state, $stateParams, $sce, $filter, $mdDialog, ConfigService, NodeService, ProjectService, StudentDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, HTMLController);

        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$sce = $sce;
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;

        this.$translate = this.$filter('translate');

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

        // whether the advanced authoring textarea is displayed
        this.showAdvancedAuthoring = false;

        // the summernote element id
        this.summernoteId = '';

        // the summernote html
        this.summernoteHTML = '';

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

        /*
         * get the original component content. this is used when showing
         * previous work from another component.
         */
        this.originalComponentContent = this.$scope.originalComponentContent;

        this.mode = $scope.mode;

        var thisController = this;
        var insertAssetString = this.$translate('html.insertAsset');

        // A custom button that opens the asset chooser
        var InsertAssetButton = function InsertAssetButton(context) {
            var ui = $.summernote.ui;

            // create button
            var button = ui.button({
                contents: '<i class="note-icon-picture"></i>',
                tooltip: insertAssetString,
                click: function click() {
                    // remember the position of the cursor
                    context.invoke('editor.saveRange');

                    // display the asset chooser popup
                    thisController.displayAssetChooser();
                }
            });

            return button.render(); // return button as jquery object
        };

        // the options that specifies the tools to display in summernote
        this.summernoteOptions = {
            toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
            disableDragAndDrop: true,
            buttons: {
                insertAssetButton: InsertAssetButton
            }
        };

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            if (this.mode === 'authoring') {
                this.summernoteId = 'summernote_' + this.nodeId + '_' + this.componentId;
                this.summernoteHTML = this.componentContent.html;
                this.updateAdvancedAuthoringView();

                $scope.$watch(function () {
                    return this.authoringComponentContent;
                }.bind(this), function (newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
                }.bind(this), true);
            } else if (this.mode === 'grading') {
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

        /*
         * Listen for the assetSelected event which occurs when the user
         * selects an asset from the choose asset popup
         */
        this.$scope.$on('assetSelected', function (event, args) {

            if (args != null) {

                // make sure the event was fired for this component
                if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {
                    // the asset was selected for this component
                    var assetItem = args.assetItem;

                    if (assetItem != null) {
                        var fileName = assetItem.fileName;

                        if (fileName != null) {
                            /*
                             * get the assets directory path
                             * e.g.
                             * /wise/curriculum/3/
                             */
                            var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
                            var fullAssetPath = assetsDirectoryPath + '/' + fileName;

                            if (_this.UtilService.isImage(fileName)) {
                                /*
                                 * move the cursor back to its position when the asset chooser
                                 * popup was clicked
                                 */
                                $('#summernote_' + _this.nodeId + '_' + _this.componentId).summernote('editor.restoreRange');
                                $('#summernote_' + _this.nodeId + '_' + _this.componentId).summernote('editor.focus');

                                // add the image html
                                $('#summernote_' + _this.nodeId + '_' + _this.componentId).summernote('insertImage', fullAssetPath, fileName);
                            } else if (_this.UtilService.isVideo(fileName)) {
                                /*
                                 * move the cursor back to its position when the asset chooser
                                 * popup was clicked
                                 */
                                $('#summernote_' + _this.nodeId + '_' + _this.componentId).summernote('editor.restoreRange');
                                $('#summernote_' + _this.nodeId + '_' + _this.componentId).summernote('editor.focus');

                                // add the image html
                                //$('#summernote_' + this.nodeId + '_' + this.componentId).summernote('insertImage', assetsDirectoryPath + '/' + fileName, fileName);

                                var videoElement = document.createElement('video');
                                videoElement.controls = 'true';
                                videoElement.innerHTML = "<source ng-src='" + fullAssetPath + "' type='video/mp4'>";
                                $('#summernote_' + _this.nodeId + '_' + _this.componentId).summernote('insertNode', videoElement);
                            }
                        }
                    }
                }
            }

            // close the popup
            _this.$mdDialog.hide();
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

            /*
             * notify the parent node that the content has changed which will save
             * the project to the server
             */
            this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
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
            } catch (e) {
                this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
            }
        }
    }, {
        key: 'updateAdvancedAuthoringView',


        /**
         * Update the component JSON string that will be displayed in the advanced authoring view textarea
         */
        value: function updateAdvancedAuthoringView() {
            this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
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

        /**
         * The summernote html has changed so we will update the authoring component
         * content
         */

    }, {
        key: 'summernoteHTMLChanged',
        value: function summernoteHTMLChanged() {

            // get the summernote html
            var html = this.summernoteHTML;

            /*
             * get the assets directory path with the host
             * e.g.
             * https://wise.berkeley.edu/wise/curriculum/3/assets/
             */
            var includeHost = true;
            var assetsDirectoryPathIncludingHost = this.ConfigService.getProjectAssetsDirectoryPath(includeHost);
            var assetsDirectoryPathIncludingHostRegEx = new RegExp(assetsDirectoryPathIncludingHost, 'g');

            /*
             * get the assets directory path without the host
             * e.g.
             * /wise/curriculum/3/assets/
             */
            var assetsDirectoryPathNotIncludingHost = this.ConfigService.getProjectAssetsDirectoryPath() + '/';
            var assetsDirectoryPathNotIncludingHostRegEx = new RegExp(assetsDirectoryPathNotIncludingHost, 'g');

            /*
             * remove the directory path from the html so that only the file name
             * remains in asset references
             * e.g.
             * <img src='https://wise.berkeley.edu/wise/curriculum/3/assets/sun.png'/>
             * will be changed to
             * <img src='sun.png'/>
             */
            html = html.replace(assetsDirectoryPathIncludingHostRegEx, '');
            html = html.replace(assetsDirectoryPathNotIncludingHostRegEx, '');

            // update the authorg component content
            this.authoringComponentContent.html = html;

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }

        /**
         * Display the asset chooser
         */

    }, {
        key: 'displayAssetChooser',
        value: function displayAssetChooser() {

            // create the params for opening the asset chooser
            var stateParams = {};
            stateParams.popup = true;
            stateParams.nodeId = this.nodeId;
            stateParams.componentId = this.componentId;

            // open the dialog that will display the assets for the user to choose
            this.$mdDialog.show({
                templateUrl: 'wise5/authoringTool/asset/asset.html',
                controller: 'ProjectAssetController',
                controllerAs: 'projectAssetController',
                $stateParams: stateParams,
                clickOutsideToClose: true,
                escapeToClose: true
            });
        }
    }]);

    return HTMLController;
}();

HTMLController.$inject = ['$scope', '$state', '$stateParams', '$sce', '$filter', '$mdDialog', 'ConfigService', 'NodeService', 'ProjectService', 'StudentDataService', 'UtilService'];

exports.default = HTMLController;
//# sourceMappingURL=htmlController.js.map