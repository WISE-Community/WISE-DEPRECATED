'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookItemReportController = function () {
    function NotebookItemReportController($injector, $mdDialog, $rootScope, $scope, $translate, ConfigService, NotebookService, ProjectService, StudentAssetService, StudentDataService) {
        var _this = this;

        _classCallCheck(this, NotebookItemReportController);

        this.$injector = $injector;
        this.$mdDialog = $mdDialog;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;
        this.mode = this.ConfigService.getMode();

        this.dirty = false;

        this.autoSaveInterval = 60000; // the auto save interval in milliseconds

        this.saveMessage = {
            text: '',
            time: ''
        };

        this.reportItem = this.NotebookService.getLatestNotebookReportItemByReportId(this.reportId);
        if (this.reportItem) {
            var serverSaveTime = this.reportItem.serverSaveTime;
            var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
            this.setSaveMessage('Last saved', clientSaveTime);
        } else {
            // Student doesn't have work for this report yet, so we'll use the template.
            this.reportItem = this.NotebookService.getTemplateReportItemByReportId(this.reportId);
            if (this.reportItem == null) {
                // if there is no template, don't allow student to work on the report.
                return;
            } else {}
        }
        this.reportItem.id = null; // set the id to null so it can be inserted as initial version, as opposed to updated. this is true for both new and just-loaded reports.

        this.notebookConfig = this.NotebookService.getNotebookConfig();
        this.label = this.notebookConfig.itemTypes.report.label;

        this.$scope.$watch(function () {
            return _this.reportItem.content.content;
        }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                _this.dirty = true;
            }
        });

        // start the auto save interval
        this.startAutoSaveInterval();
    }

    _createClass(NotebookItemReportController, [{
        key: 'getItemNodeId',
        value: function getItemNodeId() {
            if (this.item == null) {
                return null;
            } else {
                return this.item.nodeId;
            }
        }

        /**
         * Returns this NotebookItem's position and title.
         */

    }, {
        key: 'getItemNodePositionAndTitle',
        value: function getItemNodePositionAndTitle() {
            if (this.item == null) {
                return "";
            } else {
                return this.ProjectService.getNodePositionAndTitleByNodeId(this.item.nodeId);
            }
        }
    }, {
        key: 'getTemplateUrl',
        value: function getTemplateUrl() {
            return this.templateUrl;
        }
    }, {
        key: 'addNotebookItemContent',
        value: function addNotebookItemContent($event) {
            var notebookItems = this.NotebookService.notebook.items;
            var templateUrl = this.themePath + '/notebook/notebookItemChooser.html';
            var reportTextareaCursorPosition = angular.element('textarea.report').prop("selectionStart"); // insert the notebook item at the cursor position later

            this.$mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: $event,
                templateUrl: templateUrl,
                locals: {
                    notebookItems: notebookItems,
                    reportItem: this.reportItem,
                    reportTextareaCursorPosition: reportTextareaCursorPosition,
                    themePath: this.themePath
                },
                controller: NotebookItemChooserController,
                controllerAs: 'notebookItemChooserController',
                bindToController: true
            });
            function NotebookItemChooserController($rootScope, $scope, $mdDialog, notebookItems, reportItem, reportTextareaCursorPosition, themePath) {
                $scope.notebookItems = notebookItems;
                $scope.reportItem = reportItem;
                $scope.reportTextareaCursorPosition = reportTextareaCursorPosition;
                $scope.themePath = themePath;
                $scope.close = function () {
                    $mdDialog.hide();
                };
                $scope.chooseNotebookItem = function (notebookItem) {
                    //let notebookItemHTML = '<notebook-item item-id="\'' + notebookItem.localNotebookItemId + '\'" is-edit-allowed="true"></notebook-item>';
                    var notebookItemHTML = "";
                    if (notebookItem.content != null && notebookItem.content.attachments != null) {
                        for (var a = 0; a < notebookItem.content.attachments.length; a++) {
                            var notebookItemAttachment = notebookItem.content.attachments[a];
                            notebookItemHTML += "<img src=\"" + notebookItemAttachment.iconURL + "\" />";
                        }
                    }
                    if (notebookItem.content != null && notebookItem.content.text != null) {
                        notebookItemHTML += "<div>" + notebookItem.content.text + "</div>";
                    }
                    //theEditor.content.insertHtmlAtCursor(notebookItemHTML);
                    $rootScope.$broadcast("notebookItemChosen", { "notebookItemHTML": notebookItemHTML });
                    //$scope.reportItem.content.content = $scope.reportItem.content.content.substring(0, reportTextareaCursorPosition) + notebookItemHTML + $scope.reportItem.content.content.substring(reportTextareaCursorPosition);
                    $mdDialog.hide();
                };
            }
            NotebookItemChooserController.$inject = ["$rootScope", "$scope", "$mdDialog", "notebookItems", "reportItem", "reportTextareaCursorPosition", "themePath"];
        }

        /**
         * Start the auto save interval for this report
         */

    }, {
        key: 'startAutoSaveInterval',
        value: function startAutoSaveInterval() {
            var _this2 = this;

            this.stopAutoSaveInterval(); // stop any existing interval
            this.autoSaveIntervalId = setInterval(function () {
                // check if the student work is dirty
                if (_this2.dirty) {
                    // the student work is dirty so we will save

                    /*
                     * obtain the component states from the children and save them
                     * to the server
                     */
                    _this2.saveNotebookReportItem();
                }
            }, this.autoSaveInterval);
        }
    }, {
        key: 'stopAutoSaveInterval',


        /**
         * Stop the auto save interval for this report
         */
        value: function stopAutoSaveInterval() {
            clearInterval(this.autoSaveIntervalId);
        }
    }, {
        key: 'saveNotebookReportItem',


        /**
         * Save the notebook report item to server
         */
        value: function saveNotebookReportItem() {
            var _this3 = this;

            // save new report notebook item
            this.reportItem.content.clientSaveTime = Date.parse(new Date()); // set save timestamp
            this.NotebookService.saveNotebookItem(this.reportItem.id, this.reportItem.nodeId, this.reportItem.localNotebookItemId, this.reportItem.type, this.reportItem.title, this.reportItem.content).then(function (result) {
                if (result) {
                    //this.$translate(['ok']).then((translations) => {
                    _this3.dirty = false;
                    _this3.reportItem.id = result.id; // set the reportNotebookItemId to the newly-incremented id so that future saves during this visit will be an update instead of an insert.
                    var serverSaveTime = result.serverSaveTime;
                    var clientSaveTime = _this3.ConfigService.convertToClientTimestamp(serverSaveTime);
                    _this3.setSaveMessage('Saved', clientSaveTime);
                    //})
                }
            });
        }

        /**
         * Set the message next to the save button
         * @param message the message to display
         * @param time the time to display
         */

    }, {
        key: 'setSaveMessage',
        value: function setSaveMessage(message, time) {
            this.saveMessage.text = message;
            this.saveMessage.time = time;
        }
    }]);

    return NotebookItemReportController;
}();

NotebookItemReportController.$inject = ["$injector", '$mdDialog', "$rootScope", "$scope", "$translate", "ConfigService", "NotebookService", "ProjectService", "StudentAssetService", "StudentDataService"];

exports.default = NotebookItemReportController;
//# sourceMappingURL=notebookItemReportController.js.map