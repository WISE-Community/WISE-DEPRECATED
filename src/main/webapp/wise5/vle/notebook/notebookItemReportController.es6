'use strict';

class NotebookItemReportController {

    constructor($injector,
        $mdBottomSheet,
        $rootScope,
        $scope,
        $translate,
        ConfigService,
        NotebookService,
        ProjectService,
        StudentAssetService,
        StudentDataService) {
            this.$injector = $injector;
            this.$mdBottomSheet = $mdBottomSheet;
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

            this.autoSaveInterval = 60000;  // the auto save interval in milliseconds

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
                }
            }
            this.reportItem.id = null;  // set the id to null so it can be inserted as initial version, as opposed to updated. this is true for both new and just-loaded reports.

            this.notebookConfig = this.NotebookService.getNotebookConfig();
            this.label = this.notebookConfig.itemTypes.report.label;

            // summernote editor options
            this.summernoteOptions = {
                toolbar: [
                    ['edit',['undo','redo']],
                    ['style', ['bold', 'italic', 'underline'/*, 'superscript', 'subscript', 'strikethrough', 'clear'*/]],
                    //['style', ['style']],
                    //['fontface', ['fontname']],
                    //['textsize', ['fontsize']],
                    //['fontclr', ['color']],
                    ['para', ['ul', 'ol', 'paragraph'/*, 'lineheight'*/]],
                    //['height', ['height']],
                    //['table', ['table']],
                    //['insert', ['link','picture','video','hr']],
                    //['view', ['fullscreen', 'codeview']],
                    //['help', ['help']]
                    ['customButton', ['customButton']]
                    //['print', ['print']]
                ],
                popover: {
                    image: [
                        ['imagesize', ['imageSize100', 'imageSize50', 'imageSize25']],
                        //['float', ['floatLeft', 'floatRight', 'floatNone']],
                        ['remove', ['removeMedia']]
                    ]
                },
                customButton: {
                    buttonText: 'Add ' + this.notebookConfig.label + ' Item +',
                    tooltip: 'Insert from ' + this.notebookConfig.label,
                    buttonClass: 'accent-1 notebook-item--report__add-note',
                    action: ($event) => {
                        this.addNotebookItemContent($event);
                    }
                },
                disableDragAndDrop: true,
                toolbarContainer: '#' + this.reportId + '-toolbar',
                callbacks: {
                    onBlur: function() {
                        $(this).summernote('saveRange');
                    }
                }
            };

            this.$scope.$watch(() => {
                return this.reportItem.content.content;
            }, (newValue, oldValue) => {
                if (newValue !== oldValue) {
                    this.dirty = true;
                }
            });

            this.$scope.$on('toggleNotebook', () => {
                if (this.dirty) {
                    this.saveNotebookReportItem();
                }
            });

            // start the auto save interval
            this.startAutoSaveInterval();
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

        addNotebookItemContent(ev) {
            let notebookItems = this.NotebookService.notebook.items;
            let templateUrl = this.themePath + '/notebook/notebookItemChooser.html';
            let reportTextareaCursorPosition = angular.element('textarea.report').prop("selectionStart"); // insert the notebook item at the cursor position later
            let $reportElement = $('#' + this.reportId);

            this.$mdBottomSheet.show({
                parent: angular.element(document.body),
                templateUrl: templateUrl,
                locals: {
                    notebookItems: notebookItems,
                    reportItem: this.reportItem,
                    reportTextareaCursorPosition: reportTextareaCursorPosition,
                    themePath: this.themePath,
                    notebookConfig: this.notebookConfig
                },
                controller: 'GridBottomSheetCtrl',
                controller: NotebookItemChooserController,
                controllerAs: 'notebookItemChooserController',
                bindToController: true
            });

            function NotebookItemChooserController($rootScope, $mdBottomSheet, $scope, notebookItems, reportItem, reportTextareaCursorPosition, themePath) {
                $scope.notebookItems = notebookItems;
                $scope.reportItem = reportItem;
                $scope.reportTextareaCursorPosition = reportTextareaCursorPosition;
                $scope.themePath = themePath;
                $scope.chooseNotebookItem = (notebookItem) => {
                    //let notebookItemHTML = '<notebook-item item-id="\'' + notebookItem.localNotebookItemId + '\'" is-edit-allowed="true"></notebook-item>';
                    let $item = $('<div></div>').css('text-align', 'center');
                    if (notebookItem.content && notebookItem.content.attachments) {
                        for (let a = 0; a < notebookItem.content.attachments.length; a++) {
                            let notebookItemAttachment = notebookItem.content.attachments[a];
                            let $img = $('<img src="' + notebookItemAttachment.iconURL + '" alt="notebook image" style="width: 75%; max-width: 100%; height: auto; border: 1px solid #aaaaaa; padding: 8px; margin-bottom: 4px;" />');
                            $img.addClass('notebook-item--report__note-img');
                            //$reportElement.find('.note-editable').trigger('focus');
                            $item.append($img);
                        }
                    }
                    if (notebookItem.content && notebookItem.content.text) {
                        let $caption = $('<div><b>' + notebookItem.content.text + '</b></div>').css({'text-align': 'center'});
                        $item.append($caption);
                    }
                    //theEditor.content.insertHtmlAtCursor(notebookItemHTML);
                    //$rootScope.$broadcast("notebookItemChosen", {"notebookItemHTML": notebookItemHTML});
                    //$scope.reportItem.content.content = $scope.reportItem.content.content.substring(0, reportTextareaCursorPosition) + notebookItemHTML + $scope.reportItem.content.content.substring(reportTextareaCursorPosition);
                    $reportElement.summernote('focus');
                    $reportElement.summernote('restoreRange');
                    $reportElement.summernote('insertNode', $item[0]);

                    // hide chooser
                    $mdBottomSheet.hide();
                };
            }
            NotebookItemChooserController.$inject = ["$rootScope", "$mdBottomSheet", "$scope", "notebookItems", "reportItem", "reportTextareaCursorPosition", "themePath"];
        }

        /**
        * Start the auto save interval for this report
        */
        startAutoSaveInterval() {
            this.stopAutoSaveInterval();  // stop any existing interval
            this.autoSaveIntervalId = setInterval(() => {
                // check if the student work is dirty
                if (this.dirty) {
                    // the student work is dirty so we will save

                    /*
                    * obtain the component states from the children and save them
                    * to the server
                    */
                    this.saveNotebookReportItem();
                }
            }, this.autoSaveInterval);
        };

        /**
        * Stop the auto save interval for this report
        */
        stopAutoSaveInterval() {
            clearInterval(this.autoSaveIntervalId);
        };

        /**
        * Save the notebook report item to server
        */
        saveNotebookReportItem() {
            // save new report notebook item
            this.reportItem.content.clientSaveTime = Date.parse(new Date());  // set save timestamp
            this.NotebookService.saveNotebookItem(this.reportItem.id, this.reportItem.nodeId, this.reportItem.localNotebookItemId, this.reportItem.type, this.reportItem.title, this.reportItem.content)
            .then((result) => {
                if(result) {
                    //this.$translate(['ok']).then((translations) => {
                    this.dirty = false;
                    this.reportItem.id = result.id; // set the reportNotebookItemId to the newly-incremented id so that future saves during this visit will be an update instead of an insert.
                    let serverSaveTime = result.serverSaveTime;
                    let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

                    // set save message
                    this.setSaveMessage('Saved', clientSaveTime);
                    //})
                }
            });
        }

        /**
         * Account for potential vertical scrollbar on Notebook content and set
         * fixed rich text toolbar location accordingly
         */
        setEditorPosition(distance, elem, edge) {
            let scrollBarWidth = document.body.clientWidth - angular.element(document.querySelector('#notebook')).outerWidth(true);
            elem.find('.notebook-item--report__toolbar').css('right', scrollBarWidth);
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
        '$mdBottomSheet',
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
