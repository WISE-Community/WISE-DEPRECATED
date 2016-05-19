'use strict';

class NotebookItemReportController {

    constructor($injector,
                $mdDialog,
                $rootScope,
                $scope,
                $translate,
                ConfigService,
                NotebookService,
                ProjectService,
                StudentAssetService,
                StudentDataService) {
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

        this.saveMessage = {
            text: '',
            time: ''
        };

        this.reportItem = this.NotebookService.getLatestNotebookReportItemByReportId(this.reportId);
        if (this.reportItem) {
            let serverSaveTime = this.reportItem.serverSaveTime;
            let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
            this.setSaveMessage('Last saved', clientSaveTime);
        } else {
            // Student doesn't have work for this report yet, so we'll use the template.
            this.reportItem = this.NotebookService.getTemplateReportItemByReportId(this.reportId);
            if (this.reportItem == null) {
                // if there is no template, don't allow student to work on the report.
                return;
            } else {
                this.reportItem.id = null;  // set the id to null so it can be inserted as initial version, as opposed to updated.
            }
        }

        this.notebookConfig = this.NotebookService.getNotebookConfig();
        this.label = this.notebookConfig.itemTypes.report.label;

        this.$scope.$watch(() => {
            return this.reportItem.content.content;
        }, (newValue, oldValue) => {
            if (newValue !== oldValue) {
                this.dirty = true;
            }
        });
    }

    getItemNodeId() {
        if (this.item == null) {
            return null;
        } else {
            return this.item.nodeId;
        }
    }

    /**
     * Returns this NotebookItem's position and title.
     */
    getItemNodePositionAndTitle() {
        if (this.item == null) {
            return "";
        } else {
            return this.ProjectService.getNodePositionAndTitleByNodeId(this.item.nodeId);
        }
    }

    getTemplateUrl() {
        return this.templateUrl;
    }

    addNotebookItemContent($event) {
        let notebookItems = this.NotebookService.notebook.items;
        let templateUrl = this.themePath + '/notebook/notebookItemChooser.html';
        let reportTextareaCursorPosition = angular.element('textarea.report').prop("selectionStart"); // insert the notebook item at the cursor position later

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
        function NotebookItemChooserController($scope, $mdDialog, notebookItems, reportItem, reportTextareaCursorPosition, themePath) {
            $scope.notebookItems = notebookItems;
            $scope.reportItem = reportItem;
            $scope.reportTextareaCursorPosition = reportTextareaCursorPosition;
            $scope.themePath = themePath;
            $scope.close = () => {
                $mdDialog.hide();
            };
            $scope.chooseNotebookItem = (notebookItem) => {
                let notebookItemHTML = '<notebook-item item-id="\'' + notebookItem.localNotebookItemId + '\'" is-edit-allowed="true"></notebook-item>';
                $scope.reportItem.content.content = $scope.reportItem.content.content.substring(0, reportTextareaCursorPosition) + notebookItemHTML + $scope.reportItem.content.content.substring(reportTextareaCursorPosition);
                $mdDialog.hide();
            };
        }
        NotebookItemChooserController.$inject = ["$scope", "$mdDialog", "notebookItems", "reportItem", "reportTextareaCursorPosition", "themePath"];
    }

    saveNotebookReportItem() {
        // save new report notebook item
        this.reportItem.content.clientSaveTime = Date.parse(new Date());  // set save timestamp
        this.NotebookService.saveNotebookItem(this.reportItem.id, this.reportItem.nodeId, this.reportItem.localNotebookItemId, this.reportItem.type, this.reportItem.title, this.reportItem.content)
            .then((result) => {
                if(result) {
                    //this.$translate(['ok']).then((translations) => {
                    this.dirty = false;
                    let serverSaveTime = result.serverSaveTime;
                    let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
                    this.setSaveMessage('Saved', clientSaveTime);
                    //})
                }
            });
    }

    /**
     * Set the message next to the save button
     * @param message the message to display
     * @param time the time to display
     */
    setSaveMessage(message, time) {
        this.saveMessage.text = message;
        this.saveMessage.time = time;
    }
}

NotebookItemReportController.$inject = [
    "$injector",
    '$mdDialog',
    "$rootScope",
    "$scope",
    "$translate",
    "ConfigService",
    "NotebookService",
    "ProjectService",
    "StudentAssetService",
    "StudentDataService"
];

export default NotebookItemReportController;
