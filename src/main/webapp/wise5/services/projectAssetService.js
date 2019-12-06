class ProjectAssetService {
  constructor(
      $q,
      $http,
      $rootScope,
      ConfigService,
      ProjectService,
      Upload,
      UtilService) {
    this.$q = $q;
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.Upload = Upload;
    this.UtilService = UtilService;
    this.projectAssets = {};
    this.projectAssetTotalSizeMax =
        this.ConfigService.getConfigParam('projectAssetTotalSizeMax');
    this.projectAssetUsagePercentage = 0;
  }

  deleteAssetItem(assetItem) {
    let params = {
      assetFileName: assetItem.fileName
    };

    let httpParams = {
      method: 'POST',
      url: this.ConfigService.getConfigParam('projectAssetURL'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param(params)
    };

    return this.$http(httpParams).then((result) => {
      let projectAssetsJSON = result.data;
      this.projectAssets = projectAssetsJSON;
      return projectAssetsJSON;
    });
  }

  downloadAssetItem(assetItem) {
    let assetFileName = assetItem.fileName;

    // ask the browser to download this asset by setting the location
    window.location = this.ConfigService.getConfigParam('projectAssetURL') +
        "/download?assetFileName=" + assetFileName;
  }

  getFullAssetItemURL(assetItem) {
    return this.ConfigService.getConfigParam('projectBaseURL') + "assets/" + assetItem.fileName;
  }

  retrieveProjectAssets() {
    const projectAssetURL = this.ConfigService.getConfigParam('projectAssetURL');

    return this.$http.get(projectAssetURL).then((result) => {
      const projectAssetsJSON = result.data;
      this.projectAssets = projectAssetsJSON;
      this.calculateAssetUsage();
      return projectAssetsJSON;
    });
  }

  uploadAssets(files) {
    const projectAssetURL = this.ConfigService.getConfigParam('projectAssetURL');

    const promises = files.map((file) => {
      return this.Upload.upload({
        url: projectAssetURL,
        fields: {
        },
        file: file
      }).progress((evt) => {
        const progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
      }).success((result, status, headers, config) => {
        // Only set the projectAssets if the result is an object.
        // Sometimes it's an error message string.
        if (typeof result === 'object') {
          // upload was successful.
          this.projectAssets = result;
          let uploadedFilename = config.file.name;
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

  /**
   * Calculate which assets are used or not used
   * @return a promise that returns the total amount of space the unused
   * files use
   */
  calculateAssetUsage() {
    /*
     * a list of all the project assets. each element in the list is an
     * object that contains the file name and file size
     */
    const assets = this.projectAssets;

    // get the project content as a string
    const projectJSONString = angular.toJson(this.ProjectService.project);

    // an array to hold the text files that the project uses
    const allTextFiles = [];

    if (assets != null && assets.files != null) {
      /*
       * loop through all the asset files to find the text files that
       * are actually used in the project
       */
      for (let asset of assets.files) {
        if (asset != null) {
          const fileName = asset.fileName;

          // check if the file is a text file
          if (this.UtilService.endsWith(fileName, ".html") ||
            this.UtilService.endsWith(fileName, ".htm") ||
            this.UtilService.endsWith(fileName, ".js")) {

            // the file is a text file
            allTextFiles.push(fileName);
          }
        }
      }
    }

    const usedTextFiles = [];

    /*
     * Retrieve all the text files that are used in the project. If there
     * are no text files that are used in the project, the then() will
     * still be called.
     */
    return this.getTextFiles(allTextFiles).then((textFiles) => {

      /*
       * this variable will hold all the text content that is used in
       * the project so we can look for asset references to determine
       * which assets are used
       */
      let allUsedTextContent = projectJSONString;

      /*
       * used to keep track of all the text file names that are used in
       * the project
       */
      const usedTextFileNames = [];

      /*
       * boolean flag that will help us determine if we need to loop
       * all the text files again
       */
      let foundNewUsedTextFile = true;

      /*
       * Gather all the content for all the text files that are used.
       * We will keep looping until we no longer find anymore new text
       * files that are used.
       * Say for example whale.html is used in a component in the project.
       * whaly.html references whale.js
       * In this case the first iteration of the while loop will find
       * whale.html is used. Then in the second iteration of the while
       * loop, it will find that whale.js is used.
       */
      while (foundNewUsedTextFile) {

        /*
         * reset this to false so that we can tell if a new text file
         * is found to be used in this current iteration of the while
         * loop
         */
        foundNewUsedTextFile = false;

        for (let textFile of textFiles) {
          if (textFile != null) {
            /*
             * get the url to the text file
             * e.g. /wise/curriculum/26/assets/whale.html
             */
            const url = textFile.config.url;

            // get the file name
            let fileName = '';

            // get the last index of '/'
            const lastIndexOfSlash = url.lastIndexOf('/');

            if (lastIndexOfSlash == -1) {
              // the url does not contain a '/'
              fileName = url;
            } else {
              /*
               * the url does contain a '/' so we will get everything
               * after it
               */
              fileName = url.substring(lastIndexOfSlash + 1);
            }

            /*
             * check if we have already found that this text file
             * is used
             */
            if (usedTextFileNames.indexOf(fileName) == -1) {
              /*
               * this is a file name that isn't yet in the array
               * of file names that are used
               */

              if (allUsedTextContent.indexOf(fileName) != -1) {
                // the file name is referenced in the content

                // add the file name to our array of used text file names
                usedTextFileNames.push(fileName);

                // get the file content
                const data = textFile.data;

                /*
                 * add the content of the file to our variable that
                 * contains all the used text content
                 */
                allUsedTextContent += data;

                /*
                 * set the boolean flag so that we will iterate
                 * the while loop again
                 */
                foundNewUsedTextFile = true;
              }
            }
          }
        }
      }

      // field to calculate how much disk space the unused files are using
      let totalUnusedFilesSize = 0;

      if (assets != null && assets.files != null) {
        for (let asset of assets.files) {
          if (asset != null) {
            const fileName = asset.fileName;
            if (allUsedTextContent.indexOf(fileName) != -1) {
              // the file is used in the project
              asset.used = true;
            } else {
              // the file is not used in the project
              asset.used = false;

              // add the file size to the total
              totalUnusedFilesSize += asset.fileSize;
            }
          }
        }
      }

      return totalUnusedFilesSize;
    });
  }

  /**
   * Retrieve text files using a promise all
   * @param textFileNames a list of text file names
   * @return a promise that will retrieve all the text files
   */
  getTextFiles(textFileNames) {
    const promises = [];

    // get the project assets path e.g. /wise/curriculum/3/assets
    const projectAssetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
    for (let textFileName of textFileNames) {
      // create a promise that will return the contents of the text file
      const promise = this.$http.get(projectAssetsDirectoryPath + '/' + textFileName);

      promises.push(promise);
    }

    return this.$q.all(promises);
  }
}

ProjectAssetService.$inject = [
  '$q',
  '$http',
  '$rootScope',
  'ConfigService',
  'ProjectService',
  'Upload',
  'UtilService'
];

export default ProjectAssetService;
