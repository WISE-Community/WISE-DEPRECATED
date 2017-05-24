"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookReportController = function () {
    function NotebookReportController($filter, $mdSidenav, $scope, $timeout, AnnotationService, ConfigService, NotebookService, ProjectService) {
        var _this = this;

        _classCallCheck(this, NotebookReportController);

        this.$filter = $filter;
        this.$mdSidenav = $mdSidenav;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;

        this.$translate = this.$filter('translate');

        this.full = false;
        this.collapsed = true;

        this.dirty = false;
        this.autoSaveInterval = 30000; // the auto save interval in milliseconds

        this.saveMessage = {
            text: '',
            time: ''
        };

        // assume only one report for now
        this.reportId = this.config.itemTypes.report.notes[0].reportId;
        this.reportItem = this.NotebookService.getLatestNotebookReportItemByReportId(this.reportId, this.workgroupId);
        if (this.reportItem) {
            var serverSaveTime = this.reportItem.serverSaveTime;
            var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
            this.setSaveMessage(this.$translate('saved'), clientSaveTime);
        } else {
            // Student doesn't have work for this report yet, so we'll use the template.
            this.reportItem = this.NotebookService.getTemplateReportItemByReportId(this.reportId);
            if (this.reportItem == null) {
                // if there is no template, don't allow student to work on the report.
                return;
            }
        }
        // get the max score
        this.maxScore = 0;
        var localNotebookItemId = null; // unique id that is local to this student, that identifies a note and its revisions. e.g. "finalReport", "xyzabc"
        if (this.reportItem.content != null && this.reportItem.content.reportId != null) {
            localNotebookItemId = this.reportItem.localNotebookItemId;
            var reportNoteContent = this.NotebookService.getReportNoteContentByReportId(this.reportItem.content.reportId);
            if (reportNoteContent != null && reportNoteContent.maxScore != null) {
                this.maxScore = reportNoteContent.maxScore;
            }
        }
        // set the id to null so it can be inserted as initial version, as opposed to updated. this is true for both new and just-loaded reports.
        this.reportItem.id = null;
        // replace relative asset paths with absolute asset paths
        this.reportItemContent = this.ProjectService.injectAssetPaths(this.reportItem.content.content);
        // get the latest annotations
        this.latestAnnotations = this.AnnotationService.getLatestNotebookItemAnnotations(this.workgroupId, this.reportId);

        // start auto-saving
        this.startAutoSaveInterval();

        // summernote editor options
        this.summernoteOptions = {
            toolbar: [['edit', ['undo', 'redo']], ['style', ['bold', 'italic', 'underline' /*, 'superscript', 'subscript', 'strikethrough', 'clear'*/]],
            //['style', ['style']],
            //['fontface', ['fontname']],
            //['textsize', ['fontsize']],
            //['fontclr', ['color']],
            ['para', ['ul', 'ol', 'paragraph' /*, 'lineheight'*/]],
            //['height', ['height']],
            //['table', ['table']],
            //['insert', ['link','picture','video','hr']],
            //['view', ['fullscreen', 'codeview']],
            //['help', ['help']]
            ['customButton', ['customButton']], ['print', ['print']]],
            popover: {
                image: [['imagesize', ['imageSize100', 'imageSize50', 'imageSize25']],
                //['float', ['floatLeft', 'floatRight', 'floatNone']],
                ['remove', ['removeMedia']]]
            },
            customButton: {
                // TODO: i18n
                buttonText: 'Insert ' + this.config.itemTypes.note.label.singular + ' +',
                tooltip: 'Insert from ' + this.config.label,
                buttonClass: 'accent-1 notebook-item--report__add-note',
                action: function action($event) {
                    _this.addNotebookItemContent($event);
                }
            },
            disableDragAndDrop: true,
            toolbarContainer: '#' + this.reportId + '-toolbar',
            callbacks: {
                onBlur: function onBlur() {
                    $(this).summernote('saveRange');
                }
            }
        };

        this.$onChanges = function (changes) {
            if (changes.insertContent && !changes.insertContent.isFirstChange() && changes.insertContent.currentValue) {
                // a notebook item is being inserted into the report
                var item = angular.copy(changes.insertContent.currentValue);

                // prepare summernote editor instance
                var reportElement = $('#' + _this.reportId);
                reportElement.summernote('focus');
                reportElement.summernote('restoreRange');

                // create a jQuery DOM element to insert into the Summernote report editor
                var $item = $('<p>');
                var hasAttachments = false;

                if (item.content) {
                    if (item.content.attachments) {
                        if (item.content.attachments.length) {
                            hasAttachments = true;
                            // item includes attachments, so center align element
                            $item.css('text-align', 'center');
                        }
                        for (var a = 0; a < item.content.attachments.length; a++) {
                            // add each attachment to the element
                            var notebookItemAttachment = item.content.attachments[a];
                            var iconURL = notebookItemAttachment.iconURL;
                            var $img = $('<img src="' + iconURL + '" alt="notebook image" style="width: 75%; max-width: 100%; height: auto; border: 1px solid #aaaaaa; padding: 8px; margin-bottom: 4px;" />');
                            $img.addClass('notebook-item--report__note-img');
                            $item.append($img);
                        }
                    }
                    if (item.content.text) {
                        // item contains text, so add to element
                        if (hasAttachments) {
                            // item has attachments, so treat text content as a caption: center it and make it bold
                            var $caption = $('<div><b>' + item.content.text + '</b></div>').css({ 'text-align': 'center' });
                            $item.append($caption);
                            reportElement.summernote('insertNode', $item[0]);
                        } else {
                            // note only contains text, so insert plain text
                            reportElement.summernote('insertText', item.content.text);
                        }
                    } else {
                        reportElement.summernote('insertNode', $item[0]);
                    }
                }
            }
        };

        /**
         * Captures the annotation received event, checks whether the given
         * annotation id matches this report id, updates UI accordingly
         */
        this.$scope.$on('notebookItemAnnotationReceived', function (event, args) {
            var annotation = args.annotation;
            if (annotation.localNotebookItemId === _this.reportId) {
                // there is a new annotation for this report
                _this.hasNewAnnotation = true;
                _this.latestAnnotations = _this.AnnotationService.getLatestNotebookItemAnnotations(_this.workgroupId, _this.reportId);
            }
        });

        /**
         * Captures the show report annotations event, opens report (if collapsed)
         * and scrolls to the report annotations display
         */
        this.$scope.$on('showReportAnnotations', function (args) {
            if (_this.collapsed) {
                // open the report
                _this.collapse();
            }

            // scroll to report annotations (bottom)
            var $notebookReportContent = $('.notebook-report__content');
            $timeout(function () {
                $notebookReportContent.animate({
                    scrollTop: $notebookReportContent.prop('scrollHeight')
                }, 500);
            }, 500);
        });
    }

    _createClass(NotebookReportController, [{
        key: 'collapse',
        value: function collapse() {
            this.collapsed = !this.collapsed;

            if (this.collapsed) {
                this.onCollapse();
            }
        }
    }, {
        key: 'fullscreen',
        value: function fullscreen() {
            if (this.collapsed) {
                this.full = true;
                this.collapsed = false;
            } else {
                this.full = !this.full;
            }
        }
    }, {
        key: 'addNotebookItemContent',
        value: function addNotebookItemContent($event) {
            this.onSetInsertMode({ value: true });
        }
    }, {
        key: 'changed',
        value: function changed(value) {
            // report content had changed
            this.dirty = true;

            /*
             * remove the absolute asset paths
             * e.g.
             * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
             * will be changed to
             * <img src='sun.png'/>
             */
            this.reportItem.content.content = this.ConfigService.removeAbsoluteAssetPaths(value);
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
                    // the student work is dirty so we will save.
                    // obtain the component states from the children and save them to the server
                    _this2.saveNotebookReportItem();
                }
            }, this.autoSaveInterval);
        }

        /**
         * Stop the auto save interval for this report
         */

    }, {
        key: 'stopAutoSaveInterval',
        value: function stopAutoSaveInterval() {
            clearInterval(this.autoSaveIntervalId);
        }

        /**
         * Save the notebook report item to server
         */

    }, {
        key: 'saveNotebookReportItem',
        value: function saveNotebookReportItem() {
            var _this3 = this;

            // save new report notebook item
            this.reportItem.content.clientSaveTime = Date.parse(new Date()); // set save timestamp
            this.NotebookService.saveNotebookItem(this.reportItem.id, this.reportItem.nodeId, this.reportItem.localNotebookItemId, this.reportItem.type, this.reportItem.title, this.reportItem.content, this.reportItem.content.clientSaveTime).then(function (result) {
                if (result) {
                    _this3.dirty = false;
                    _this3.hasNewAnnotation = false;
                    _this3.reportItem.id = result.id; // set the reportNotebookItemId to the newly-incremented id so that future saves during this visit will be an update instead of an insert.
                    var serverSaveTime = result.serverSaveTime;
                    var clientSaveTime = _this3.ConfigService.convertToClientTimestamp(serverSaveTime);

                    // set save message
                    _this3.setSaveMessage(_this3.$translate('saved'), clientSaveTime);
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

    return NotebookReportController;
}();

NotebookReportController.$inject = ['$filter', '$mdSidenav', '$scope', '$timeout', 'AnnotationService', 'ConfigService', 'NotebookService', 'ProjectService'];

var NotebookReport = {
    bindings: {
        config: '<',
        insertContent: '<',
        insertMode: '<',
        reportId: '<',
        visible: '<',
        workgroupId: '<',
        onCollapse: '&',
        onSetInsertMode: '&'
        //onClose: '&'
    },
    template: '<div ng-if="($ctrl.visible && $ctrl.full && !$ctrl.collapsed) || $ctrl.insertMode" class="notebook-report-backdrop"></div>\n        <div ng-if="$ctrl.visible" class="notebook-report-container"\n              ng-class="{\'notebook-report-container__collapsed\': $ctrl.collapsed, \'notebook-report-container__full\': $ctrl.full && !$ctrl.collapsed}">\n            <md-card class="notebook-report md-whiteframe-3dp l-constrained">\n                <md-toolbar ng-click="$ctrl.collapsed ? $ctrl.collapse() : return" class="md-toolbar--wise md-toolbar--wise--sm notebook-report__toolbar">\n                    <md-toolbar-tools class="md-toolbar-tools">\n                        <md-icon>assignment</md-icon>&nbsp;\n                        <span ng-if="$ctrl.collapsed" class="overflow--ellipsis notebook-report__toolbar__title">{{$ctrl.reportItem.content.title}}</span>\n                        <span flex></span>\n                        <md-button aria-label="{{\'toggleFullScreen\' | translate}}" title="{{\'toggleFullScreen\' | translate}}" class="md-icon-button notebook-tools--full"\n                                   ng-click="$ctrl.fullscreen()">\n                            <md-icon ng-if="!$ctrl.full || $ctrl.collapsed"> fullscreen </md-icon>\n                            <md-icon ng-if="$ctrl.full && !$ctrl.collapsed"> fullscreen_exit </md-icon>\n                        </md-button>\n                        <md-button aria-label="{{\'collapse\' | translate}}" title="{{\'collapse\' | translate}}" class="md-icon-button"\n                                   ng-if="!$ctrl.collapsed" ng-click="$event.stopPropagation(); $ctrl.collapse()">\n                            <md-icon> arrow_drop_down </md-icon>\n                        </md-button>\n                        <md-button aria-label="{{\'restore\' | translate}}" title="{{\'restore\' | translate}}" class="md-icon-button"\n                                   ng-if="$ctrl.collapsed" ng-click="$event.stopPropagation(); $ctrl.collapse()">\n                            <md-icon> arrow_drop_up </md-icon>\n                        </md-button>\n                    </md-toolbar-tools>\n                    <div class="notebook-report__content__header md-whiteframe-1dp" layout="row" layout-align="start center">\n                        <span style="color: {{$ctrl.config.itemTypes.report.label.color}};">{{$ctrl.reportItem.content.title}}</span>\n                        <span flex></span>\n                        <md-icon aria-label="{{$ctrl.reportItem.content.title}} info" style="color: {{$ctrl.config.itemTypes.report.label.color}};">\n                            info\n                            <md-tooltip md-direction="left">{{$ctrl.reportItem.content.prompt}}</md-tooltip>\n                        </md-icon>\n                    </div>\n                </md-toolbar>\n                <md-content class="notebook-report__content" flex>\n                    <summernote id="{{$ctrl.reportId}}"\n                                class="notebook-item--report__content"\n                                ng-model="$ctrl.reportItemContent"\n                                ng-change="$ctrl.changed($ctrl.reportItemContent)"\n                                config="$ctrl.summernoteOptions"></summernote>\n                    <notebook-report-annotations annotations="$ctrl.latestAnnotations"\n                                                 has-new="$ctrl.hasNewAnnotation"\n                                                 max-score="$ctrl.maxScore"></notebook-report-annotations>\n                </md-content>\n                <md-card-actions class="notebook-report__actions">\n                    <div id="{{$ctrl.reportId}}-toolbar"></div>\n                    <div layout="row" layout-align="start center">\n                        <md-button class="md-primary md-raised button--small"\n                                   aria-label="{{ \'save\' | translate }}"\n                                   ng-disabled="!$ctrl.dirty"\n                                   ng-click="$ctrl.saveNotebookReportItem()">{{ \'save\' | translate }}</md-button>\n                        <span ng-show="$ctrl.saveMessage.text"\n                              class="component__actions__info md-caption">\n                              {{$ctrl.saveMessage.text}} <span class="component__actions__more"><md-tooltip md-direction="top">{{ $ctrl.saveMessage.time | amDateFormat:\'ddd, MMM D YYYY, h:mm a\' }}</md-tooltip><span am-time-ago="$ctrl.saveMessage.time"></span></span>\n                        </span>\n                    </div>\n                </md-card-actions>\n            </md-card>\n        </div>',
    controller: NotebookReportController
};

exports.default = NotebookReport;
//# sourceMappingURL=notebookReport.js.map