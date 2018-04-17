'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SpaceService = function () {
  function SpaceService(ProjectService) {
    _classCallCheck(this, SpaceService);

    this.ProjectService = ProjectService;
  }

  _createClass(SpaceService, [{
    key: 'createSpace',
    value: function createSpace(id, name) {
      var isPublic = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var isShowInNotebook = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

      return {
        id: id,
        name: name,
        isPublic: isPublic,
        isShowInNotebook: isShowInNotebook
      };
    }
  }, {
    key: 'addSpace',
    value: function addSpace(id, name) {
      var isPublic = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var isShowInNotebook = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

      if (!this.isSpaceExists(id)) {
        this.ProjectService.addSpace(this.createSpace(id, name, isPublic, isShowInNotebook));
      }
    }
  }, {
    key: 'removeSpace',
    value: function removeSpace(id) {
      this.ProjectService.removeSpace(id);
    }
  }, {
    key: 'isSpaceExists',
    value: function isSpaceExists(id) {
      var spaces = this.ProjectService.getSpaces();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = spaces[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var space = _step.value;

          if (space.id === id) {
            return true;
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

      return false;
    }
  }]);

  return SpaceService;
}();

SpaceService.$inject = ['ProjectService'];

exports.default = SpaceService;
//# sourceMappingURL=spaceService.js.map
