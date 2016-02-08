'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectAssetController = function () {
    function ProjectAssetController($state, $stateParams, $scope, ProjectAssetService) {
        var _this = this;

        _classCallCheck(this, ProjectAssetController);

        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.projectId = this.$stateParams.projectId;
        this.ProjectAssetService = ProjectAssetService;
        this.projectAssets = ProjectAssetService.projectAssets;
        this.projectAssetTotalSizeMax = ProjectAssetService.projectAssetTotalSizeMax;
        this.projectAssetUsagePercentage = ProjectAssetService.projectAssetUsagePercentage;

        this.$scope.$watch(function () {
            return _this.projectAssets;
        }, angular.bind(this, function () {
            this.projectAssetUsagePercentage = this.projectAssets.totalFileSize / this.projectAssetTotalSizeMax * 100;
        }));
    }

    _createClass(ProjectAssetController, [{
        key: 'deleteAsset',
        value: function deleteAsset(assetItem) {
            var _this2 = this;

            this.ProjectAssetService.deleteAssetItem(assetItem).then(function (newProjectAssets) {
                _this2.projectAssets = _this2.ProjectAssetService.projectAssets;
            });
        }
    }, {
        key: 'uploadAssetItems',
        value: function uploadAssetItems(files) {
            var _this3 = this;

            this.ProjectAssetService.uploadAssets(files).then(function (newProjectAssets) {
                _this3.projectAssets = _this3.ProjectAssetService.projectAssets;
            });
        }
    }, {
        key: 'exit',
        value: function exit() {
            this.$state.go('root.project', { projectId: this.projectId });
        }
    }]);

    return ProjectAssetController;
}();

ProjectAssetController.$inject = ['$state', '$stateParams', '$scope', 'ProjectAssetService'];

exports.default = ProjectAssetController;
//# sourceMappingURL=projectAssetController.js.map