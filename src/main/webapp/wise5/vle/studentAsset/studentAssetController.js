'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentAssetController = function () {
  function StudentAssetController($filter, $injector, $rootScope, $scope, ConfigService, ProjectService, StudentAssetService) {
    var _this = this;

    _classCallCheck(this, StudentAssetController);

    this.$filter = $filter;
    this.$injector = $injector;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.ConfigService = ConfigService;
    this.mode = this.ConfigService.getMode();
    this.ProjectService = ProjectService;
    this.StudentAssetService = StudentAssetService;
    this.$translate = this.$filter('translate');
    this.studentAssets = this.StudentAssetService.allAssets;
    this.itemId = null;
    this.item = null;

    this.logOutListener = $scope.$on('logOut', function (event, args) {
      _this.logOutListener();
      _this.$rootScope.$broadcast('componentDoneUnloading');
    });

    if (!this.ConfigService.isPreview()) {
      this.retrieveStudentAssets();
    }
  }

  _createClass(StudentAssetController, [{
    key: 'getTemplateUrl',
    value: function getTemplateUrl() {
      return this.templateUrl;
    }
  }, {
    key: 'retrieveStudentAssets',
    value: function retrieveStudentAssets() {
      var _this2 = this;

      this.StudentAssetService.retrieveAssets().then(function (studentAssets) {
        _this2.studentAssets = studentAssets;
      });
    }
  }, {
    key: 'uploadStudentAssets',
    value: function uploadStudentAssets(files) {
      var _this3 = this;

      if (files != null) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var file = _step.value;

            this.StudentAssetService.uploadAsset(file).then(function (studentAsset) {
              if (_this3.componentController != null) {
                // If the student asset dialog is a part of a component (e.g. attaching image to OR or Discussion)
                // Also attach the file(s) to the componentstate's attachments
                _this3.componentController.attachStudentAsset(studentAsset);
              }
              _this3.studentAssets = _this3.StudentAssetService.allAssets;
            });
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
      }
    }
  }, {
    key: 'deleteStudentAsset',
    value: function deleteStudentAsset(studentAsset) {
      alert(this.$translate('deleteStudentAssetNotImplementedYet'));
    }
  }, {
    key: 'attachStudentAssetToComponent',
    value: function attachStudentAssetToComponent($event, studentAsset) {
      if (this.componentController != null) {
        // If the student asset dialog is a part of a component (e.g. attaching image to OR or Discussion)
        // Also attach the file(s) to the componentstate's attachments
        this.componentController.attachStudentAsset(studentAsset);
        // TODO: add some kind of unobtrusive confirmation to let student know that the student asset has been added to current component
        $event.stopPropagation(); // prevents parent student asset list item from getting the onclick event so this item won't be re-selected.
      }
    }
  }]);

  return StudentAssetController;
}();

StudentAssetController.$inject = ["$filter", "$injector", "$rootScope", "$scope", "ConfigService", "ProjectService", "StudentAssetService"];

exports.default = StudentAssetController;
//# sourceMappingURL=studentAssetController.js.map
