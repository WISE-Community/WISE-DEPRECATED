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

        // the tooltip text for the the WISE Link authoring button
        var insertWISELinkString = this.$translate('html.insertWISELink');

        // a custom button that opens the WISE Link authoring popup
        var InsertWISELinkButton = function InsertWISELinkButton(context) {
            var ui = $.summernote.ui;

            // create button
            var button = ui.button({
                contents: '<i class="note-icon-link"></i>',
                tooltip: insertWISELinkString,
                click: function click() {
                    // remember the position of the cursor
                    context.invoke('editor.saveRange');

                    // display the WISE Link authoring popup
                    thisController.displayWISELinkChooser();
                }
            });

            return button.render(); // return button as jquery object
        };

        // the tooltip text for the insert WISE asset button
        var insertAssetString = this.$translate('html.insertAsset');

        // a custom button that opens the asset chooser
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
            toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertWISELinkButton', 'insertAssetButton']]],
            height: 300,
            disableDragAndDrop: true,
            buttons: {
                insertWISELinkButton: InsertWISELinkButton,
                insertAssetButton: InsertAssetButton
            }
        };

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            if (this.mode === 'authoring') {
                // get the id of the summernote element
                this.summernoteId = 'summernote_' + this.nodeId + '_' + this.componentId;

                // replace all <wiselink> elements with <a> or <button> elements
                this.summernoteHTML = this.replaceWISELinks(this.componentContent.html);

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

                    /*
                     * move the cursor back to its position when the asset chooser
                     * popup was clicked so that the element gets inserted in the
                     * correct location
                     */
                    $('#summernote_' + _this.nodeId + '_' + _this.componentId).summernote('editor.restoreRange');
                    $('#summernote_' + _this.nodeId + '_' + _this.componentId).summernote('editor.focus');

                    if (wiseLinkElement != null) {
                        // insert the element
                        $('#summernote_' + _this.nodeId + '_' + _this.componentId).summernote('insertNode', wiseLinkElement);

                        // add a new line after the element we have just inserted
                        var br = document.createElement('br');
                        $('#summernote_' + _this.nodeId + '_' + _this.componentId).summernote('insertNode', br);
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
             * remove the absolute asset paths
             * e.g.
             * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
             * will be changed to
             * <img src='sun.png'/>
             */
            html = this.removeAbsoluteAssetPaths(html);

            /*
             * replace <a> and <button> elements with <wiselink> elements when
             * applicable
             */
            html = this.insertWISELinks(html);

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

        /**
         * Display the WISE Link authoring popup
         */

    }, {
        key: 'displayWISELinkChooser',
        value: function displayWISELinkChooser() {
            // create the params for opening the WISE Link authoring popup
            var stateParams = {};
            stateParams.popup = true;
            stateParams.nodeId = this.nodeId;
            stateParams.componentId = this.componentId;

            // open the WISE Link authoring popup
            this.$mdDialog.show({
                templateUrl: 'wise5/authoringTool/wiseLink/wiseLinkAuthoring.html',
                controller: 'WISELinkAuthoringController',
                controllerAs: 'wiseLinkAuthoringController',
                $stateParams: stateParams,
                clickOutsideToClose: true,
                escapeToClose: true
            });
        }

        /**
         * Remove the absolute asset paths
         * e.g.
         * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
         * will be changed to
         * <img src='sun.png'/>
         * @param html the html
         * @return the modified html without the absolute asset paths
         */

    }, {
        key: 'removeAbsoluteAssetPaths',
        value: function removeAbsoluteAssetPaths(html) {
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

            return html;
        }

        /**
         * Replace <a> and <button> elements with <wiselink> elements where
         * applicable
         * @param html the html
         * @return the modified html with <wiselink> elements
         */

    }, {
        key: 'insertWISELinks',
        value: function insertWISELinks(html) {

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

    }, {
        key: 'insertWISELinkAnchors',
        value: function insertWISELinkAnchors(html) {

            // find <a> elements with the parameter wiselink=true
            var wiseLinkRegEx = new RegExp(/<a.*?wiselink="true".*?>(.*?)<\/a>/);

            // find the first match
            var wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);

            // loop until we have replaced all the matches
            while (wiseLinkRegExMatchResult != null) {

                // get the whole <a> element
                var anchorHTML = wiseLinkRegExMatchResult[0];

                // get the inner html of the <a> element
                var anchorText = wiseLinkRegExMatchResult[1];

                // get the node id parameter of the <a> element
                var nodeId = this.getWISELinkNodeId(anchorHTML);

                if (nodeId == null) {
                    nodeId = '';
                }

                // create the <wiselink> element
                var wiselinkHtml = "<wiselink type='link' link-text='" + anchorText + "' node-id='" + nodeId + "'/>";

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

    }, {
        key: 'insertWISELinkButtons',
        value: function insertWISELinkButtons(html) {

            // find <button> elements with the parameter wiselink=true
            var wiseLinkRegEx = new RegExp(/<button.*?wiselink="true".*?>(.*?)<\/button>/);

            // find the first match
            var wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);

            // loop until we have replaced all the matches
            while (wiseLinkRegExMatchResult != null) {

                // get the whole <button> element
                var buttonHTML = wiseLinkRegExMatchResult[0];

                // get the inner html of the <button> element
                var buttonText = wiseLinkRegExMatchResult[1];

                // get the node id parameter of the <button> element
                var nodeId = this.getWISELinkNodeId(buttonHTML);

                if (nodeId == null) {
                    nodeId = '';
                }

                // create the <wiselink> element
                var wiselinkHtml = "<wiselink type='button' link-text='" + buttonText + "' node-id='" + nodeId + "'/>";

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

    }, {
        key: 'getWISELinkNodeId',
        value: function getWISELinkNodeId(html) {

            var nodeId = null;

            if (html != null) {
                // create the regex to find the node id parameter
                var nodeIdRegEx = new RegExp(/node-id=["'b](.*?)["']/, 'g');

                // try to find a match
                var nodeIdRegExResult = nodeIdRegEx.exec(html);

                if (nodeIdRegExResult != null) {
                    // we have found a node id
                    nodeId = nodeIdRegExResult[1];
                }
            }

            return nodeId;
        }

        /**
         * Get the link type from the wiselink element
         * e.g.
         * <wiselink type='button'/>
         * the type in this case is 'button'
         * @param html the html for the element
         * @return the link type from the type parameter in the element
         */

    }, {
        key: 'getWISELinkType',
        value: function getWISELinkType(html) {
            var type = null;

            if (html != null) {
                // create the regex to find the type
                var typeRegEx = new RegExp(/type=["'b](.*?)["']/, 'g');

                // try to find a match
                var typeRegExResult = typeRegEx.exec(html);

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

    }, {
        key: 'getWISELinkLinkText',
        value: function getWISELinkLinkText(html) {
            var linkText = null;

            if (html != null) {
                // create the regex to find the link text
                var linkTextRegEx = new RegExp(/link-text=["'b](.*?)["']/, 'g');

                // try to find a match
                var linkTextRegExResult = linkTextRegEx.exec(html);

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

    }, {
        key: 'replaceWISELinks',
        value: function replaceWISELinks(html) {

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

    }, {
        key: 'replaceWISELinksHelper',
        value: function replaceWISELinksHelper(html, regex) {

            // create the regex
            var wiseLinkRegEx = new RegExp(regex);

            // find the first match
            var wiseLinkRegExMatchResult = wiseLinkRegEx.exec(html);

            // loop until we have replaced all the matches
            while (wiseLinkRegExMatchResult != null) {

                /*
                 * get the whole match
                 * e.g. <wiselink type='link' node-id='node5' link-text='Go to here'/>
                 */
                var wiseLinkHTML = wiseLinkRegExMatchResult[0];

                // get the node id, type and link text from the match
                var nodeId = this.getWISELinkNodeId(wiseLinkHTML);
                var type = this.getWISELinkType(wiseLinkHTML);
                var linkText = this.getWISELinkLinkText(wiseLinkHTML);

                var newElement = null;

                if (type == 'link') {
                    // create a link that represents the wiselink
                    newElement = "<a wiselink='true' node-id='" + nodeId + "'>" + linkText + "</a>";
                } else if (type == 'button') {
                    // create a button that represents the wiselink
                    newElement = "<button wiselink='true' node-id='" + nodeId + "'>" + linkText + "</button>";
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
    }]);

    return HTMLController;
}();

HTMLController.$inject = ['$scope', '$state', '$stateParams', '$sce', '$filter', '$mdDialog', 'ConfigService', 'NodeService', 'ProjectService', 'StudentDataService', 'UtilService'];

exports.default = HTMLController;
//# sourceMappingURL=htmlController.js.map