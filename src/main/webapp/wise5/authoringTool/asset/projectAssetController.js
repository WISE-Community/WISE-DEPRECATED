'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectAssetController = function () {
    function ProjectAssetController($filter, $mdDialog, $rootScope, $state, $stateParams, $scope, $timeout, ConfigService, ProjectAssetService, UtilService) {
        var _this = this;

        _classCallCheck(this, ProjectAssetController);

        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.ConfigService = ConfigService;
        this.ProjectAssetService = ProjectAssetService;
        this.UtilService = UtilService;
        this.$translate = this.$filter('translate');

        this.projectId = this.$stateParams.projectId;
        this.projectAssets = ProjectAssetService.projectAssets;
        this.projectAssetTotalSizeMax = ProjectAssetService.projectAssetTotalSizeMax;
        this.projectAssetUsagePercentage = ProjectAssetService.projectAssetUsagePercentage;

        // whether the asset page is being displayed in a popup
        this.popup = false;
        this.projectId = null;
        this.nodeId = null;
        this.componentId = null;
        this.target = null;

        if (this.$stateParams != null) {
            if (this.$stateParams.popup) {
                // this asset page is being displayed in a popup
                this.popup = true;
            }

            if (this.$stateParams.projectId) {
                // get the project id that opened this popup
                this.projectId = this.$stateParams.projectId;
            }

            if (this.$stateParams.nodeId) {
                // get the node id that opened this popup
                this.nodeId = this.$stateParams.nodeId;
            }

            if (this.$stateParams.componentId) {
                // get the component id that opened this popup
                this.componentId = this.$stateParams.componentId;
            }

            if (this.$stateParams.target) {
                // get the target to put the asset in
                this.target = this.$stateParams.target;
            }
        }

        this.assetSortBy = "aToZ"; // initially sort assets alphabetically
        this.assetMessage = "";

        this.$scope.$watch(function () {
            return _this.projectAssets;
        }, function () {
            _this.projectAssetUsagePercentage = _this.projectAssets.totalFileSize / _this.projectAssetTotalSizeMax * 100;
            _this.sortAssets(_this.assetSortBy); // make sure the assets are sorted by current sort field
        });

        // When user changes sort assets by
        this.$scope.$watch(function () {
            return _this.assetSortBy;
        }, function () {
            _this.sortAssets(_this.assetSortBy);
        });

        // calculate whether the assets are used in the project
        this.ProjectAssetService.calculateAssetUsage();
    }

    _createClass(ProjectAssetController, [{
        key: 'sortAssets',
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
        key: 'sortAssetsAToZ',
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
        key: 'sortAssetsSmallToLarge',
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

        /**
         * Delete an asset from the project
         * @param assetItem the asset to delete
         */

    }, {
        key: 'deleteAsset',
        value: function deleteAsset(assetItem) {
            var _this2 = this;

            // ask the user if they are sure they want to delete the file
            var message = this.$translate("areYouSureYouWantToDeleteThisFile") + "\n\n" + assetItem.fileName;
            var answer = confirm(message);

            if (answer) {
                // the user answered yes to delete the file
                this.ProjectAssetService.deleteAssetItem(assetItem).then(function (newProjectAssets) {
                    _this2.projectAssets = _this2.ProjectAssetService.projectAssets;

                    // calculate whether the assets are used in the project
                    _this2.ProjectAssetService.calculateAssetUsage();
                });
            }
        }

        /**
         * Download an asset
         */

    }, {
        key: 'downloadAsset',
        value: function downloadAsset(assetItem) {
            this.ProjectAssetService.downloadAssetItem(assetItem);
        }

        /**
         * Show asset image in a popup dialog and give author an option to delete it.
         */

    }, {
        key: 'viewAsset',
        value: function viewAsset(assetItem) {
            // Append dialog to document.body
            var assetFullURL = this.ProjectAssetService.getFullAssetItemURL(assetItem);
            var appropriateFileSize = this.$filter('appropriateSizeText')(assetItem.fileSize);
            var confirm = this.$mdDialog.confirm().parent(angular.element(document.body)).title(assetItem.fileName + " (" + appropriateFileSize + ")").htmlContent("<img src=\"" + assetFullURL + "\" />").ok(this.$translate('CLOSE'));
            this.$mdDialog.show(confirm).then(function () {
                // Author wants to simply close the dialog
            }, function () {
                // Author wants to simply close the dialog
            });
        }

        /**
         * The user has chosen an asset to use
         * @param assetItem the asset the user chose
         */

    }, {
        key: 'chooseAsset',
        value: function chooseAsset(assetItem) {
            // fire the event to notify listeners that an asset was selected
            var params = {
                assetItem: assetItem,
                projectId: this.projectId,
                nodeId: this.nodeId,
                componentId: this.componentId,
                target: this.target
            };
            this.$rootScope.$broadcast('assetSelected', params);
        }
    }, {
        key: 'uploadAssetItems',
        value: function uploadAssetItems(files) {
            var _this3 = this;

            this.ProjectAssetService.uploadAssets(files).then(function (uploadAssetsResults) {
                if (uploadAssetsResults && uploadAssetsResults.length > 0) {
                    var uploadedAssetsFilenames = [];
                    for (var r = 0; r < uploadAssetsResults.length; r++) {
                        var uploadAssetsResult = uploadAssetsResults[r];
                        if (typeof uploadAssetsResult.data === 'string') {
                            // there was an error uploading this file, so don't add
                        } else {
                            uploadedAssetsFilenames.push(uploadAssetsResult.config.file.name);
                        }
                    }
                    if (uploadedAssetsFilenames.length > 0) {
                        // show a confirmation message for 7 seconds
                        _this3.assetMessage = _this3.$translate('assetUploadSuccessful', { assetFilenames: uploadedAssetsFilenames.join(", ") });
                        _this3.$timeout(function () {
                            _this3.assetMessage = "";
                        }, 7000);
                    }
                }
                _this3.projectAssets = _this3.ProjectAssetService.projectAssets;

                // calculate whether the assets are used in the project
                _this3.ProjectAssetService.calculateAssetUsage();
            });
        }

        /**
         * Preview an asset in the right panel
         * @param $event The event that caused the asset to be previewed. This will
         * either be a mouseover or click event.
         * @param assetItem the asset item to preview
         */

    }, {
        key: 'previewAsset',
        value: function previewAsset($event, assetItem) {
            if (assetItem != null) {
                this.selectedAssetItem = assetItem;

                // get the file name
                var fileName = assetItem.fileName;

                // get the project assets directory path
                var assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();

                // get the absolute path to the asset file
                var absolutePath = assetsDirectoryPath + '/' + fileName;

                // set the url of the asset so we can preview it
                this.previewAssetURL = absolutePath;

                // clear these flags
                this.assetIsImage = false;
                this.assetIsVideo = false;

                if (this.UtilService.isImage(fileName)) {
                    // the asset in an image
                    this.assetIsImage = true;
                } else if (this.UtilService.isVideo(fileName)) {
                    // the asset is a video
                    this.assetIsVideo = true;
                    $('video').load();
                }
            }
        }

        /**
         * Close the asset view
         */

    }, {
        key: 'exit',
        value: function exit() {
            if (this.popup) {
                // this asset view was opened in a popup
                this.$mdDialog.hide();
            } else {
                // this asset view was opened as a page
                this.$state.go('root.project', { projectId: this.projectId });
            }
        }
    }]);

    return ProjectAssetController;
}();

ProjectAssetController.$inject = ['$filter', '$mdDialog', '$rootScope', '$state', '$stateParams', '$scope', '$timeout', 'ConfigService', 'ProjectAssetService', 'UtilService'];

exports.default = ProjectAssetController;
//# sourceMappingURL=projectAssetController.js.map