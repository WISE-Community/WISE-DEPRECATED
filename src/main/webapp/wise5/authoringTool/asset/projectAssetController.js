'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectAssetController = function () {
    function ProjectAssetController($state, $stateParams, $scope, $timeout, $translate, ProjectAssetService) {
        var _this = this;

        _classCallCheck(this, ProjectAssetController);

        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.$translate = $translate;
        this.projectId = this.$stateParams.projectId;
        this.ProjectAssetService = ProjectAssetService;
        this.projectAssets = ProjectAssetService.projectAssets;
        this.projectAssetTotalSizeMax = ProjectAssetService.projectAssetTotalSizeMax;
        this.projectAssetUsagePercentage = ProjectAssetService.projectAssetUsagePercentage;

        this.assetSortBy = "aToZ"; // initially sort assets alphabetically
        this.assetMessage = "";

        this.$scope.$watch(function () {
            return _this.projectAssets;
        }, function () {
            _this.projectAssetUsagePercentage = _this.projectAssets.totalFileSize / _this.projectAssetTotalSizeMax * 100;
        });

        // When user changes sort assets by
        this.$scope.$watch(function () {
            return _this.assetSortBy;
        }, function () {
            _this.sortAssets(_this.assetSortBy);
        });
    }

    _createClass(ProjectAssetController, [{
        key: "sortAssets",
        value: function sortAssets(sortBy) {
            if (sortBy === "aToZ") {
                this.projectAssets.files.sort(this.sortAssetsAToZ);
            } else if (sortBy === "zToA") {
                var files = this.projectAssets.files;
                this.projectAssets.files = files.sort(this.sortAssetsAToZ).reverse();
            } else if (sortBy === "smallToLarge") {
                this.projectAssets.files.sort(this.sortAssetsSmallToLarge);
            } else if (sortBy === "largeToSmall") {
                var _files = this.projectAssets.files;
                this.projectAssets.files = _files.sort(this.sortAssetsSmallToLarge).reverse();
            }
        }
    }, {
        key: "sortAssetsAToZ",
        value: function sortAssetsAToZ(a, b) {
            var aFileName = a.fileName.toLowerCase();
            var bFileName = b.fileName.toLowerCase();
            var result = 0;

            if (aFileName < bFileName) {
                result = -1;
            } else if (aFileName > bFileName) {
                result = 1;
            }
            return result;
        }
    }, {
        key: "sortAssetsSmallToLarge",
        value: function sortAssetsSmallToLarge(a, b) {
            var aFileSize = a.fileSize;
            var bFileSize = b.fileSize;
            var result = 0;

            if (aFileSize < bFileSize) {
                result = -1;
            } else if (aFileSize > bFileSize) {
                result = 1;
            }
            return result;
        }
    }, {
        key: "deleteAsset",
        value: function deleteAsset(assetItem) {
            var _this2 = this;

            this.ProjectAssetService.deleteAssetItem(assetItem).then(function (newProjectAssets) {
                _this2.projectAssets = _this2.ProjectAssetService.projectAssets;
            });
        }
    }, {
        key: "uploadAssetItems",
        value: function uploadAssetItems(files) {
            var _this3 = this;

            this.ProjectAssetService.uploadAssets(files).then(function (uploadAssetsResults) {
                if (uploadAssetsResults && uploadAssetsResults.length > 0) {
                    var uploadedAssetsFilenames = [];
                    for (var r = 0; r < uploadAssetsResults.length; r++) {
                        var uploadAssetsResult = uploadAssetsResults[r];
                        uploadedAssetsFilenames.push(uploadAssetsResult.config.file.name);
                    }
                    _this3.$translate('assetUploadSuccessful', { assetFilenames: uploadedAssetsFilenames.join(", ") }).then(function (assetUploadSuccessful) {
                        // show a confirmation message for 7 seconds
                        _this3.assetMessage = assetUploadSuccessful;
                        _this3.$timeout(function () {
                            _this3.assetMessage = "";
                        }, 7000);
                    });
                }
                _this3.projectAssets = _this3.ProjectAssetService.projectAssets;
            });
        }
    }, {
        key: "exit",
        value: function exit() {
            this.$state.go('root.project', { projectId: this.projectId });
        }
    }]);

    return ProjectAssetController;
}();

ProjectAssetController.$inject = ['$state', '$stateParams', '$scope', '$timeout', '$translate', 'ProjectAssetService'];

exports.default = ProjectAssetController;
//# sourceMappingURL=projectAssetController.js.map