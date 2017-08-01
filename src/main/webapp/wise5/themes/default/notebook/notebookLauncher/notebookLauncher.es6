"use strict";

class NotebookLauncherController {
    constructor($filter,
                $timeout) {
        this.$filter = $filter;
        this.$timeout = $timeout;

        this.$translate = this.$filter('translate');

        this.translationData = {
            noteLabel: this.config.itemTypes.note.label.singular
        }

        //this.tooltipVisible = false;

        /*this.$doCheck = () => {
            // On opening, add a delayed property which shows tooltips after the speed dial has opened
            // so that they have the proper position; if closing, immediately hide the tooltips
            if (this.isOpen) {
                this.$timeout(() => {
                    this.tooltipVisible = this.isOpen;
                }, 500);
            } else {
                this.tooltipVisible = this.isOpen;
            }
        }*/
    }

    /*mouseenter($event) {
        if (this.notesVisible) {
            return;
        } else {
            this.isOpen = true;
        }
    }

    mouseleave($event) {
        if (this.notesVisible) {
            return;
        } else {
            this.isOpen = false;
        }
    }

    mainClick($event) {
        if (this.notesVisible) {
            this.open($event, 'new');
        } else {
            this.isOpen = !this.isOpen;
        }
    }*/

    fabAction($event) {
        if (this.notesVisible) {
            this.open($event, 'new');
        } else {
            this.open($event, 'note');
        }
    }

    open($event, target) {
        $event.stopPropagation();
        this.onOpen({value: target, event: $event});
        this.isOpen = false;
    }

    fabLabel() {
        if (this.notesVisible) {
            return this.$translate('addNote', { noteLabel: this.config.itemTypes.note.label.singular });
        } else {
            return this.config.label;
        }
    }
}

NotebookLauncherController.$inject = [
    '$filter',
    '$timeout'
];

const NotebookLauncher = {
    bindings: {
        config: '<',
        noteCount: '<',
        notesVisible: '<',
        onOpen: '&'
    },
    template:
        `<md-button class="md-scale md-fab md-fab-bottom-right notebook-launcher"
                    aria-label="{{ $ctrl.fabLabel() }}"
                    ng-click="$ctrl.fabAction($event)">
            <md-icon ng-if="!$ctrl.notesVisible">{{ $ctrl.config.icon }}</md-icon>
            <md-icon ng-if="$ctrl.notesVisible">add</md-icon>
            <md-tooltip md-direction="top">
                {{ $ctrl.fabLabel() }}
            </md-tooltip>
        </md-button>`,
        /*<md-fab-speed-dial md-direction="up" md-open="$ctrl.isOpen"
                            ng-mouseenter="$ctrl.mouseenter($event)"
                            ng-mouseleave="$ctrl.mouseleave($event)"
                            ng-click="$ctrl.mainClick($event)"
                            class="md-scale md-fab-bottom-right notebook-launcher">
            <md-fab-trigger>
                <md-button aria-label="{{$ctrl.fabLabel()}}" class="md-fab md-accent">
                    <md-icon ng-if="!$ctrl.notesVisible">{{$ctrl.config.icon}}</md-icon>
                    <md-icon ng-if="$ctrl.notesVisible">add</md-icon>
                    <span>{{$ctrl.noteCount}}</span>
                </md-button>
            </md-fab-trigger>
            <md-fab-actions>
                <div layout="column" ng-show="!$ctrl.notesVisible">
                    <md-button ng-repeat="item in $ctrl.config.itemTypes | toArray" ng-if="item.enabled && item.$key !== 'report'"
                               aria-label="{{item.label.link}}" class="md-fab md-raised md-mini"
                               ng-click="$ctrl.open($event, item.type)">
                        <md-tooltip md-direction="left" md-autohide="false" md-visible="$ctrl.tooltipVisible && !$ctrl.notesVisible">
                            {{item.label.link}}
                        </md-tooltip>

                        <md-icon aria-label="{{item.label.link}}" style="color: {{item.label.color}};">{{item.label.icon}}</md-icon>
                    </md-button>
                    <md-button ng-if="$ctrl.config.enableAddNew" aria-label="{{ 'addNote' | translate:$ctrl.translationData }}" class="md-fab md-raised md-mini"
                               ng-click="$ctrl.open($event, 'new')">
                        <md-tooltip md-direction="left" md-autohide="false" md-visible="$ctrl.tooltipVisible && !$ctrl.notesVisible">
                            {{ 'addNote' | translate:$ctrl.translationData }}
                        </md-tooltip>
                        <md-icon class="accent">{{$ctrl.config.addIcon}}</md-icon>
                    </md-button>
                </div>
            </md-fab-actions>
        </md-fab-speed-dial>`,*/
    controller: NotebookLauncherController
};

export default NotebookLauncher;
