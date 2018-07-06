'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _animationController = require('./animationController');

var _animationController2 = _interopRequireDefault(_animationController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AnimationAuthoringController = function (_AnimationController) {
  _inherits(AnimationAuthoringController, _AnimationController);

  function AnimationAuthoringController($filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnimationService, AnnotationService, ConfigService, NodeService, NotebookService, NotificationService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, AnimationAuthoringController);

    var _this = _possibleConstructorReturn(this, (AnimationAuthoringController.__proto__ || Object.getPrototypeOf(AnimationAuthoringController)).call(this, $filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnimationService, AnnotationService, ConfigService, NodeService, NotebookService, NotificationService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.allowedConnectedComponentTypes = [{ type: 'Animation' }, { type: 'Graph' }];

    $scope.$watch(function () {
      return this.authoringComponentContent;
    }.bind(_this), function (newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.refreshContentInAuthoringPreview();
    }.bind(_this), true);

    _this.$scope.$on('assetSelected', function (event, args) {
      if (_this.isEventTargetThisComponent(args)) {
        var fileName = args.assetItem.fileName;
        if (args.target == 'rubric') {
          var summernoteId = _this.createSummernoteRubricId();
          _this.restoreSummernoteCursorPosition(summernoteId);
          var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
          var fullAssetPath = assetsDirectoryPath + '/' + fileName;
          if (_this.UtilService.isImage(fileName)) {
            _this.insertImageIntoSummernote(fullAssetPath, fileName);
          } else if (_this.UtilService.isVideo(fileName)) {
            _this.insertVideoIntoSummernote(fullAssetPath);
          }
        } else if (args.target == 'image') {
          args.targetObject.image = fileName;
        } else if (args.target == 'imageMovingLeft') {
          args.targetObject.imageMovingLeft = fileName;
        } else if (args.target == 'imageMovingRight') {
          args.targetObject.imageMovingRight = fileName;
        }
      }
      _this.authoringViewComponentChanged();
      _this.$mdDialog.hide();
    });
    return _this;
  }

  _createClass(AnimationAuthoringController, [{
    key: 'refreshContentInAuthoringPreview',
    value: function refreshContentInAuthoringPreview() {
      this.submitCounter = 0;
      this.latestAnnotations = null;
      this.isDirty = false;
      this.isSubmitDirty = false;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.removeAllObjectsFromSVG();
      this.initializeCoordinates();
      this.setup();
    }
  }, {
    key: 'removeAllObjectsFromSVG',
    value: function removeAllObjectsFromSVG() {
      var ids = Object.keys(this.idToSVGObject);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = ids[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var id = _step.value;

          var svgObject = this.idToSVGObject[id];
          svgObject.remove();
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
  }, {
    key: 'authoringAddObject',
    value: function authoringAddObject() {
      if (this.authoringComponentContent.objects == null) {
        this.authoringComponentContent.objects = [];
      }
      var newObject = {
        id: this.UtilService.generateKey(10),
        type: 'image'
      };
      this.authoringComponentContent.objects.push(newObject);
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringAddDataPointToObject',
    value: function authoringAddDataPointToObject(authoredObject) {
      if (this.authoredObjectHasDataSource(authoredObject)) {
        if (this.askIfWantToDeleteDataSource()) {
          delete authoredObject.dataSource;
          this.addNewDataPoint(authoredObject);
        }
      } else {
        this.addNewDataPoint(authoredObject);
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'askIfWantToDeleteDataSource',
    value: function askIfWantToDeleteDataSource() {
      return confirm(this.$translate('animation.areYouSureYouWantToAddADataPoint'));
    }
  }, {
    key: 'initializeAuthoredObjectDataIfNecessary',
    value: function initializeAuthoredObjectDataIfNecessary(authoredObject) {
      if (authoredObject.data == null) {
        authoredObject.data = [];
      }
    }
  }, {
    key: 'addNewDataPoint',
    value: function addNewDataPoint(authoredObject) {
      this.initializeAuthoredObjectDataIfNecessary(authoredObject);
      var newDataPoint = {};
      authoredObject.data.push(newDataPoint);
    }
  }, {
    key: 'authoringConfirmDeleteAnimationObjectDataPoint',
    value: function authoringConfirmDeleteAnimationObjectDataPoint(animationObject, index) {
      if (confirm(this.$translate('animation.areYouSureYouWantToDeleteThisDataPoint'))) {
        this.authoringDeleteAnimationObjectDataPoint(animationObject, index);
      }
    }
  }, {
    key: 'authoringDeleteAnimationObjectDataPoint',
    value: function authoringDeleteAnimationObjectDataPoint(animationObject, index) {
      animationObject.data.splice(index, 1);
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringMoveAnimationObjectDataPointUp',
    value: function authoringMoveAnimationObjectDataPointUp(object, index) {
      if (this.canMoveUp(index)) {
        var dataPoint = object.data[index];
        object.data.splice(index, 1);
        object.data.splice(index - 1, 0, dataPoint);
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'authoringMoveAuthoredObjectDataPointDown',
    value: function authoringMoveAuthoredObjectDataPointDown(object, index) {
      if (this.canMoveDown(index, object.data.length)) {
        var dataPoint = object.data[index];
        object.data.splice(index, 1);
        object.data.splice(index + 1, 0, dataPoint);
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'authoringMoveAuthoredObjectUp',
    value: function authoringMoveAuthoredObjectUp(index) {
      if (this.canMoveUp(index)) {
        var object = this.authoringComponentContent.objects[index];
        objects.splice(index, 1);
        objects.splice(index - 1, 0, object);
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'authoringMoveAuthoredObjectDown',
    value: function authoringMoveAuthoredObjectDown(index) {
      var objects = this.authoringComponentContent.objects;
      if (this.canMoveDown(index, objects.length)) {
        var object = objects[index];
        objects.splice(index, 1);
        objects.splice(index + 1, 0, object);
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'canMoveUp',
    value: function canMoveUp(index) {
      return index > 0;
    }
  }, {
    key: 'canMoveDown',
    value: function canMoveDown(index, length) {
      return index < length - 1;
    }
  }, {
    key: 'authoringConfirmDeleteAnimationObject',
    value: function authoringConfirmDeleteAnimationObject(index) {
      if (confirm(this.$translate('animation.areYouSureYouWantToDeleteThisObject'))) {
        this.authoringDeleteAnimationObject(index);
      }
    }
  }, {
    key: 'authoringDeleteAnimationObject',
    value: function authoringDeleteAnimationObject(index) {
      this.authoringComponentContent.objects.splice(index, 1);
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringAddDataSource',
    value: function authoringAddDataSource(authoredObject) {
      if (this.authoredObjectHasData(authoredObject)) {
        if (confirm(this.$translate('animation.areYouSureYouWantToAddADataSource'))) {
          this.deleteDataAndAddDataSource(authoredObject);
        }
      } else {
        this.deleteDataAndAddDataSource(authoredObject);
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'deleteDataAndAddDataSource',
    value: function deleteDataAndAddDataSource(authoredObject) {
      this.deleteDataFromAuthoredObject(authoredObject);
      this.addDataSourceToAuthoredObject(authoredObject);
    }
  }, {
    key: 'deleteDataFromAuthoredObject',
    value: function deleteDataFromAuthoredObject(authoredObject) {
      delete authoredObject.data;
    }
  }, {
    key: 'addDataSourceToAuthoredObject',
    value: function addDataSourceToAuthoredObject(authoredObject) {
      authoredObject.dataSource = {};
    }
  }, {
    key: 'authoringConfirmDeleteDataSource',
    value: function authoringConfirmDeleteDataSource(animationObject) {
      if (confirm(this.$translate('animation.areYouSureYouWantToDeleteTheDataSource'))) {
        this.authoringDeleteDataSource(animationObject);
      }
    }
  }, {
    key: 'authoringDeleteDataSource',
    value: function authoringDeleteDataSource(animationObject) {
      delete animationObject.dataSource;
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'dataSourceNodeChanged',
    value: function dataSourceNodeChanged(authoredObject) {
      var nodeId = authoredObject.dataSource.nodeId;
      // clear the dataSource object except for the node id
      authoredObject.dataSource = {
        nodeId: nodeId
      };
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'dataSourceComponentChanged',
    value: function dataSourceComponentChanged(authoredObject) {
      var nodeId = authoredObject.dataSource.nodeId;
      var componentId = authoredObject.dataSource.componentId;
      var component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
      authoredObject.dataSource = {
        nodeId: nodeId,
        componentId: componentId
      };

      if (component.type == 'Graph') {
        this.setDefaultParamsForGraphDataSource(authoredObject);
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'setDefaultParamsForGraphDataSource',
    value: function setDefaultParamsForGraphDataSource(authoredObject) {
      authoredObject.dataSource.trialIndex = 0;
      authoredObject.dataSource.seriesIndex = 0;
      authoredObject.dataSource.tColumnIndex = 0;
      authoredObject.dataSource.xColumnIndex = 1;
    }
  }, {
    key: 'chooseImage',
    value: function chooseImage(authoredObject) {
      var targetString = 'image';
      var params = this.createOpenAssetChooserParamsObject(targetString, authoredObject);
      this.$rootScope.$broadcast('openAssetChooser', params);
    }
  }, {
    key: 'chooseImageMovingLeft',
    value: function chooseImageMovingLeft(authoredObject) {
      var targetString = 'imageMovingLeft';
      var params = this.createOpenAssetChooserParamsObject(targetString, authoredObject);
      this.$rootScope.$broadcast('openAssetChooser', params);
    }
  }, {
    key: 'chooseImageMovingRight',
    value: function chooseImageMovingRight(authoredObject) {
      var targetString = 'imageMovingRight';
      var params = this.createOpenAssetChooserParamsObject(targetString, authoredObject);
      this.$rootScope.$broadcast('openAssetChooser', params);
    }

    /**
     * @param {string} targetString Can be 'image', 'imageMovingLeft', or 'imageMovingRight'.
     * @param {object} authoredObject
     * @returns {object}
     */

  }, {
    key: 'createOpenAssetChooserParamsObject',
    value: function createOpenAssetChooserParamsObject(targetString, authoredObject) {
      return {
        isPopup: true,
        nodeId: this.nodeId,
        componentId: this.componentId,
        target: targetString,
        targetObject: authoredObject
      };
    }
  }, {
    key: 'authoringAuthoredObjectTypeChanged',
    value: function authoringAuthoredObjectTypeChanged(authoredObject) {
      if (authoredObject.type == 'image') {
        this.removeTextFromAuthoredObject(authoredObject);
      } else if (authoredObject.type == 'text') {
        this.removeImageFromAuthoredObject(authoredObject);
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'removeTextFromAuthoredObject',
    value: function removeTextFromAuthoredObject(authoredObject) {
      delete authoredObject.text;
    }
  }, {
    key: 'removeImageFromAuthoredObject',
    value: function removeImageFromAuthoredObject(authoredObject) {
      delete authoredObject.image;
      delete authoredObject.width;
      delete authoredObject.height;
      delete authoredObject.imageMovingLeft;
      delete authoredObject.imageMovingRight;
      delete authoredObject.imageMovingUp;
      delete authoredObject.imageMovingDown;
    }
  }]);

  return AnimationAuthoringController;
}(_animationController2.default);

AnimationAuthoringController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnimationService', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'NotificationService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = AnimationAuthoringController;
//# sourceMappingURL=animationAuthoringController.js.map
