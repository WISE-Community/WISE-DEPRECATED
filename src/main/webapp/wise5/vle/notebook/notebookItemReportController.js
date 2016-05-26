'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookItemReportController = function () {
    function NotebookItemReportController($injector, $mdBottomSheet, $rootScope, $scope, $translate, ConfigService, NotebookService, ProjectService, StudentAssetService, StudentDataService) {
        var _this = this;

        _classCallCheck(this, NotebookItemReportController);

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

        // summernote editor options
        this.summernoteOptions = {
            toolbar: [['edit', ['undo', 'redo']], ['style', ['bold', 'italic', 'underline' /*, 'superscript', 'subscript', 'strikethrough', 'clear'*/]],
            //['style', ['style']],
            //['fontface', ['fontname']],
            //['textsize', ['fontsize']],
            //['fontclr', ['color']],
            ['alignment', ['ul', 'ol', 'paragraph' /*, 'lineheight'*/]],
            //['height', ['height']],
            //['table', ['table']],
            //['insert', ['link','picture','video','hr']],
            //['view', ['fullscreen', 'codeview']],
            //['help', ['help']]
            ['customButton', ['customButton']]
            //['print', ['print']]
            ],
            customButton: {
                buttonText: 'Add ' + this.notebookConfig.label + ' Item +',
                tooltip: 'Insert in content',
                buttonClass: 'accent-1 notebook-item--report__add-note',
                action: function action() {
                    _this.addNotebookItemContent();
                }
            },
            callbacks: {
                onBlur: function onBlur() {
                    $(this).summernote('saveRange');
                }
            }
        };

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
        value: function addNotebookItemContent() {
            var _$mdBottomSheet$show;

            var notebookItems = this.NotebookService.notebook.items;
            var templateUrl = this.themePath + '/notebook/notebookItemChooser.html';
            var reportTextareaCursorPosition = angular.element('textarea.report').prop("selectionStart"); // insert the notebook item at the cursor position later
            var $reportElement = $('#' + this.reportId);

            this.$mdBottomSheet.show((_$mdBottomSheet$show = {
                parent: angular.element(document.body),
                templateUrl: templateUrl,
                locals: {
                    notebookItems: notebookItems,
                    reportItem: this.reportItem,
                    reportTextareaCursorPosition: reportTextareaCursorPosition,
                    themePath: this.themePath,
                    notebookConfig: this.notebookConfig
                },
                controller: 'GridBottomSheetCtrl'
            }, _defineProperty(_$mdBottomSheet$show, 'controller', NotebookItemChooserController), _defineProperty(_$mdBottomSheet$show, 'controllerAs', 'notebookItemChooserController'), _defineProperty(_$mdBottomSheet$show, 'bindToController', true), _$mdBottomSheet$show));
            function NotebookItemChooserController($rootScope, $mdBottomSheet, $scope, notebookItems, reportItem, reportTextareaCursorPosition, themePath) {
                $scope.notebookItems = notebookItems;
                $scope.reportItem = reportItem;
                $scope.reportTextareaCursorPosition = reportTextareaCursorPosition;
                $scope.themePath = themePath;
                $scope.chooseNotebookItem = function (notebookItem) {
                    //let notebookItemHTML = '<notebook-item item-id="\'' + notebookItem.localNotebookItemId + '\'" is-edit-allowed="true"></notebook-item>';
                    var $p = $('<p></p>').css('text-align', 'center');
                    if (notebookItem.content != null && notebookItem.content.attachments != null) {
                        for (var a = 0; a < notebookItem.content.attachments.length; a++) {
                            var notebookItemAttachment = notebookItem.content.attachments[a];
                            var $img = $('<img src="' + notebookItemAttachment.iconURL + '" alt="notebook image" />');
                            $img.addClass('notebook-item--report__note-img');
                            //$reportElement.find('.note-editable').trigger('focus');
                            $p.append($img);
                        }
                    }
                    if (notebookItem.content != null && notebookItem.content.text != null) {
                        var $caption = $('<div class="md-caption">' + notebookItem.content.text + '</div>').css({ 'text-align': 'center', 'margin-top': '8px' });
                        $p.append($caption);
                    }
                    //theEditor.content.insertHtmlAtCursor(notebookItemHTML);
                    //$rootScope.$broadcast("notebookItemChosen", {"notebookItemHTML": notebookItemHTML});
                    //$scope.reportItem.content.content = $scope.reportItem.content.content.substring(0, reportTextareaCursorPosition) + notebookItemHTML + $scope.reportItem.content.content.substring(reportTextareaCursorPosition);
                    $reportElement.summernote('focus');
                    $reportElement.summernote('restoreRange');
                    $reportElement.summernote('insertNode', $p[0]);

                    // hide chooser
                    $mdBottomSheet.hide();
                };
            }
            NotebookItemChooserController.$inject = ["$rootScope", "$mdBottomSheet", "$scope", "notebookItems", "reportItem", "reportTextareaCursorPosition", "themePath"];
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

                    // set save message
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

NotebookItemReportController.$inject = ["$injector", '$mdBottomSheet', "$rootScope", "$scope", "$translate", "ConfigService", "NotebookService", "ProjectService", "StudentAssetService", "StudentDataService"];

exports.default = NotebookItemReportController;
//# sourceMappingURL=notebookItemReportController.js.map