'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthorNotebookController = function () {
  function AuthorNotebookController($filter, $mdDialog, $state, $stateParams, $scope, ConfigService, ProjectService, SpaceService, UtilService) {
    var _this = this;

    _classCallCheck(this, AuthorNotebookController);

    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$scope = $scope;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.SpaceService = SpaceService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');
    this.projectId = this.$stateParams.projectId;
    this.project = this.ProjectService.project;

    if (this.project.notebook == null) {
      // some old projects may not have the notebook settings,
      // so copy default settings from template project.
      var projectTemplate = this.ProjectService.getNewProjectTemplate();
      this.project.notebook = projectTemplate.notebook;
    }
    var notes = this.project.notebook.itemTypes.report.notes;
    if (notes != null) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = notes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var note = _step.value;

          if (note != null) {
            var reportId = note.reportId;
            note.summernoteId = 'summernoteNotebook_' + reportId;
            var noteContent = this.ProjectService.replaceAssetPaths(note.content);
            noteContent = this.UtilService.replaceWISELinks(noteContent);
            note.summernoteHTML = noteContent;

            // the tooltip text for the insert WISE asset button
            var insertAssetString = this.$translate('INSERT_ASSET');

            /*
             * create the custom button for inserting WISE assets into
             * summernote
             */
            var insertAssetButton = this.UtilService.createInsertAssetButton(this, this.projectId, null, null, reportId, insertAssetString);

            /*
             * the options that specifies the tools to display in the
             * summernote prompt
             */
            note.summernoteOptions = {
              toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
              height: 300,
              disableDragAndDrop: true,
              buttons: {
                insertAssetButton: insertAssetButton
              }
            };
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
    }

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', function (event, args) {
      // make sure the event was fired for this component
      if (args != null && args.projectId == _this.projectId && args.assetItem != null && args.assetItem.fileName != null && args.target != null) {
        /*
         * get the assets directory path
         * e.g.
         * /wise/curriculum/3/
         */
        var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
        var fileName = args.assetItem.fileName;
        var fullAssetPath = assetsDirectoryPath + '/' + fileName;

        // the target is the summernote prompt element
        var _reportId = args.target;
        var summernoteId = 'summernoteNotebook_' + _reportId;
        if (_this.UtilService.isImage(fileName)) {
          /*
           * move the cursor back to its position when the asset chooser
           * popup was clicked
           */
          $('#' + summernoteId).summernote('editor.restoreRange');
          $('#' + summernoteId).summernote('editor.focus');

          // add the image html
          $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
        } else if (_this.UtilService.isVideo(fileName)) {
          /*
           * move the cursor back to its position when the asset chooser
           * popup was clicked
           */
          $('#' + summernoteId).summernote('editor.restoreRange');
          $('#' + summernoteId).summernote('editor.focus');

          // insert the video element
          var videoElement = document.createElement('video');
          videoElement.controls = 'true';
          videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
          $('#' + summernoteId).summernote('insertNode', videoElement);
        }
      }
      _this.$mdDialog.hide();
    });

    this.isPublicNotebookEnabled = this.SpaceService.isSpaceExists("public");
  }

  /**
   * Adds a new report note item to this project's notebook.
   * Currently we limit 1 report note per project.
   */


  _createClass(AuthorNotebookController, [{
    key: 'addReportNote',
    value: function addReportNote() {
      // some old projects may not have the notebook settings,
      // so copy default settings from template project.
      var projectTemplate = this.ProjectService.getNewProjectTemplate();
      if (this.project.notebook.itemTypes.report.notes == null) {
        this.project.notebook.itemTypes.report.notes = [];
      }
      if (this.project.notebook.itemTypes.report.notes < 1) {
        this.project.notebook.itemTypes.report.notes.push(projectTemplate.notebook.itemTypes.report.notes[0]);
      }
    }
  }, {
    key: 'exit',
    value: function exit() {
      var notes = this.project.notebook.itemTypes.report.notes;
      if (notes != null) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = notes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var note = _step2.value;

            if (note != null) {
              // remove the temporary fields that were used for bookkeeping
              delete note['summernoteId'];
              delete note['summernoteHTML'];
              delete note['summernoteOptions'];
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
      }
      var commitMessage = this.$translate('madeChangesToNotebook');
      this.ProjectService.saveProject(commitMessage);
      this.$state.go('root.project', { projectId: this.projectId });
    }

    /**
     * A note was changed
     * @param note the note that was changed
     */

  }, {
    key: 'summernoteHTMLChanged',
    value: function summernoteHTMLChanged(note) {
      if (note != null) {
        var summernoteHTML = note.summernoteHTML;
        /*
         * remove the absolute asset paths
         * e.g.
         * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
         * will be changed to
         * <img src='sun.png'/>
         */
        summernoteHTML = this.ConfigService.removeAbsoluteAssetPaths(summernoteHTML);

        /*
         * replace <a> and <button> elements with <wiselink> elements when
         * applicable
         */
        summernoteHTML = this.UtilService.insertWISELinks(summernoteHTML);
        note.content = summernoteHTML;
      }
    }
  }, {
    key: 'togglePublicNotebook',
    value: function togglePublicNotebook() {
      if (this.isPublicNotebookEnabled) {
        this.SpaceService.addSpace("public", "Public");
      } else {
        this.SpaceService.removeSpace("public");
      }
    }
  }, {
    key: 'disablePublicSpace',
    value: function disablePublicSpace() {
      this.SpaceService.removeSpace("public");
    }
  }]);

  return AuthorNotebookController;
}();

AuthorNotebookController.$inject = ['$filter', '$mdDialog', '$state', '$stateParams', '$scope', 'ConfigService', 'ProjectService', 'SpaceService', 'UtilService'];

exports.default = AuthorNotebookController;
//# sourceMappingURL=authorNotebookController.js.map
