'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _componentController = _interopRequireDefault(require("../componentController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var OutsideURLController =
/*#__PURE__*/
function (_ComponentController) {
  _inherits(OutsideURLController, _ComponentController);

  function OutsideURLController($filter, $mdDialog, $q, $rootScope, $sce, $scope, AnnotationService, ConfigService, NodeService, NotebookService, OutsideURLService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    var _this;

    _classCallCheck(this, OutsideURLController);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(OutsideURLController).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));
    _this.$q = $q;
    _this.$sce = $sce;
    _this.OutsideURLService = OutsideURLService; // the url to the web page to display

    _this.url = null;

    if (_this.componentContent != null) {
      // set the url
      _this.setURL(_this.componentContent.url);
    }

    _this.setWidthAndHeight(_this.componentContent.width, _this.componentContent.height);
    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @return a promise of a component state containing the student data
     */


    _this.$scope.getComponentState = function () {
      var deferred = this.$q.defer();
      /*
       * the student does not have any unsaved changes in this component
       * so we don't need to save a component state for this component.
       * we will immediately resolve the promise here.
       */

      deferred.resolve();
      return deferred.promise;
    }.bind(_assertThisInitialized(_this));

    _this.$rootScope.$broadcast('doneRenderingComponent', {
      nodeId: _this.nodeId,
      componentId: _this.componentId
    });

    return _this;
  }

  _createClass(OutsideURLController, [{
    key: "setWidthAndHeight",
    value: function setWidthAndHeight(width, height) {
      this.width = width ? width + 'px' : 'none';
      this.height = height ? height + 'px' : '600px';
    }
  }, {
    key: "setURL",
    value: function setURL(url) {
      if (url == null || url === '') {
        this.url = ' ';
      } else {
        this.url = this.$sce.trustAsResourceUrl(url);
      }
    }
  }]);

  return OutsideURLController;
}(_componentController["default"]);

OutsideURLController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$sce', '$scope', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'OutsideURLService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];
var _default = OutsideURLController;
exports["default"] = _default;
//# sourceMappingURL=outsideURLController.js.map
