'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
        this.projectAssetURL = this.ConfigService.getConfigParam('projectAssetURL');
        this.projectAssetTotalSizeMax = this.ConfigService.getConfigParam('projectAssetTotalSizeMax');
        this.projectAssetUsagePercentage = 0;
    }

    _createClass(ProjectAssetService, [{
        key: 'deleteAssetItem',
        value: function deleteAssetItem(assetItem) {
            var _this = this;

            var httpParams = {};
            httpParams.method = 'POST';
            httpParams.url = this.projectAssetURL;
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
        key: 'retrieveProjectAssets',
        value: function retrieveProjectAssets() {
            var _this2 = this;

            return this.$http.get(this.projectAssetURL).then(function (result) {
                var projectAssetsJSON = result.data;
                _this2.projectAssets = projectAssetsJSON;
                return projectAssetsJSON;
            });
        }
    }, {
        key: 'uploadAssets',
        value: function uploadAssets(files) {
            var _this3 = this;

            var promises = files.map(function (file) {
                return _this3.Upload.upload({
                    url: _this3.projectAssetURL,
                    fields: {},
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (result, status, headers, config) {
                    //console.log('file ' + config.file.name + 'uploaded. Response: ' + JSON.stringify(result));
                    _this3.projectAssets = result;
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