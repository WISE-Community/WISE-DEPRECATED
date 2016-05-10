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
        this.reportItem = this.NotebookService.getLatestNotebookReportItemByReportId(this.reportId);
        if (this.reportItem == null) {
            // Student doesn't have work for this report yet, so we'll use the template.
            this.reportItem = this.NotebookService.getTemplateReportItemByReportId(this.reportId);
            if (this.reportItem == null) {
                // if there is no template, don't allow student to work on the report.
                return;
            } else {
                this.reportItem.id = null;  // set the id to null so it can be inserted as initial version, as opposed to updated.
            }
        }
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

    addTextContent(section) {
        let newReportContent = {
            "type": "text",
            "value": "Write your thoughts here..."
        };
        section.content.push(newReportContent);
    }

    editSectionContentText(sectionContent) {

    }

    addNotebookItemContent($event, section) {
        let notebookItems = this.NotebookService.notebook.items;
        let templateUrl = this.themePath + '/notebook/notebookItemChooser.html';

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
            $scope.close = () => {
                $mdDialog.hide();
            };
            $scope.chooseNotebookItem = (notebookItem) => {
                let newReportContent = {
                    type: "notebookItem",
                    notebookItemId: notebookItem.localNotebookItemId
                };
                section.content.push(newReportContent);
                $mdDialog.hide();
            };
        }
        NotebookItemChooserController.$inject = ["$scope", "$mdDialog", "notebookItems", "section", "themePath"];
    }

    saveNotebookReportItem() {
        // save new report notebook item
        this.reportItem.content.clientSaveTime = Date.parse(new Date());  // set save timestamp
        this.NotebookService.saveNotebookItem(this.reportItem.id, this.reportItem.nodeId, this.reportItem.localNotebookItemId, this.reportItem.type, this.reportItem.title, this.reportItem.content)
            .then(() => {
                this.$translate(['ok']).then((translations) => {
                    this.$mdDialog.show(
                        this.$mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title("Report Saved")
                            .htmlContent("Report was saved successfully.")
                            .ariaLabel("Report was saved successfully.")
                            .ok(translations.ok)
                            .targetEvent(event)
                    );
                })
            });
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