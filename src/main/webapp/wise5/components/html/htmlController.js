'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HTMLController = function () {
    function HTMLController($rootScope, $scope, $state, $stateParams, $sce, $filter, $mdDialog, ConfigService, NodeService, ProjectService, StudentDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, HTMLController);

        this.$rootScope = $rootScope;
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

        // the summernote prompt element id
        this.summernotePromptId = '';

        // the summernote prompt html
        this.summernotePromptHTML = '';

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

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            if (this.mode === 'authoring') {
                var thisController = this;

                // the tooltip text for the the WISE Link authoring button
                var insertWISELinkString = this.$translate('html.insertWISELink');

                /*
                 * create the custom button for inserting a WISE Link into
                 * summernote
                 */
                var InsertWISELinkButton = this.UtilService.createInsertWISELinkButton(this, this.nodeId, this.componentId, 'prompt', insertWISELinkString);

                // the tooltip text for the insert WISE asset button
                var insertAssetString = this.$translate('html.insertAsset');

                /*
                 * create the custom button for inserting WISE assets into
                 * summernote
                 */
                var InsertAssetButton = this.UtilService.createInsertAssetButton(this, this.nodeId, this.componentId, 'prompt', insertAssetString);

                /*
                 * the options that specifies the tools to display in the
                 * summernote prompt
                 */
                this.summernotePromptOptions = {
                    toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertWISELinkButton', 'insertAssetButton']]],
                    height: 300,
                    disableDragAndDrop: true,
                    buttons: {
                        insertWISELinkButton: InsertWISELinkButton,
                        insertAssetButton: InsertAssetButton
                    }
                };

                // get the id of the summernote prompt element
                this.summernotePromptId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;

                // replace all <wiselink> elements with <a> or <button> elements
                this.summernotePromptHTML = this.UtilService.replaceWISELinks(this.componentContent.html);

                // generate the summernote rubric element id
                this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;

                // set the component rubric into the summernote rubric
                this.summernoteRubricHTML = this.componentContent.rubric;

                // the tooltip text for the insert WISE asset button
                var insertAssetString = this.$translate('html.insertAsset');

                /*
                 * create the custom button for inserting WISE assets into
                 * summernote
                 */
                var InsertAssetButton = this.UtilService.createInsertAssetButton(this, this.nodeId, this.componentId, 'rubric', insertAssetString);

                /*
                 * the options that specifies the tools to display in the
                 * summernote prompt
                 */
                this.summernoteRubricOptions = {
                    toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
                    height: 300,
                    disableDragAndDrop: true,
                    buttons: {
                        insertAssetButton: InsertAssetButton
                    }
                };

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

                            var summernoteId = '';

                            if (args.target == 'prompt') {
                                // the target is the summernote prompt element
                                summernoteId = 'summernotePrompt_' + _this.nodeId + '_' + _this.componentId;
                            } else if (args.target == 'rubric') {
                                // the target is the summernote rubric element
                                summernoteId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;
                            }

                            if (summernoteId != '') {
                                if (_this.UtilService.isImage(fileName)) {
                                    /*
                                     * move the cursor back to its position when the asset chooser
                                     * popup was clicked
                                     */
                                    $('#' + summernoteId).summernote('editor.restoreRange');
                                    $('#' + summernoteId).summernote('editor.focus');

                                    // add the image html
                                    $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                                } else if (_this.UtilService.isVideo(fileName)) {
                                    /*
                                     * move the cursor back to its position when the asset chooser
                                     * popup was clicked
                                     */
                                    $('#' + summernoteId).summernote('editor.restoreRange');
                                    $('#' + summernoteId).summernote('editor.focus');

                                    // insert the video element
                                    var videoElement = document.createElement('video');
                                    videoElement.controls = 'true';
                                    videoElement.innerHTML = "<source ng-src='" + fullAssetPath + "' type='video/mp4'>";
                                    $('#' + summernoteId).summernote('insertNode', videoElement);
                                }
                            }
                        }
                    }
                }
            }

            // close the popup
            _this.$mdDialog.hide();
        });

        /*
         * Listen for the createWISELink event so that we can insert a WISE Link
         * in the summernote rich text editor
         */
        this.$scope.$on('createWISELink', function (event, args) {
            if (args != null) {

                // make sure the event was fired for this component
                if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {

                    // get the WISE Link parameters
                    var wiseLinkNodeId = args.wiseLinkNodeId;
                    var wiseLinkType = args.wiseLinkType;
                    var wiseLinkText = args.wiseLinkText;
                    var wiseLinkClass = args.wiseLinkClass;
                    var target = args.target;

                    var wiseLinkElement = null;

                    if (wiseLinkType == 'link') {
                        // we are creating a link
                        wiseLinkElement = document.createElement('a');
                        wiseLinkElement.innerHTML = wiseLinkText;
                        wiseLinkElement.setAttribute('wiselink', true);
                        wiseLinkElement.setAttribute('node-id', wiseLinkNodeId);
                        wiseLinkElement.setAttribute('type', wiseLinkType);
                        wiseLinkElement.setAttribute('link-text', wiseLinkText);
                    } else if (wiseLinkType == 'button') {
                        // we are creating a button
                        wiseLinkElement = document.createElement('button');
                        wiseLinkElement.innerHTML = wiseLinkText;
                        wiseLinkElement.setAttribute('wiselink', true);
                        wiseLinkElement.setAttribute('node-id', wiseLinkNodeId);
                        wiseLinkElement.setAttribute('type', wiseLinkType);
                        wiseLinkElement.setAttribute('link-text', wiseLinkText);
                    }

                    var summernoteId = '';

                    if (target == 'prompt') {
                        // get the id for the summernote prompt
                        summernoteId = 'summernotePrompt_' + _this.nodeId + '_' + _this.componentId;
                    }

                    if (summernoteId != '') {
                        /*
                         * move the cursor back to its position when the asset chooser
                         * popup was clicked so that the element gets inserted in the
                         * correct location
                         */
                        $('#' + summernoteId).summernote('editor.restoreRange');
                        $('#' + summernoteId).summernote('editor.focus');

                        if (wiseLinkElement != null) {
                            // insert the element
                            $('#' + summernoteId).summernote('insertNode', wiseLinkElement);

                            // add a new line after the element we have just inserted
                            var br = document.createElement('br');
                            $('#' + summernoteId).summernote('insertNode', br);
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
         * The summernote prompt html has changed so we will update the authoring
         * component content
         */

    }, {
        key: 'summernotePromptHTMLChanged',
        value: function summernotePromptHTMLChanged() {

            // get the summernote prompt html
            var html = this.summernotePromptHTML;

            /*
             * remove the absolute asset paths
             * e.g.
             * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
             * will be changed to
             * <img src='sun.png'/>
             */
            html = this.ConfigService.removeAbsoluteAssetPaths(html);

            /*
             * replace <a> and <button> elements with <wiselink> elements when
             * applicable
             */
            html = this.UtilService.insertWISELinks(html);

            // update the authoring component content
            this.authoringComponentContent.html = html;

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }

        /**
         * The author has changed the rubric
         */

    }, {
        key: 'summernoteRubricHTMLChanged',
        value: function summernoteRubricHTMLChanged() {

            // get the summernote rubric html
            var html = this.summernoteRubricHTML;

            /*
             * remove the absolute asset paths
             * e.g.
             * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
             * will be changed to
             * <img src='sun.png'/>
             */
            html = this.ConfigService.removeAbsoluteAssetPaths(html);

            /*
             * replace <a> and <button> elements with <wiselink> elements when
             * applicable
             */
            html = this.UtilService.insertWISELinks(html);

            // update the component rubric
            this.authoringComponentContent.rubric = html;

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }
    }]);

    return HTMLController;
}();

HTMLController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$sce', '$filter', '$mdDialog', 'ConfigService', 'NodeService', 'ProjectService', 'StudentDataService', 'UtilService'];

exports.default = HTMLController;
//# sourceMappingURL=htmlController.js.map