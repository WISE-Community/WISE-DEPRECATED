'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentAssetService = function () {
  function StudentAssetService($filter, $http, $q, Upload, $rootScope, ConfigService) {
    _classCallCheck(this, StudentAssetService);

    this.$filter = $filter;
    this.$http = $http;
    this.$q = $q;
    this.Upload = Upload;
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;

    this.$translate = this.$filter('translate');

    this.allAssets = []; // keep track of student's assets
  }

  _createClass(StudentAssetService, [{
    key: 'getAssetById',
    value: function getAssetById(assetId) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.allAssets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var asset = _step.value;

          if (asset.id === assetId) {
            return asset;
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

      return null;
    }
  }, {
    key: 'retrieveAssets',
    value: function retrieveAssets() {
      var _this = this;

      if (this.ConfigService.isPreview()) {
        // if we're in preview, don't make any request to the server but pretend we did
        this.allAssets = [];
        var deferred = this.$q.defer();
        deferred.resolve(this.allAssets);
        return deferred.promise;
      } else {
        var config = {
          method: "GET",
          url: this.ConfigService.getStudentAssetsURL(),
          params: {
            workgroupId: this.ConfigService.getWorkgroupId()
          }
        };
        return this.$http(config).then(function (response) {
          // loop through the assets and make them into JSON object with more details
          var result = [];
          var assets = response.data;
          var studentUploadsBaseURL = _this.ConfigService.getStudentUploadsBaseURL();
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = assets[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var asset = _step2.value;

              if (!asset.isReferenced && asset.serverDeleteTime == null && asset.fileName !== '.DS_Store') {
                asset.url = studentUploadsBaseURL + asset.filePath;
                if (_this.isImage(asset)) {
                  asset.type = 'image';
                  asset.iconURL = asset.url;
                } else if (_this.isAudio(asset)) {
                  asset.type = 'audio';
                  asset.iconURL = 'wise5/vle/notebook/audio.png';
                } else {
                  asset.type = 'file';
                  asset.iconURL = 'wise5/vle/notebook/file.png';
                }
                result.push(asset);
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

          _this.allAssets = result;
          return result;
        });
      }
    }
  }, {
    key: 'getAssetContent',
    value: function getAssetContent(asset) {
      var assetContentURL = asset.url;

      // retrieve the csv file and parse it
      var config = {};
      config.method = 'GET';
      config.url = assetContentURL;
      return this.$http(config).then(function (response) {
        return response.data;
      });
    }
  }, {
    key: 'isImage',
    value: function isImage(asset) {
      var isImage = false;
      var imageFileExtensions = ['png', 'jpg', 'jpeg', 'gif'];
      if (asset != null) {
        var assetURL = asset.url;
        if (assetURL != null && assetURL.lastIndexOf('.') !== -1) {
          var assetExtension = assetURL.substring(assetURL.lastIndexOf('.') + 1);
          if (imageFileExtensions.indexOf(assetExtension.toLowerCase()) != -1) {
            isImage = true;
          }
        }
      }
      return isImage;
    }
  }, {
    key: 'isAudio',
    value: function isAudio(asset) {
      var isAudio = false;
      var imageFileExtensions = ['wav', 'mp3', 'ogg', 'm4a', 'm4p', 'raw', 'aiff'];
      if (asset != null) {
        var assetURL = asset.url;
        if (assetURL != null && assetURL.lastIndexOf('.') != -1) {
          var assetExtension = assetURL.substring(assetURL.lastIndexOf('.') + 1);
          if (imageFileExtensions.indexOf(assetExtension.toLowerCase()) != -1) {
            isAudio = true;
          }
        }
      }
      return isAudio;
    }
  }, {
    key: 'uploadAsset',
    value: function uploadAsset(file) {
      var _this2 = this;

      if (this.ConfigService.isPreview()) {
        return this.$q(function (resolve, reject) {
          var reader = new FileReader();

          // Closure to capture the file information.
          reader.onload = function (theFile) {
            return function (e) {
              var fileSrc = e.target.result;
              var fileName = theFile.name;

              var asset = {};
              asset.file = file;
              asset.url = fileSrc;
              // assume this is an image for now. in the future, support audio and other file formats.
              asset.type = 'image';
              asset.iconURL = asset.url;

              _this2.allAssets.push(asset);
              _this2.$rootScope.$broadcast('studentAssetsUpdated');
              return resolve(asset);
            };
          }(file);

          // Read in the image file as a data URL.
          reader.readAsDataURL(file);
        });
      } else {
        var studentAssetsURL = this.ConfigService.getStudentAssetsURL();
        var deferred = this.$q.defer();

        this.Upload.upload({
          url: studentAssetsURL,
          fields: {
            'runId': this.ConfigService.getRunId(),
            'workgroupId': this.ConfigService.getWorkgroupId(),
            'periodId': this.ConfigService.getPeriodId(),
            'clientSaveTime': Date.parse(new Date())
          },
          file: file
        }).success(function (asset, status, headers, config) {
          if (asset === "error") {
            alert(_this2.$translate('THERE_WAS_AN_ERROR_UPLOADING'));
          } else {
            var studentUploadsBaseURL = _this2.ConfigService.getStudentUploadsBaseURL();
            asset.url = studentUploadsBaseURL + asset.filePath;
            if (_this2.isImage(asset)) {
              asset.type = 'image';
              asset.iconURL = asset.url;
            } else if (_this2.isAudio(asset)) {
              asset.type = 'audio';
              asset.iconURL = 'wise5/vle/notebook/audio.png';
            } else {
              asset.type = 'file';
              asset.iconURL = 'wise5/vle/notebook/file.png';
            }
            _this2.allAssets.push(asset);
            _this2.$rootScope.$broadcast('studentAssetsUpdated');
            deferred.resolve(asset);
          }
        }).error(function (asset, status, headers, config) {
          alert(_this2.$translate('THERE_WAS_AN_ERROR_UPLOADING_YOU_MIGHT_HAVE_REACHED_LIMIT'));
        });

        return deferred.promise;
      }
    }
  }, {
    key: 'uploadAssets',
    value: function uploadAssets(files) {
      var _this3 = this;

      var studentAssetsURL = this.ConfigService.getStudentAssetsURL();
      var promises = files.map(function (file) {
        return _this3.Upload.upload({
          url: studentAssetsURL,
          fields: {
            'runId': _this3.ConfigService.getRunId(),
            'workgroupId': _this3.ConfigService.getWorkgroupId(),
            'periodId': _this3.ConfigService.getPeriodId(),
            'clientSaveTime': Date.parse(new Date())
          },
          file: file
        }).progress(function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
        }).success(function (data, status, headers, config) {
          //console.log('file ' + config.file.name + 'uploaded. Response: ' + JSON.stringify(data));
        });
      });
      return this.$q.all(promises);
    }
  }, {
    key: 'copyAssetForReference',


    // given asset, makes a copy of it so steps can use for reference. Returns newly-copied asset.
    value: function copyAssetForReference(studentAsset) {
      var _this4 = this;

      if (this.ConfigService.isPreview()) {
        return this.$q(function (resolve, reject) {
          return resolve(studentAsset);
        });
      } else {
        var config = {};
        config.method = 'POST';
        config.url = this.ConfigService.getStudentAssetsURL() + '/copy';
        config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        var params = {};
        params.studentAssetId = studentAsset.id;
        params.workgroupId = this.ConfigService.getWorkgroupId();
        params.periodId = this.ConfigService.getPeriodId();
        params.clientSaveTime = Date.parse(new Date());

        config.data = $.param(params);

        return this.$http(config).then(function (result) {
          var copiedAsset = result.data;
          if (copiedAsset != null) {
            var studentUploadsBaseURL = _this4.ConfigService.getStudentUploadsBaseURL();
            if (copiedAsset.isReferenced && copiedAsset.fileName !== '.DS_Store') {
              copiedAsset.url = studentUploadsBaseURL + copiedAsset.filePath;
              if (_this4.isImage(copiedAsset)) {
                copiedAsset.type = 'image';
                copiedAsset.iconURL = copiedAsset.url;
              } else if (_this4.isAudio(copiedAsset)) {
                copiedAsset.type = 'audio';
                copiedAsset.iconURL = 'wise5/vle/notebook/audio.png';
              } else {
                copiedAsset.type = 'file';
                copiedAsset.iconURL = 'wise5/vle/notebook/file.png';
              }
              //this.$rootScope.$broadcast('studentAssetsUpdated');
              return copiedAsset;
            }
          }
          return null;
        });
      }
    }
  }, {
    key: 'deleteAsset',
    value: function deleteAsset(studentAsset) {
      var _this5 = this;

      var config = {};
      config.method = 'POST';
      config.url = this.ConfigService.getStudentAssetsURL() + '/remove';
      config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      var params = {};
      params.studentAssetId = studentAsset.id;
      params.workgroupId = this.ConfigService.getWorkgroupId();
      params.periodId = this.ConfigService.getPeriodId();
      params.clientDeleteTime = Date.parse(new Date());
      config.data = $.param(params);

      return this.$http(config).then(function (result) {
        //var deletedAsset = result.data;
        // also remove from local copy of all assets
        _this5.allAssets = _this5.allAssets.splice(_this5.allAssets.indexOf(studentAsset), 1);
        _this5.$rootScope.$broadcast('studentAssetsUpdated');
        return studentAsset;
      });
    }
  }]);

  return StudentAssetService;
}();

StudentAssetService.$inject = ['$filter', '$http', '$q', 'Upload', '$rootScope', 'ConfigService'];

exports.default = StudentAssetService;
//# sourceMappingURL=studentAssetService.js.map
