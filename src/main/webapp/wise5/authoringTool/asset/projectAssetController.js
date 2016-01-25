'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectAssetController = function () {
    function ProjectAssetController($state, ProjectAssetService) {
        _classCallCheck(this, ProjectAssetController);

        this.$state = $state;
        this.ProjectAssetService = ProjectAssetService;
        this.projectAssets = ProjectAssetService.projectAssets;
        this.projectAssetTotalSizeMax = ProjectAssetService.projectAssetTotalSizeMax;
    }

    _createClass(ProjectAssetController, [{
        key: 'deleteAsset',
        value: function deleteAsset(assetItem) {
            var _this = this;

            this.ProjectAssetService.deleteAssetItem(assetItem).then(function (newProjectAssets) {
                _this.projectAssets = newProjectAssets;
            });
        }
    }, {
        key: 'uploadAssetItems',
        value: function uploadAssetItems(files) {
            var _this2 = this;

            this.ProjectAssetService.uploadAssets(files).then(function (newProjectAssets) {
                _this2.projectAssets = _this2.ProjectAssetService.projectAssets;
            });
        }
    }, {
        key: 'exit',
        value: function exit() {
            this.$state.go('root.project', {});
        }
    }]);

    return ProjectAssetController;
}();

ProjectAssetController.$inject = ['$state', 'ProjectAssetService'];

exports.default = ProjectAssetController;

//# sourceMappingURL=projectAssetController.js.map