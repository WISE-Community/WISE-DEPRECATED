'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('ConceptMapService', function () {

  var ConceptMapService = void 0;

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_ConceptMapService_) {
    ConceptMapService = _ConceptMapService_;
  }));

  it('should get the next available id', function () {
    var nodes = [{ id: 'node1' }, { id: 'node2' }, { id: 'node3' }];
    var nextAvailableId = ConceptMapService.getNextAvailableId(nodes, 'node');
    expect(nextAvailableId).toEqual('node4');
  });
});
//# sourceMappingURL=conceptMapService.spec.js.map
