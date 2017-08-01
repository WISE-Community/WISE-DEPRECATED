"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookLauncherController = function () {
    function NotebookLauncherController($filter, $timeout) {
        _classCallCheck(this, NotebookLauncherController);

        this.$filter = $filter;
        this.$timeout = $timeout;

        this.$translate = this.$filter('translate');

        this.translationData = {
            noteLabel: this.config.itemTypes.note.label.singular
        };

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

    _createClass(NotebookLauncherController, [{
        key: 'fabAction',
        value: function fabAction($event) {
            if (this.notesVisible) {
                this.open($event, 'new');
            } else {
                this.open($event, 'note');
            }
        }
    }, {
        key: 'open',
        value: function open($event, target) {
            $event.stopPropagation();
            this.onOpen({ value: target, event: $event });
            this.isOpen = false;
        }
    }, {
        key: 'fabLabel',
        value: function fabLabel() {
            if (this.notesVisible) {
                return this.$translate('addNote', { noteLabel: this.config.itemTypes.note.label.singular });
            } else {
                return this.config.label;
            }
        }
    }]);

    return NotebookLauncherController;
}();

NotebookLauncherController.$inject = ['$filter', '$timeout'];

var NotebookLauncher = {
    bindings: {
        config: '<',
        noteCount: '<',
        notesVisible: '<',
        onOpen: '&'
    },
    template: '<md-button class="md-scale md-fab md-fab-bottom-right notebook-launcher"\n                    aria-label="{{ $ctrl.fabLabel() }}"\n                    ng-click="$ctrl.fabAction($event)">\n            <md-icon ng-if="!$ctrl.notesVisible">{{ $ctrl.config.icon }}</md-icon>\n            <md-icon ng-if="$ctrl.notesVisible">add</md-icon>\n            <md-tooltip md-direction="top">\n                {{ $ctrl.fabLabel() }}\n            </md-tooltip>\n        </md-button>',
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

exports.default = NotebookLauncher;
//# sourceMappingURL=notebookLauncher.js.map