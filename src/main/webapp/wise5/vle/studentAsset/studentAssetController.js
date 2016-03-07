'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentAssetController = function () {
    function StudentAssetController($injector, $rootScope, $scope, ConfigService, ProjectService, StudentAssetService) {
        var _this = this;

        _classCallCheck(this, StudentAssetController);

        this.$injector = $injector;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.ConfigService = ConfigService;
        this.mode = this.ConfigService.getMode();
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;

        this.studentAssets = this.StudentAssetService.allAssets;

        this.selectedStudentAsset = null; // This is used when student choose an asset to attach to a component

        this.itemId = null;
        this.item = null;

        this.logOutListener = $scope.$on('logOut', function (event, args) {
            _this.logOutListener();
            _this.$rootScope.$broadcast('componentDoneUnloading');
        });

        // retrieve assets when notebook is opened
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

            // fetch all assets
            this.StudentAssetService.retrieveAssets().then(function (studentAssets) {
                _this2.studentAssets = studentAssets;
            });
        }
    }, {
        key: 'uploadStudentAssets',
        value: function uploadStudentAssets(files) {
            var _this3 = this;

            if (files != null) {
                for (var f = 0; f < files.length; f++) {
                    var file = files[f];
                    this.StudentAssetService.uploadAsset(file).then(function () {
                        _this3.studentAssets = _this3.StudentAssetService.allAssets;
                    });
                }
            }
        }
    }, {
        key: 'deleteStudentAsset',
        value: function deleteStudentAsset(studentAsset) {
            alert('delete student asset not implemented yet');
            /*
             StudentAssetService.deleteAsset(studentAsset).then(angular.bind(this, function(deletedStudentAsset) {
             // remove studentAsset
             this.studentAssets.splice(this.studentAssets.indexOf(deletedStudentAsset), 1);
             this.calculateTotalUsage();
             }));
             */
        }
    }, {
        key: 'studentAssetSelected',
        value: function studentAssetSelected($event, studentAsset) {
            this.selectedStudentAsset = studentAsset;
        }
    }, {
        key: 'attachStudentAssetToComponent',
        value: function attachStudentAssetToComponent($event, studentAsset) {
            this.componentController.attachStudentAsset(studentAsset);
            this.selectedStudentAsset = null; // reset selected student asset
            // TODO: add some kind of unobtrusive confirmation to let student know that the student asset has been added to current component
            $event.stopPropagation(); // prevents parent student asset list item from getting the onclick event so this item won't be re-selected.
        }
    }]);

    return StudentAssetController;
}();

StudentAssetController.$inject = ["$injector", "$rootScope", "$scope", "ConfigService", "ProjectService", "StudentAssetService"];

exports.default = StudentAssetController;
//# sourceMappingURL=studentAssetController.js.map