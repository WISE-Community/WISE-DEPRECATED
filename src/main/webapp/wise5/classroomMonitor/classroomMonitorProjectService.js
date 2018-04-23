'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _projectService = require('../services/projectService');

var _projectService2 = _interopRequireDefault(_projectService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ClassroomMonitorProjectService = function (_ProjectService) {
  _inherits(ClassroomMonitorProjectService, _ProjectService);

  function ClassroomMonitorProjectService($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService) {
    _classCallCheck(this, ClassroomMonitorProjectService);

    return _possibleConstructorReturn(this, (ClassroomMonitorProjectService.__proto__ || Object.getPrototypeOf(ClassroomMonitorProjectService)).call(this, $filter, $http, $injector, $q, $rootScope, ConfigService, UtilService));
  }

  return ClassroomMonitorProjectService;
}(_projectService2.default);

ClassroomMonitorProjectService.$inject = ['$filter', '$http', '$injector', '$q', '$rootScope', 'ConfigService', 'UtilService'];

exports.default = ClassroomMonitorProjectService;
//# sourceMappingURL=classroomMonitorProjectService.js.map
