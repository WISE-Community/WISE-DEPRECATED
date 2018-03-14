"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookNotesController = function () {
    function NotebookNotesController($filter, $rootScope, NotebookService) {
        var _this = this;

        _classCallCheck(this, NotebookNotesController);

        this.$translate = $filter('translate');
        this.$rootScope = $rootScope;
        this.NotebookService = NotebookService;

        this.publicNotebookItems = this.NotebookService.publicNotebookItems;

        this.$onInit = function () {
            _this.color = _this.config.itemTypes.note.label.color;
        };

        this.$onChanges = function (changes) {
            if (changes.notebook) {
                _this.notebook = angular.copy(changes.notebook.currentValue);
                _this.hasNotes = Object.keys(_this.notebook.items).length ? true : false;
            }
        };
    }

    _createClass(NotebookNotesController, [{
        key: 'getTitle',
        value: function getTitle() {
            var title = '';
            if (this.insertMode) {
                title = this.$translate('selectItemToInsert');
            } else {
                title = this.config.itemTypes.note.label.link;
            }
            return title;
        }
    }, {
        key: 'deleteItem',
        value: function deleteItem($ev, $itemId) {
            var doDelete = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            this.$rootScope.$broadcast('deleteNote', { itemId: $itemId, ev: $ev });
        }
    }, {
        key: 'reviveItem',
        value: function reviveItem(ev, itemId) {
            this.$rootScope.$broadcast('reviveNote', { itemId: $itemId, ev: $ev });
        }
    }, {
        key: 'editItem',
        value: function editItem($ev, $itemId) {
            //this.NotebookService.editItem(ev, itemId);
            this.$rootScope.$broadcast('editNote', { itemId: $itemId, ev: $ev });
        }
    }, {
        key: 'select',
        value: function select($ev, $itemId) {
            if (this.insertMode) {
                this.onInsert({ value: $itemId, event: $ev });
            } else {
                this.editItem($ev, $itemId);
            }
        }
    }, {
        key: 'edit',
        value: function edit(itemId) {
            alert("Edit the item: " + itemId);
        }
    }, {
        key: 'close',
        value: function close($event) {
            this.onClose($event);
        }
    }, {
        key: 'cancelInsertMode',
        value: function cancelInsertMode($event) {
            this.onSetInsertMode({ value: false });
        }
    }]);

    return NotebookNotesController;
}();

NotebookNotesController.$inject = ['$filter', '$rootScope', 'NotebookService'];

var NotebookNotes = {
    bindings: {
        config: '<',
        insertMode: '<',
        notebook: '<',
        publicNotebookItems: '<',
        notesVisible: '<',
        workgroupId: '<',
        onClose: '&',
        onInsert: '&',
        onSetInsertMode: '&'
    },
    template: '<md-sidenav md-component-id="notes"\n                     md-is-open="$ctrl.notesVisible"\n                     md-whiteframe="4"\n                     md-disable-backdrop\n                     layout="column"\n                     class="md-sidenav-right notebook-sidebar">\n            <md-toolbar>\n                <div class="md-toolbar-tools"\n                     ng-class="{\'insert-mode\': $ctrl.insertMode}"\n                     style="background-color: {{$ctrl.color}};">\n                    {{$ctrl.getTitle()}}\n                    <!--<md-button ng-if="$ctrl.insertMode"\n                               ng-click="$ctrl.cancelInsertMode($event)"\n                               md-theme="default"\n                               class="md-accent button--small"\n                               aria-label="{{ \'Cancel\' | translate }}">\n                        {{ \'Cancel\' | translate }}\n                    </md-button>-->\n                    <span flex></span>\n                    <md-button ng-click="$ctrl.close($event)"\n                               class="md-icon-button"\n                               aria-label="{{ \'Close\' | translate }}">\n                        <md-icon>close</md-icon>\n                    </md-button>\n                </div>\n            </md-toolbar>\n            <md-content>\n                <div class="notebook-items" ng-class="{\'notebook-items--insert\': $ctrl.insertMode}" layout="row" layout-wrap>\n                    <div class="md-padding" ng-if="!$ctrl.hasNotes" translate="noNotes" translate-value-term="{{$ctrl.config.itemTypes.note.label.plural}}"></div>\n                    <notebook-item ng-repeat="(localNotebookItemId, notes) in $ctrl.notebook.items"\n                                 ng-if="notes.last().type === \'note\'"\n                                 config="$ctrl.config"\n                                 item-id="localNotebookItemId"\n                                 is-edit-allowed="!$ctrl.insertMode"\n                                 is-choose-mode="$ctrl.insertMode"\n                                 workgroup-id="$ctrl.workgroupId"\n                                 on-select="$ctrl.select($ev, $itemId)"\n                                 on-delete="$ctrl.deleteItem($ev, $itemId)"\n                                 style="display: flex;"\n                                 flex="100"\n                                 flex-gt-xs="50">\n                    </notebook-item>\n                    <notebook-item ng-repeat="note in $ctrl.publicNotebookItems.public"\n                                 config="$ctrl.config"\n                                 group="public"\n                                 item-id="note.localNotebookItemId"\n                                 is-edit-allowed="false"\n                                 is-choose-mode="$ctrl.insertMode"\n                                 workgroup-id="note.workgroupId"\n                                 on-select="$ctrl.select($ev, $itemId)"\n                                 on-delete="$ctrl.deleteItem($ev, $itemId)"\n                                 style="display: flex;"\n                                 flex="100"\n                                 flex-gt-xs="50">\n                    </notebook-item>\n\n                    <!-- TODO: show deleted items somewhere\n                        <notebook-item ng-repeat="(localNotebookItemId, notes) in $ctrl.notebook.deletedItems"\n                                       ng-if="notes.last().type === \'note\'"\n                                       config="$ctrl.config"\n                                       item-id="localNotebookItemId"\n                                       is-edit-allowed="!$ctrl.insertMode"\n                                       is-choose-mode="$ctrl.insertMode"\n                                       workgroup-id="$ctrl.workgroupId"\n                                       on-select="$ctrl.select($ev, $itemId)"\n                                       on-revive="$ctrl.deleteItem($ev, $itemId)"\n                                       style="display: flex;"\n                                       flex="100"\n                                       flex-gt-xs="50">\n                        </notebook-item>\n                    -->\n                </div> <!-- TODO: add questions when supported -->\n            </md-content>\n        </md-sidenav>',
    controller: NotebookNotesController
};

exports.default = NotebookNotes;
//# sourceMappingURL=notebookNotes.js.map
