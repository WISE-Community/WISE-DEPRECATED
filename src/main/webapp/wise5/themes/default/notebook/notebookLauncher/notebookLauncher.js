"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookLauncherController = function () {
    function NotebookLauncherController($filter, $timeout) {
        var _this = this;

        _classCallCheck(this, NotebookLauncherController);

        this.$filter = $filter;
        this.$timeout = $timeout;

        this.$translate = this.$filter('translate');

        this.translationData = {
            noteLabel: this.config.itemTypes.note.label.singular
        };

        //this.isOpen = false;
        this.tooltipVisible = false;

        this.$doCheck = function () {
            // On opening, add a delayed property which shows tooltips after the speed dial has opened
            // so that they have the proper position; if closing, immediately hide the tooltips
            if (_this.isOpen) {
                _this.$timeout(function () {
                    _this.tooltipVisible = _this.isOpen;
                }, 500);
            } else {
                _this.tooltipVisible = _this.isOpen;
            }
        };
    }

    _createClass(NotebookLauncherController, [{
        key: 'mouseenter',
        value: function mouseenter($event) {
            if (this.notesVisible) {
                return;
            } else {
                this.isOpen = true;
            }
        }
    }, {
        key: 'mouseleave',
        value: function mouseleave($event) {
            if (this.notesVisible) {
                return;
            } else {
                this.isOpen = false;
            }
        }
    }, {
        key: 'mainClick',
        value: function mainClick($event) {
            if (this.notesVisible) {
                this.open($event, 'new');
            } else {
                this.isOpen = !this.isOpen;
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
    template: '<md-fab-speed-dial md-direction="up" md-open="$ctrl.isOpen"\n                            ng-mouseenter="$ctrl.mouseenter($event)"\n                            ng-mouseleave="$ctrl.mouseleave($event)"\n                            ng-click="$ctrl.mainClick($event)"\n                            class="md-scale md-fab-bottom-right notebook-launcher">\n            <md-fab-trigger>\n                <md-button aria-label="{{$ctrl.fabLabel()}}" class="md-fab md-accent">\n                    <md-icon ng-if="!$ctrl.notesVisible">{{$ctrl.config.icon}}</md-icon>\n                    <md-icon ng-if="$ctrl.notesVisible">add</md-icon>\n                    <span>{{$ctrl.noteCount}}</span>\n                </md-button>\n            </md-fab-trigger>\n            <md-fab-actions>\n                <div layout="column" ng-show="!$ctrl.notesVisible">\n                    <md-button ng-repeat="item in $ctrl.config.itemTypes | toArray" ng-if="item.enabled && item.$key !== \'report\'"\n                               aria-label="{{item.label.link}}" class="md-fab md-raised md-mini"\n                               ng-click="$ctrl.open($event, item.type)">\n                        <md-tooltip md-direction="left" md-autohide="false" md-visible="$ctrl.tooltipVisible && !$ctrl.notesVisible">\n                            {{item.label.link}}\n                        </md-tooltip>\n\n                        <md-icon aria-label="{{item.label.link}}" style="color: {{item.label.color}};">{{item.label.icon}}</md-icon>\n                    </md-button>\n                    <md-button ng-if="$ctrl.config.enableAddNew" aria-label="{{ \'addNote\' | translate:$ctrl.translationData }}" class="md-fab md-raised md-mini"\n                               ng-click="$ctrl.open($event, \'new\')">\n                        <md-tooltip md-direction="left" md-autohide="false" md-visible="$ctrl.tooltipVisible && !$ctrl.notesVisible">\n                            {{ \'addNote\' | translate:$ctrl.translationData }}\n                        </md-tooltip>\n                        <md-icon class="accent">{{$ctrl.config.addIcon}}</md-icon>\n                    </md-button>\n                </div>\n            </md-fab-actions>\n        </md-fab-speed-dial>',
    controller: NotebookLauncherController
};

exports.default = NotebookLauncher;
//# sourceMappingURL=notebookLauncher.js.map