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

  function AnimationAuthoringController($filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnimationService, AnnotationService, ConfigService, CRaterService, NodeService, NotebookService, NotificationService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, AnimationAuthoringController);

    var _this = _possibleConstructorReturn(this, (AnimationAuthoringController.__proto__ || Object.getPrototypeOf(AnimationAuthoringController)).call(this, $filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnimationService, AnnotationService, ConfigService, CRaterService, NodeService, NotebookService, NotificationService, ProjectService, StudentAssetService, StudentDataService, UtilService));

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
      this.removeAllObjects();
      this.initializeCoordinates();
      this.setup();
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
    value: function authoringAddDataPointToObject(animationObject) {
      if (this.animationObjectHasDataSource(animationObject)) {
        if (this.askIfWantToDeleteDataSource()) {
          delete animationObject.dataSource;
          this.addNewDataPoint(animationObject);
        }
      } else {
        this.addNewDataPoint(animationObject);
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'animationObjectHasDataSource',
    value: function animationObjectHasDataSource(animationObject) {
      return animationObject.dataSource != null;
    }
  }, {
    key: 'askIfWantToDeleteDataSource',
    value: function askIfWantToDeleteDataSource() {
      return confirm(this.$translate('animation.areYouSureYouWantToAddADataPoint'));
    }
  }, {
    key: 'initializeAnimationObjectDataIfNecessary',
    value: function initializeAnimationObjectDataIfNecessary(animationObject) {
      if (animationObject.data == null) {
        animationObject.data = [];
      }
    }
  }, {
    key: 'addNewDataPoint',
    value: function addNewDataPoint(animationObject) {
      this.initializeAnimationObjectDataIfNecessary(animationObject);
      var newDataPoint = {};
      animationObject.data.push(newDataPoint);
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
    key: 'authoringMoveAnimationObjectDataPointDown',
    value: function authoringMoveAnimationObjectDataPointDown(object, index) {
      if (this.canMoveDown(index, object.data.length)) {
        var dataPoint = object.data[index];
        object.data.splice(index, 1);
        object.data.splice(index + 1, 0, dataPoint);
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'authoringMoveAnimationObjectUp',
    value: function authoringMoveAnimationObjectUp(index) {
      if (this.canMoveUp(index)) {
        var object = this.authoringComponentContent.objects[index];
        objects.splice(index, 1);
        objects.splice(index - 1, 0, object);
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'authoringMoveAnimationObjectDown',
    value: function authoringMoveAnimationObjectDown(index) {
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
    value: function authoringAddDataSource(animationObject) {
      if (this.animationObjectHasData(animationObject)) {
        if (confirm(this.$translate('animation.areYouSureYouWantToAddADataSource'))) {
          this.deleteDataAndAddDataSource(animationObject);
        }
      } else {
        this.deleteDataAndAddDataSource(animationObject);
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'deleteDataAndAddDataSource',
    value: function deleteDataAndAddDataSource(animationObject) {
      this.deleteDataFromAnimationObject(animationObject);
      this.addDataSourceToAnimationObject(animationObject);
    }
  }, {
    key: 'deleteDataFromAnimationObject',
    value: function deleteDataFromAnimationObject(animationObject) {
      delete animationObject.data;
    }
  }, {
    key: 'addDataSourceToAnimationObject',
    value: function addDataSourceToAnimationObject(animationObject) {
      animationObject.dataSource = {};
    }
  }, {
    key: 'animationObjectHasData',
    value: function animationObjectHasData(animationObject) {
      return animationObject.data != null && animationObject.data.length > 0;
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
    value: function dataSourceNodeChanged(animationObject) {
      var nodeId = animationObject.dataSource.nodeId;
      // clear the dataSource object except for the node id
      animationObject.dataSource = {
        nodeId: nodeId
      };
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'dataSourceComponentChanged',
    value: function dataSourceComponentChanged(animationObject) {
      var nodeId = animationObject.dataSource.nodeId;
      var componentId = animationObject.dataSource.componentId;
      var component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
      animationObject.dataSource = {
        nodeId: nodeId,
        componentId: componentId
      };

      if (component.type == 'Graph') {
        this.setDefaultParamsForGraphDataSource(animationObject);
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'setDefaultParamsForGraphDataSource',
    value: function setDefaultParamsForGraphDataSource(animationObject) {
      animationObject.dataSource.trialIndex = 0;
      animationObject.dataSource.seriesIndex = 0;
      animationObject.dataSource.tColumnIndex = 0;
      animationObject.dataSource.xColumnIndex = 1;
    }
  }, {
    key: 'chooseImage',
    value: function chooseImage(animationObject) {
      var targetString = 'image';
      var params = this.createOpenAssetChooserParamsObject(targetString, animationObject);
      this.$rootScope.$broadcast('openAssetChooser', params);
    }
  }, {
    key: 'chooseImageMovingLeft',
    value: function chooseImageMovingLeft(animationObject) {
      var targetString = 'imageMovingLeft';
      var params = this.createOpenAssetChooserParamsObject(targetString, animationObject);
      this.$rootScope.$broadcast('openAssetChooser', params);
    }
  }, {
    key: 'chooseImageMovingRight',
    value: function chooseImageMovingRight(animationObject) {
      var targetString = 'imageMovingRight';
      var params = this.createOpenAssetChooserParamsObject(targetString, animationObject);
      this.$rootScope.$broadcast('openAssetChooser', params);
    }

    /**
     * @param {string} targetString Can be 'image', 'imageMovingLeft', or 'imageMovingRight'.
     * @param {object} animationObject
     * @returns {object}
     */

  }, {
    key: 'createOpenAssetChooserParamsObject',
    value: function createOpenAssetChooserParamsObject(targetString, animationObject) {
      return {
        isPopup: true,
        nodeId: this.nodeId,
        componentId: this.componentId,
        target: targetString,
        targetObject: animationObject
      };
    }
  }, {
    key: 'authoringAnimationObjectTypeChanged',
    value: function authoringAnimationObjectTypeChanged(animationObject) {
      if (animationObject.type == 'image') {
        this.removeTextFromAnimationObject(animationObject);
      } else if (animationObject.type == 'text') {
        this.removeImageFromAnimationObject(animationObject);
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'removeTextFromAnimationObject',
    value: function removeTextFromAnimationObject(animationObject) {
      delete animationObject.text;
    }
  }, {
    key: 'removeImageFromAnimationObject',
    value: function removeImageFromAnimationObject(animationObject) {
      delete animationObject.image;
      delete animationObject.width;
      delete animationObject.height;
      delete animationObject.imageMovingLeft;
      delete animationObject.imageMovingRight;
      delete animationObject.imageMovingUp;
      delete animationObject.imageMovingDown;
    }
  }]);

  return AnimationAuthoringController;
}(_animationController2.default);

AnimationAuthoringController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnimationService', 'AnnotationService', 'ConfigService', 'CRaterService', 'NodeService', 'NotebookService', 'NotificationService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = AnimationAuthoringController;
//# sourceMappingURL=animationAuthoringController.js.map
