'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookItemReportController = function () {
    function NotebookItemReportController($injector, $mdDialog, $rootScope, $scope, $translate, ConfigService, NotebookService, ProjectService, StudentAssetService, StudentDataService) {
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
        this.reportItem = this.NotebookService.getLatestNotebookReportItemByReportId(this.reportId);
        if (this.reportItem == null) {
            // Student doesn't have work for this report yet, so we'll use the template.
            this.reportItem = this.NotebookService.getTemplateReportItemByReportId(this.reportId);
            if (this.reportItem == null) {
                // if there is no template, don't allow student to work on the report.
                return;
            } else {
                this.reportItem.id = null; // set the id to null so it can be inserted as initial version, as opposed to updated.
            }
        }
    }

    _createClass(NotebookItemReportController, [{
        key: "getItemNodeId",
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
        key: "getItemNodePositionAndTitle",
        value: function getItemNodePositionAndTitle() {
            if (this.item == null) {
                return "";
            } else {
                return this.ProjectService.getNodePositionAndTitleByNodeId(this.item.nodeId);
            }
        }
    }, {
        key: "getTemplateUrl",
        value: function getTemplateUrl() {
            return this.templateUrl;
        }
    }, {
        key: "addTextContent",
        value: function addTextContent(section) {
            var newReportContent = {
                "type": "text",
                "value": "Write your thoughts here..."
            };
            section.content.push(newReportContent);
        }
    }, {
        key: "editSectionContentText",
        value: function editSectionContentText(sectionContent) {}
    }, {
        key: "addNotebookItemContent",
        value: function addNotebookItemContent($event, section) {
            var notebookItems = this.NotebookService.notebook.items;
            var templateUrl = this.themePath + '/notebook/notebookItemChooser.html';

            this.$mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: $event,
                templateUrl: templateUrl,
                locals: {
                    notebookItems: notebookItems,
                    section: section,
                    themePath: this.themePath
                },
                controller: NotebookItemChooserController,
                controllerAs: 'notebookItemChooserController',
                bindToController: true
            });
            function NotebookItemChooserController($scope, $mdDialog, notebookItems, section, themePath) {
                $scope.notebookItems = notebookItems;
                $scope.section = section;
                $scope.themePath = themePath;
                $scope.close = function () {
                    $mdDialog.hide();
                };
                $scope.chooseNotebookItem = function (notebookItem) {
                    var newReportContent = {
                        type: "notebookItem",
                        notebookItemId: notebookItem.localNotebookItemId
                    };
                    section.content.push(newReportContent);
                    $mdDialog.hide();
                };
            }
            NotebookItemChooserController.$inject = ["$scope", "$mdDialog", "notebookItems", "section", "themePath"];
        }
    }, {
        key: "saveNotebookReportItem",
        value: function saveNotebookReportItem() {
            var _this = this;

            // save new report notebook item
            this.reportItem.content.clientSaveTime = Date.parse(new Date()); // set save timestamp
            this.NotebookService.saveNotebookItem(this.reportItem.id, this.reportItem.nodeId, this.reportItem.localNotebookItemId, this.reportItem.type, this.reportItem.title, this.reportItem.content).then(function () {
                _this.$translate(['ok']).then(function (translations) {
                    _this.$mdDialog.show(_this.$mdDialog.alert().parent(angular.element(document.body)).title("Report Saved").htmlContent("Report was saved successfully.").ariaLabel("Report was saved successfully.").ok(translations.ok).targetEvent(event));
                });
            });
        }
    }]);

    return NotebookItemReportController;
}();

NotebookItemReportController.$inject = ["$injector", '$mdDialog', "$rootScope", "$scope", "$translate", "ConfigService", "NotebookService", "ProjectService", "StudentAssetService", "StudentDataService"];

exports.default = NotebookItemReportController;
//# sourceMappingURL=notebookItemReportController.js.map