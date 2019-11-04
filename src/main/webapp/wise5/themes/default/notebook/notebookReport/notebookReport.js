'use strict';

class NotebookReportController {
  constructor($filter,
              $mdSidenav,
              $scope,
              $timeout,
              AnnotationService,
              ConfigService,
              NotebookService,
              ProjectService) {
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
    this.autoSaveIntervalMS = 30000;
    this.saveMessage = {
      text: '',
      time: ''
    };
  }

  $onInit() {
    this.reportId = this.config.itemTypes.report.notes[0].reportId;
    if (this.workgroupId == null) {
      this.workgroupId = this.ConfigService.getWorkgroupId();
    }
    this.reportItem = this.NotebookService.getLatestNotebookReportItemByReportId(this.reportId, this.workgroupId);
    if (this.reportItem) {
      const serverSaveTime = this.reportItem.serverSaveTime;
      const clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
      this.setSavedMessage(clientSaveTime);
    } else {
      // student doesn't have work for this report yet, so get the default template.
      this.reportItem = this.NotebookService.getTemplateReportItemByReportId(this.reportId);
      if (this.reportItem == null) {
        // don't allow student to work on the report
        return;
      }
    }
    this.maxScore = this.NotebookService.getMaxScoreByReportId(this.reportId);

    if (this.mode !== 'classroomMonitor') {
      this.reportItem.id = null; // set the id to null so it can be inserted as initial version, as opposed to updated. this is true for both new and just-loaded reports.
    }
    this.reportItemContent = this.ProjectService.injectAssetPaths(this.reportItem.content.content);
    this.latestAnnotations = this.AnnotationService.getLatestNotebookItemAnnotations(this.workgroupId, this.reportId);
    this.startAutoSaveInterval();

    this.summernoteOptions = {
      toolbar: [
        ['edit', ['undo', 'redo']],
        ['style', ['bold', 'italic', 'underline']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['print', ['print']]
      ],
      popover: {
        image: [
          ['imagesize', ['imageSize100', 'imageSize50', 'imageSize25']],
          ['remove', ['removeMedia']]
        ]
      },
      disableDragAndDrop: true,
      toolbarContainer: '#' + this.reportId + '-toolbar',
      callbacks: {
        onBlur: (args, args2) => {
          angular.element(document.querySelector(`#${this.reportId}`)).summernote('saveRange');
        }
      }
    };

    if (this.isNoteEnabled()) {
      this.initializeInsertNoteButton();
    }

    this.$onChanges = (changes) => {
      if (changes.insertContent && !changes.insertContent.isFirstChange() && changes.insertContent.currentValue) {
        const item = angular.copy(changes.insertContent.currentValue);
        const reportElement = angular.element(document.querySelector(`#${this.reportId}`));
        reportElement.summernote('restoreRange');
        reportElement.summernote('focus');
        const $item = $(`<p notebook-item-id="${item.id}" workgroup-id="${item.workgroupId}">`);
        if (item.groups != null && item.groups.length > 0) {
          $item.attr('group', item.groups);
        }
        const hasAttachments = item.content.attachments && item.content.attachments.length > 0;
        if (item.content.attachments) {
          if (hasAttachments) {
            $item.css('text-align', 'center');
          }
          for (let attachment of item.content.attachments) {
            const $img = $(`<img src="${attachment.iconURL}" alt="notebook image" style="width: 75%; max-width: 100%; height: auto; border: 1px solid #aaaaaa; padding: 8px; margin-bottom: 4px;" />`);
            $img.addClass('notebook-item--report__note-img');
            $item.append($img);
          }
        }
        if (item.content.text) {
          if (hasAttachments) {
            // treat text content as a caption: center it and make it bold
            const $caption = $(`<div><b>${item.content.text}</b></div>`).css({'text-align': 'center'});
            $item.append($caption);
            reportElement.summernote('insertNode', $item[0]);
          } else {
            reportElement.summernote('insertText', item.content.text);
          }
        } else {
          reportElement.summernote('insertNode', $item[0]);
        }
      }
    };

    /**
     * Captures the annotation received event, checks whether the given
     * annotation id matches this report id, updates UI accordingly
     */
    this.$scope.$on('notebookItemAnnotationReceived', (event, args) => {
      const annotation = args.annotation;
      if (annotation.localNotebookItemId === this.reportId) {
        this.hasNewAnnotation = true;
        this.latestAnnotations =
            this.AnnotationService.getLatestNotebookItemAnnotations(this.workgroupId, this.reportId);
      }
    });

    /**
     * Captures the show report annotations event, opens report (if collapsed)
     * and scrolls to the report annotations display
     */
    this.$scope.$on('showReportAnnotations', (args) => {
      if (this.collapsed) {
        this.collapse();
      }

      // scroll to report annotations (bottom)
      const $notebookReportContent = $('.notebook-report__content');
      $timeout(() => {
        $notebookReportContent.animate({
          scrollTop: $notebookReportContent.prop('scrollHeight')
        }, 500);
      }, 500);
    });
  }

  collapse() {
    this.collapsed = !this.collapsed;
    if (this.collapsed) {
      this.onCollapse();
    }
  }

  fullscreen() {
    if (this.collapsed) {
      this.full = true;
      this.collapsed = false;
    } else {
      this.full = !this.full;
    }
  }

  addNotebookItemContent($event) {
    this.onSetInsertMode({value: true, requester: 'report'});
  }

  changed(value) {
    this.dirty = true;
    this.reportItem.content.content = this.ConfigService.removeAbsoluteAssetPaths(value);
  }

  startAutoSaveInterval() {
    this.stopAutoSaveInterval();
    this.autoSaveIntervalId = setInterval(() => {
      if (this.dirty) {
        this.saveNotebookReportItem();
      }
    }, this.autoSaveIntervalMS);
  }

  stopAutoSaveInterval() {
    clearInterval(this.autoSaveIntervalId);
  }

  saveNotebookReportItem() {
    this.reportItem.content.clientSaveTime = Date.parse(new Date());  // set save timestamp
    this.NotebookService.saveNotebookItem(this.reportItem.id, this.reportItem.nodeId, this.reportItem.localNotebookItemId,
      this.reportItem.type, this.reportItem.title, this.reportItem.content, this.reportItem.groups, this.reportItem.content.clientSaveTime)
      .then((result) => {
        if (result) {
          this.dirty = false;
          this.hasNewAnnotation = false;
          this.reportItem.id = result.id; // set the reportNotebookItemId to the newly-incremented id so that future saves during this visit will be an update instead of an insert.
          this.setSavedMessage(this.ConfigService.convertToClientTimestamp(result.serverSaveTime));
        }
      });
  }

  setSavedMessage(time) {
    this.setSaveText(this.$translate('SAVED'), time);
  }

  setSaveText(message, time) {
    this.saveMessage.text = message;
    this.saveMessage.time = time;
  }

  isNoteEnabled() {
    return this.config.itemTypes.note.enabled;
  }

  initializeInsertNoteButton() {
    this.summernoteOptions.toolbar.splice(this.summernoteOptions.toolbar.length - 1, 0,
        ['customButton', ['customButton']]);
    this.summernoteOptions.customButton = {
      // TODO: i18n
      buttonText: 'Insert ' + this.config.itemTypes.note.label.singular + ' +',
      tooltip: 'Insert from ' + this.config.label,
      buttonClass: 'accent-1 notebook-item--report__add-note',
      action: ($event) => {
        this.addNotebookItemContent($event);
      }
    };
  }
}

NotebookReportController.$inject = [
  '$filter',
  '$mdSidenav',
  '$scope',
  '$timeout',
  'AnnotationService',
  'ConfigService',
  'NotebookService',
  'ProjectService'
];

const NotebookReport = {
  bindings: {
    config: '<',
    insertContent: '<',
    insertMode: '<',
    reportId: '<',
    visible: '<',
    workgroupId: '<',
    onCollapse: '&',
    onSetInsertMode: '&',
    mode: '@'
  },
  template:
    `<div ng-if="::$ctrl.mode !== 'classroomMonitor' && ($ctrl.visible && $ctrl.full && !$ctrl.collapsed) || $ctrl.insertMode" class="notebook-report-backdrop"></div>
        <div ng-if="$ctrl.visible" class="notebook-report-container"
              ng-class="{'notebook-report-container__collapsed': $ctrl.collapsed, 'notebook-report-container__full': $ctrl.full && !$ctrl.collapsed}">
            <md-card class="notebook-report md-whiteframe-3dp l-constrained">
                <md-toolbar ng-click="$ctrl.collapsed ? $ctrl.collapse() : return" class="md-toolbar--wise md-toolbar--wise--sm notebook-report__toolbar">
                    <md-toolbar-tools class="md-toolbar-tools">
                        <md-icon>assignment</md-icon>&nbsp;
                        <span ng-if="$ctrl.collapsed" class="overflow--ellipsis notebook-report__toolbar__title">{{::$ctrl.reportItem.content.title}}</span>
                        <span flex></span>
                        <md-button aria-label="{{::'toggleFullScreen' | translate}}" title="{{::'toggleFullScreen' | translate}}" class="md-icon-button notebook-tools--full"
                                   ng-click="$ctrl.fullscreen()">
                            <md-icon ng-if="!$ctrl.full || $ctrl.collapsed"> fullscreen </md-icon>
                            <md-icon ng-if="$ctrl.full && !$ctrl.collapsed"> fullscreen_exit </md-icon>
                        </md-button>
                        <md-button aria-label="{{::'collapse' | translate}}" title="{{::'collapse' | translate}}" class="md-icon-button"
                                   ng-if="!$ctrl.collapsed" ng-click="$event.stopPropagation(); $ctrl.collapse()">
                            <md-icon> arrow_drop_down </md-icon>
                        </md-button>
                        <md-button aria-label="{{::'restore' | translate}}" title="{{'restore' | translate}}" class="md-icon-button"
                                   ng-if="$ctrl.collapsed" ng-click="$event.stopPropagation(); $ctrl.collapse()">
                            <md-icon> arrow_drop_up </md-icon>
                        </md-button>
                    </md-toolbar-tools>
                    <div class="notebook-report__content__header md-whiteframe-1dp" layout="row" layout-align="start center">
                        <span style="color: {{::$ctrl.config.itemTypes.report.label.color}};">{{::$ctrl.reportItem.content.title}}</span>
                        <span flex></span>
                        <md-icon aria-label="{{::$ctrl.reportItem.content.title}} info" style="color: {{::$ctrl.config.itemTypes.report.label.color}};">
                            info
                            <md-tooltip md-direction="left">{{::$ctrl.reportItem.content.prompt}}</md-tooltip>
                        </md-icon>
                    </div>
                </md-toolbar>
                <md-content class="notebook-report__content" flex>
                    <summernote id="{{$ctrl.reportId}}"
                                class="notebook-item--report__content"
                                ng-model="$ctrl.reportItemContent"
                                ng-change="$ctrl.changed($ctrl.reportItemContent)"
                                config="$ctrl.summernoteOptions"></summernote>
                    <notebook-report-annotations annotations="$ctrl.latestAnnotations"
                                                 has-new="$ctrl.hasNewAnnotation"
                                                 max-score="$ctrl.maxScore"></notebook-report-annotations>
                </md-content>
                <md-card-actions class="notebook-report__actions">
                    <div id="{{$ctrl.reportId}}-toolbar"></div>
                    <div layout="row" layout-align="start center">
                        <md-button class="md-primary md-raised button--small"
                                   aria-label="{{ ::'save' | translate }}"
                                   ng-disabled="!$ctrl.dirty"
                                   ng-click="$ctrl.saveNotebookReportItem()">{{ 'save' | translate }}</md-button>
                        <span ng-if="$ctrl.saveMessage.text"
                              class="component__actions__info md-caption">
                              {{$ctrl.saveMessage.text}} <span class="component__actions__more"><md-tooltip md-direction="top">{{ $ctrl.saveMessage.time | amDateFormat:'ddd, MMM D YYYY, h:mm a' }}</md-tooltip><span am-time-ago="$ctrl.saveMessage.time"></span></span>
                        </span>
                    </div>
                </md-card-actions>
            </md-card>
        </div>
        <div ng-if="::$ctrl.mode === 'classroomMonitor'">
            <compile data="$ctrl.reportItemContent"></compile>
            <notebook-item-grading
                notebook-item="$ctrl.reportItem">
            </notebook-item-grading>

        </div>`,
  controller: NotebookReportController
};

export default NotebookReport;
