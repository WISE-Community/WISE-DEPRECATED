'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('UtilService Unit Test', function () {

  var UtilService;

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_UtilService_) {
    UtilService = _UtilService_;
  }));

  describe('UtilService', function () {
    // Test UtilService.generateKey()
    it('should return random keys', function () {
      // Calling generate key with no params should return length 10 string
      var generatedKey1 = UtilService.generateKey();
      var generatedKey2 = UtilService.generateKey();
      expect(generatedKey1.length).toEqual(10);
      expect(generatedKey2.length).toEqual(10);
      expect(generatedKey1).not.toEqual(generatedKey2);

      // Calling generate key with length key should produce key with specified length
      var genetatedKey3 = UtilService.generateKey(5);
      expect(genetatedKey3.length).toEqual(5);

      // Calling generate key 100 times should produce 100 unique random strings
      var generatedKeysSoFar = [];
      for (var i = 0; i < 100; i++) {
        var generatedKey = UtilService.generateKey();
        expect(generatedKeysSoFar.indexOf(generatedKey)).toEqual(-1);
        generatedKeysSoFar.push(generatedKey);
      }
    });

    // Test UtilService.convertStringToNumber()
    it('should convert a string to a number', function () {
      // Calling it with a number string should return the number
      expect(UtilService.convertStringToNumber("5")).toEqual(5);

      // Calling it with a number string should return the number
      expect(UtilService.convertStringToNumber("-100")).toEqual(-100);

      // Calling it with null should return null
      expect(UtilService.convertStringToNumber(null)).toBeNull();

      // Calling it with a non-number string should return that non-number
      expect(UtilService.convertStringToNumber("abc")).toEqual("abc");

      // Calling it with a non-number string should return that non-number
      expect(UtilService.convertStringToNumber("")).toEqual("");
    });
  });
});
//# sourceMappingURL=utilService.spec.js.map
