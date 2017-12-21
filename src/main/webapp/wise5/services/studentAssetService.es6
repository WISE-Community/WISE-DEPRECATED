'use strict';

class StudentAssetService {
  constructor(
      $filter,
      $http,
      $q,
      Upload,
      $rootScope,
      ConfigService) {
    this.$filter = $filter;
    this.$http = $http;
    this.$q = $q;
    this.Upload = Upload;
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;
    this.$translate = this.$filter('translate');
    this.allAssets = [];  // keep track of student's assets
  }

  getAssetById(assetId) {
    for (let asset of this.allAssets) {
      if (asset.id === assetId) {
        return asset;
      }
    }
    return null;
  };

  retrieveAssets() {
    if (this.ConfigService.isPreview()) {
      // if we're in preview, don't make any request to the server but pretend we did
      this.allAssets = [];
      let deferred = this.$q.defer();
      deferred.resolve(this.allAssets);
      return deferred.promise;
    } else {
      let config = {
        method: "GET",
        url: this.ConfigService.getStudentAssetsURL(),
        params: {
          workgroupId: this.ConfigService.getWorkgroupId()
        }
      };
      return this.$http(config).then((response) => {
        // loop through the assets and make them into JSON object with more details
        let result = [];
        let assets = response.data;
        let studentUploadsBaseURL = this.ConfigService.getStudentUploadsBaseURL();
        for (let asset of assets) {
          if (!asset.isReferenced && asset.serverDeleteTime == null && asset.fileName !== '.DS_Store') {
            asset.url = studentUploadsBaseURL + asset.filePath;
            if (this.isImage(asset)) {
              asset.type = 'image';
              asset.iconURL = asset.url;
            } else if (this.isAudio(asset)) {
              asset.type = 'audio';
              asset.iconURL = 'wise5/vle/notebook/audio.png';
            } else {
              asset.type = 'file';
              asset.iconURL = 'wise5/vle/notebook/file.png';
            }
            result.push(asset);
          }
        }
        this.allAssets = result;
        return result;
      });
    }
  };

  getAssetContent(asset) {
    const assetContentURL = asset.url;

    // retrieve the csv file and parse it
    const config = {};
    config.method = 'GET';
    config.url = assetContentURL;
    return this.$http(config).then((response) => {
      return response.data;
    });
  };

  isImage(asset) {
    const imageFileExtensions = ['png', 'jpg', 'jpeg', 'gif'];
    if (asset != null) {
      const assetURL = asset.url;
      if (assetURL != null && assetURL.lastIndexOf('.') !== -1) {
        const assetExtension = assetURL.substring(assetURL.lastIndexOf('.') + 1);
        if (imageFileExtensions.indexOf(assetExtension.toLowerCase()) != -1) {
          return true;
        }
      }
    }
    return false;
  };

  isAudio(asset) {
    const imageFileExtensions = ['wav', 'mp3', 'ogg', 'm4a', 'm4p', 'raw', 'aiff'];
    if (asset != null) {
      const assetURL = asset.url;
      if (assetURL != null && assetURL.lastIndexOf('.') != -1) {
        const assetExtension = assetURL.substring(assetURL.lastIndexOf('.') + 1);
        if (imageFileExtensions.indexOf(assetExtension.toLowerCase()) != -1) {
          return true;
        }
      }
    }
    return false;
  };

