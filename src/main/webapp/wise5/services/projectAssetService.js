'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectAssetService = function () {
    function ProjectAssetService($q, $http, $rootScope, ConfigService, Upload) {
        _classCallCheck(this, ProjectAssetService);

        this.$q = $q;
        this.$http = $http;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.Upload = Upload;
        this.projectAssets = {};
        this.projectAssetTotalSizeMax = this.ConfigService.getConfigParam('projectAssetTotalSizeMax');
        this.projectAssetUsagePercentage = 0;
    }

    _createClass(ProjectAssetService, [{
        key: 'deleteAssetItem',
        value: function deleteAssetItem(assetItem) {
            var _this = this;

            var projectAssetURL = this.ConfigService.getConfigParam('projectAssetURL');

            var httpParams = {};
            httpParams.method = 'POST';
            httpParams.url = projectAssetURL;
            httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

            var params = {};
            params.assetFileName = assetItem.fileName;
            httpParams.data = $.param(params);

            return this.$http(httpParams).then(function (result) {
                var projectAssetsJSON = result.data;
                _this.projectAssets = projectAssetsJSON;
                return projectAssetsJSON;
            });
        }
    }, {
        key: 'getFullAssetItemURL',
        value: function getFullAssetItemURL(assetItem) {
            return this.ConfigService.getConfigParam('projectBaseURL') + "assets/" + assetItem.fileName;
        }
    }, {
        key: 'retrieveProjectAssets',
        value: function retrieveProjectAssets() {
            var _this2 = this;

            var projectAssetURL = this.ConfigService.getConfigParam('projectAssetURL');

            return this.$http.get(projectAssetURL).then(function (result) {
                var projectAssetsJSON = result.data;
                _this2.projectAssets = projectAssetsJSON;
                return projectAssetsJSON;
            });
        }
    }, {
        key: 'uploadAssets',
        value: function uploadAssets(files) {
            var _this3 = this;

            var projectAssetURL = this.ConfigService.getConfigParam('projectAssetURL');

            var promises = files.map(function (file) {
                return _this3.Upload.upload({
                    url: projectAssetURL,
                    fields: {},
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (result, status, headers, config) {
                    // Only set the projectAssets if the result is an object.
                    // Sometimes it's an error message string.
                    if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object') {
                        // upload was successful.
                        _this3.projectAssets = result;
                        var uploadedFilename = config.file.name;
                        return uploadedFilename;
                    } else if (typeof result === 'string') {
                        // This is an error and should be displayed to the user.
                        alert(result);
                    }

                    return result;
                });
            });
            return this.$q.all(promises);
        }
    }]);

    return ProjectAssetService;
}();

ProjectAssetService.$inject = ['$q', '$http', '$rootScope', 'ConfigService', 'Upload'];

exports.default = ProjectAssetService;
//# sourceMappingURL=projectAssetService.js.map