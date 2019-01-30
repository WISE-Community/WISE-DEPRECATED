'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('UtilService', function () {

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  var UtilService = void 0;

  beforeEach(inject(function (_UtilService_) {
    UtilService = _UtilService_;
  }));

  describe('generateKey()', function () {
    it('should return random keys of length 10 by default', function () {
      var generatedKey1 = UtilService.generateKey();
      var generatedKey2 = UtilService.generateKey();
      expect(generatedKey1.length).toEqual(10);
      expect(generatedKey2.length).toEqual(10);
      expect(generatedKey1).not.toEqual(generatedKey2);
    });

    it('should return random keys of specified length', function () {
      expect(UtilService.generateKey(5).length).toEqual(5);
      expect(UtilService.generateKey(23).length).toEqual(23);
    });

    it('should produce 100 unique random strings', function () {
      var generatedKeysSoFar = [];
      for (var i = 0; i < 100; i++) {
        var generatedKey = UtilService.generateKey();
        expect(generatedKeysSoFar.indexOf(generatedKey)).toEqual(-1);
        generatedKeysSoFar.push(generatedKey);
      }
    });
  });

  describe('convertStringToNumber()', function () {
    it('should convert a number string to a number', function () {
      expect(UtilService.convertStringToNumber("5")).toEqual(5);
      expect(UtilService.convertStringToNumber("-100")).toEqual(-100);
    });

    it('should return null for null argument', function () {
      expect(UtilService.convertStringToNumber(null)).toBeNull();
    });

    it('should return non-null number string as is', function () {
      expect(UtilService.convertStringToNumber("abc")).toEqual("abc");
      expect(UtilService.convertStringToNumber("")).toEqual("");
    });
  });

  describe('makeCopyOfJSONObject()', function () {
    it('should copy an array object', function () {
      var array1 = [1, 2, 3];
      var copiedArray = UtilService.makeCopyOfJSONObject(array1);
      expect(copiedArray).toEqual(array1);
    });

    it('should copy an object', function () {
      var obj = { "name": "WISE", "address": "Berkeley" };
      var copiedObj = UtilService.makeCopyOfJSONObject(obj);
      expect(copiedObj).toEqual(obj);
    });
  });

  describe('arrayHasNonNullElement()', function () {
    it('should return true if it has at least one non null element', function () {
      var arrayToCheck = [null, {}, null];
      expect(UtilService.arrayHasNonNullElement(arrayToCheck)).toEqual(true);
    });

    it('should return false if it has all null elements', function () {
      var arrayToCheck = [null, null, null];
      expect(UtilService.arrayHasNonNullElement(arrayToCheck)).toEqual(false);
    });

    it('should return true if it has all non null elements', function () {
      var arrayToCheck = [{}, {}, {}];
      expect(UtilService.arrayHasNonNullElement(arrayToCheck)).toEqual(true);
    });
  });

  describe('moveObjectUp()', function () {
    it('should move an object up when the object is not the top element', function () {
      var myArray = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
      var elementToMove = 1;
      UtilService.moveObjectUp(myArray, elementToMove);
      expect(myArray[0].name).toEqual('b');
      expect(myArray[1].name).toEqual('a');
      expect(myArray[2].name).toEqual('c');
    });

    it('should not move an object up when the object is the top element', function () {
      var myArray = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
      var elementToMove = 0;
      UtilService.moveObjectUp(myArray, elementToMove);
      expect(myArray[0].name).toEqual('a');
      expect(myArray[1].name).toEqual('b');
      expect(myArray[2].name).toEqual('c');
    });
  });

  describe('moveObjectDown()', function () {
    it('should move an object down when the object is not the bottom element', function () {
      var myArray = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
      var elementToMove = 1;
      UtilService.moveObjectDown(myArray, elementToMove);
      expect(myArray[0].name).toEqual('a');
      expect(myArray[1].name).toEqual('c');
      expect(myArray[2].name).toEqual('b');
    });

    it('should not move an object down when the object is the bottom element', function () {
      var myArray = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
      var elementToMove = 2;
      UtilService.moveObjectDown(myArray, elementToMove);
      expect(myArray[0].name).toEqual('a');
      expect(myArray[1].name).toEqual('b');
      expect(myArray[2].name).toEqual('c');
    });
  });
});
//# sourceMappingURL=utilService.spec.js.map