  uploadAsset(file) {
    if (this.ConfigService.isPreview()) {
      return this.$q((resolve, reject) => {
        const reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = ( (theFile) => {
          return (e) => {
            let fileSrc = e.target.result;
            let fileName = theFile.name;

            let asset = {};
            asset.file = file;
            asset.url = fileSrc;
            // assume this is an image for now. in the future, support audio and other file formats.
            asset.type = 'image';
            asset.iconURL = asset.url;

            this.allAssets.push(asset);
            this.$rootScope.$broadcast('studentAssetsUpdated');
            return resolve(asset);
          };
        })(file);

        // Read in the image file as a data URL.
        reader.readAsDataURL(file);
      });
    } else {
      const studentAssetsURL = this.ConfigService.getStudentAssetsURL();
      const deferred = this.$q.defer();

      this.Upload.upload({
        url: studentAssetsURL,
        fields: {
          'runId': this.ConfigService.getRunId(),
          'workgroupId': this.ConfigService.getWorkgroupId(),
          'periodId': this.ConfigService.getPeriodId(),
          'clientSaveTime': Date.parse(new Date())
        },
        file: file
      }).success((asset, status, headers, config) => {
        if (asset === "error") {
          alert(this.$translate('THERE_WAS_AN_ERROR_UPLOADING'));
        } else {
          const studentUploadsBaseURL = this.ConfigService.getStudentUploadsBaseURL();
          asset.url = studentUploadsBaseURL + asset.filePath;
          if (this.isImage(asset)) {
            asset.type = 'image';
            asset.iconURL = asset.url;
          } else if (this.isAudio(asset)) {
            asset.type = 'audio';
            asset.iconURL = 'wise5/vle/notebook/audio.png';
          } else {
            asset.type = 'file';
            asset.iconURL = 'wise5/vle/notebook/file.png';
          }
          this.allAssets.push(asset);
          this.$rootScope.$broadcast('studentAssetsUpdated');
          deferred.resolve(asset);
        }
      }).error((asset, status, headers, config) => {
        alert(this.$translate('THERE_WAS_AN_ERROR_UPLOADING_YOU_MIGHT_HAVE_REACHED_LIMIT'));
      });

      return deferred.promise;
    }
  };

  uploadAssets(files) {
    const studentAssetsURL = this.ConfigService.getStudentAssetsURL();
    const promises = files.map((file) => {
      return this.Upload.upload({
        url: studentAssetsURL,
        fields: {
          'runId': this.ConfigService.getRunId(),
          'workgroupId': this.ConfigService.getWorkgroupId(),
          'periodId': this.ConfigService.getPeriodId(),
          'clientSaveTime': Date.parse(new Date())
        },
        file: file
      }).progress((evt) => {
        const progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
      }).success((data, status, headers, config) => {
        //console.log('file ' + config.file.name + 'uploaded. Response: ' + JSON.stringify(data));
      });
    });
    return this.$q.all(promises);
  };

  // given asset, makes a copy of it so steps can use for reference. Returns newly-copied asset.
  copyAssetForReference(studentAsset) {
    if (this.ConfigService.isPreview()) {
      return this.$q((resolve, reject) => {
        return resolve(studentAsset);
      });
    } else {
      const config = {};
      config.method = 'POST';
      config.url = this.ConfigService.getStudentAssetsURL() + '/copy';
      config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
      const params = {};
      params.studentAssetId = studentAsset.id;
      params.workgroupId = this.ConfigService.getWorkgroupId();
      params.periodId = this.ConfigService.getPeriodId();
      params.clientSaveTime = Date.parse(new Date());

      config.data = $.param(params);

      return this.$http(config).then((result) => {
        const copiedAsset = result.data;
        if (copiedAsset != null) {
          const studentUploadsBaseURL = this.ConfigService.getStudentUploadsBaseURL();
          if (copiedAsset.isReferenced && copiedAsset.fileName !== '.DS_Store') {
            copiedAsset.url = studentUploadsBaseURL + copiedAsset.filePath;
            if (this.isImage(copiedAsset)) {
              copiedAsset.type = 'image';
              copiedAsset.iconURL = copiedAsset.url;
            } else if (this.isAudio(copiedAsset)) {
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
  };

  deleteAsset(studentAsset) {
    const config = {};
    config.method = 'POST';
    config.url = this.ConfigService.getStudentAssetsURL() + '/remove';
    config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    const params = {};
    params.studentAssetId = studentAsset.id;
    params.workgroupId = this.ConfigService.getWorkgroupId();
    params.periodId = this.ConfigService.getPeriodId();
    params.clientDeleteTime = Date.parse(new Date());
    config.data = $.param(params);

    return this.$http(config).then((result) => {
      //const deletedAsset = result.data;
      // also remove from local copy of all assets
      this.allAssets = this.allAssets.splice(this.allAssets.indexOf(studentAsset), 1);
      this.$rootScope.$broadcast('studentAssetsUpdated');
      return studentAsset;
    });
  };
}

StudentAssetService.$inject = [
  '$filter',
  '$http',
  '$q',
  'Upload',
  '$rootScope',
  'ConfigService'];

export default StudentAssetService;
