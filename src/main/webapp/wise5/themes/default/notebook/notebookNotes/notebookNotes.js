"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookNotesController = function () {
  function NotebookNotesController($filter, $rootScope, $scope, NotebookService, ProjectService) {
    var _this = this;

    _classCallCheck(this, NotebookNotesController);

    this.$translate = $filter('translate');
    this.$rootScope = $rootScope;
    this.NotebookService = NotebookService;
    this.ProjectService = ProjectService;
    this.groups = [];
    this.selectedTabIndex = 0;
    this.$scope = $scope;
    this.publicNotebookItems = this.NotebookService.publicNotebookItems;
    this.groupNameToGroup = {};

    var personalGroup = {
      title: "Personal",
      name: "private",
      isEditAllowed: true,
      items: []
    };
    this.groupNameToGroup['private'] = personalGroup;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.entries(this.notebook.items)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _step$value = _slicedToArray(_step.value, 2),
            personalItemKey = _step$value[0],
            personalItemValue = _step$value[1];

        if (personalItemValue.last().type === 'note') {
          personalGroup.items.push(personalItemValue.last());
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    ;

    this.groups.push(personalGroup);

    var spaces = this.ProjectService.getSpaces();
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = spaces[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var space = _step2.value;

        if (space.isShowInNotebook) {
          var spaceGroup = {
            title: space.name,
            name: space.id,
            isEditAllowed: true,
            items: []
          };
          this.groupNameToGroup[space.id] = spaceGroup;
          this.groups.push(spaceGroup);
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    this.$onInit = function () {
      _this.color = _this.config.itemTypes.note.label.color;
    };

    this.$onChanges = function (changes) {
      if (changes.notebook) {
        _this.notebook = angular.copy(changes.notebook.currentValue);
        _this.hasNotes = Object.keys(_this.notebook.items).length ? true : false;
      }
    };

    this.$rootScope.$on('publicNotebookItemsRetrieved', function (event, args) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = _this.groups[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var group = _step3.value;

          if (group.name != 'private') {
            group.items = _this.publicNotebookItems[group.name];
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      _this.selectedTabIndex = 0;
    });

    this.$rootScope.$on('notebookUpdated', function (event, args) {
      var notebookItem = args.notebookItem;
      if (notebookItem.groups == null || notebookItem.groups.length == 0) {
        _this.updatePrivateNotebookNote(notebookItem);
      }
      if (notebookItem.groups != null && notebookItem.groups.includes('public')) {
        _this.updatePublicNotebookNote(notebookItem);
      }
    });
  }

  _createClass(NotebookNotesController, [{
    key: "updatePrivateNotebookNote",
    value: function updatePrivateNotebookNote(notebookItem) {
      this.updateNotebookNote(this.groupNameToGroup['private'], notebookItem.localNotebookItemId, notebookItem.workgroupId, notebookItem);
      if (this.groupNameToGroup['public'] != null) {
        this.removeNotebookNote(this.groupNameToGroup['public'], notebookItem.localNotebookItemId, notebookItem.workgroupId);
      }
    }
  }, {
    key: "updatePublicNotebookNote",
    value: function updatePublicNotebookNote(notebookItem) {
      this.updateNotebookNote(this.groupNameToGroup['public'], notebookItem.localNotebookItemId, notebookItem.workgroupId, notebookItem);
      this.removeNotebookNote(this.groupNameToGroup['private'], notebookItem.localNotebookItemId, notebookItem.workgroupId);
    }
  }, {
    key: "updateNotebookNote",
    value: function updateNotebookNote(group, localNotebookItemId, workgroupId, notebookItem) {
      var added = false;
      var items = group.items;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.localNotebookItemId == localNotebookItemId && item.workgroupId == workgroupId) {
          items[i] = notebookItem;
          added = true;
        }
      }
      if (!added) {
        items.push(notebookItem);
      }
    }
  }, {
    key: "removeNotebookNote",
    value: function removeNotebookNote(group, localNotebookItemId, workgroupId) {
      var items = group.items;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.localNotebookItemId == localNotebookItemId && item.workgroupId == workgroupId) {
          items.splice(i, 1);
          i--;
        }
      }
    }
  }, {
    key: "getTitle",
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
    key: "editItem",
    value: function editItem($ev, $itemId) {
      this.$rootScope.$broadcast('editNote', { itemId: $itemId, ev: $ev });
    }
  }, {
    key: "select",
    value: function select($ev, $itemId) {
      if (this.insertMode) {
        this.onInsert({ value: $itemId, event: $ev });
      } else {
        this.editItem($ev, $itemId);
      }
    }
  }, {
    key: "edit",
    value: function edit(itemId) {
      alert("Edit the item: " + itemId);
    }
  }, {
    key: "close",
    value: function close($event) {
      this.onClose($event);
    }
  }, {
    key: "cancelInsertMode",
    value: function cancelInsertMode($event) {
      this.onSetInsertMode({ value: false });
    }
  }]);

  return NotebookNotesController;
}();

NotebookNotesController.$inject = ['$filter', '$rootScope', '$scope', 'NotebookService', 'ProjectService'];

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
  template: "<md-sidenav md-component-id=\"notes\"\n        md-is-open=\"$ctrl.notesVisible\"\n        md-whiteframe=\"4\"\n        md-disable-backdrop\n        layout=\"column\"\n        class=\"md-sidenav-right notebook-sidebar\">\n      <md-toolbar>\n          <div class=\"md-toolbar-tools\"\n               ng-class=\"{'insert-mode': $ctrl.insertMode}\"\n               style=\"background-color: {{$ctrl.color}};\">\n              {{$ctrl.getTitle()}}\n              <span flex></span>\n              <md-button ng-click=\"$ctrl.close($event)\"\n                  class=\"md-icon-button\"\n                  aria-label=\"{{ 'Close' | translate }}\">\n                <md-icon>close</md-icon>\n              </md-button>\n          </div>\n      </md-toolbar>\n      <md-content>\n      <md-tabs md-selected=\"$ctrl.selectedTabIndex\" md-dynamic-height md-border-bottom md-autoselect md-swipe-content>\n        <md-tab ng-repeat=\"group in $ctrl.groups\"\n            ng-disabled=\"group.disabled\"\n            label=\"{{group.title}}\">\n          <div class=\"demo-tab tab{{$index%4}}\" style=\"padding: 25px; text-align: center;\">\n              <div class=\"notebook-items\" ng-class=\"{'notebook-items--insert': $ctrl.insertMode}\" layout=\"row\" layout-wrap>\n                <div class=\"md-padding\" ng-if=\"!$ctrl.hasNotes\" translate=\"noNotes\" translate-value-term=\"{{$ctrl.config.itemTypes.note.label.plural}}\"></div>\n                <notebook-item ng-repeat=\"note in group.items\"\n                    config=\"$ctrl.config\"\n                    group=\"{{group.name}}\"\n                    item-id=\"note.localNotebookItemId\"\n                    is-edit-allowed=\"group.isEditAllowed\"\n                    is-choose-mode=\"$ctrl.insertMode\"\n                    workgroup-id=\"note.workgroupId\"\n                    on-select=\"$ctrl.select($ev, $itemId)\"\n                    style=\"display: flex;\"\n                    flex=\"100\"\n                    flex-gt-xs=\"50\">\n                </notebook-item>\n            </div>\n          </div>\n        </md-tab>\n      </md-tabs>\n      </md-content>\n    </md-sidenav>",
  controller: NotebookNotesController
};

exports.default = NotebookNotes;
//# sourceMappingURL=notebookNotes.js.map
