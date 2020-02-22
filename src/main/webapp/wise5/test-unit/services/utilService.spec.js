import vleModule from '../../vle/vle';

describe('UtilService', () => {
  beforeEach(angular.mock.module(vleModule.name));

  let UtilService;

  beforeEach(inject(_UtilService_ => {
    UtilService = _UtilService_;
  }));

  generateKeyTests();
  convertStringToNumberTests();
  makeCopyOfJSONObjectTests();
  arrayHasNonNullElementTests();
  moveObjectUpTests();
  moveObjectDownTests();
  calculateMeanTests();
  getIntersectOfArraysTests();
  isValidJSONStringTests();

  function generateKeyTests() {
    describe('generateKey()', () => {
      it('should return random keys of length 10 by default', () => {
        const generatedKey1 = UtilService.generateKey();
        const generatedKey2 = UtilService.generateKey();
        expect(generatedKey1.length).toEqual(10);
        expect(generatedKey2.length).toEqual(10);
        expect(generatedKey1).not.toEqual(generatedKey2);
      });

      it('should return random keys of specified length', () => {
        expect(UtilService.generateKey(5).length).toEqual(5);
        expect(UtilService.generateKey(23).length).toEqual(23);
      });

      it('should produce 100 unique random strings', () => {
        const generatedKeysSoFar = [];
        for (let i = 0; i < 100; i++) {
          const generatedKey = UtilService.generateKey();
          expect(generatedKeysSoFar.indexOf(generatedKey)).toEqual(-1);
          generatedKeysSoFar.push(generatedKey);
        }
      });
    });
  }

  function convertStringToNumberTests() {
    describe('convertStringToNumber()', () => {
      it('should convert a number string to a number', () => {
        expect(UtilService.convertStringToNumber('5')).toEqual(5);
        expect(UtilService.convertStringToNumber('-100')).toEqual(-100);
      });

      it('should return null for null argument', () => {
        expect(UtilService.convertStringToNumber(null)).toBeNull();
      });

      it('should return non-null number string as is', () => {
        expect(UtilService.convertStringToNumber('abc')).toEqual('abc');
        expect(UtilService.convertStringToNumber('')).toEqual('');
      });
    });
  }

  function makeCopyOfJSONObjectTests() {
    describe('makeCopyOfJSONObject()', () => {
      it('should copy an array object', () => {
        const array1 = [1, 2, 3];
        const copiedArray = UtilService.makeCopyOfJSONObject(array1);
        expect(copiedArray).toEqual(array1);
      });

      it('should copy an object', () => {
        const obj = { name: 'WISE', address: 'Berkeley' };
        const copiedObj = UtilService.makeCopyOfJSONObject(obj);
        expect(copiedObj).toEqual(obj);
      });
    });
  }

  function arrayHasNonNullElementTests() {
    describe('arrayHasNonNullElement()', () => {
      it('should return true if it has at least one non null element', () => {
        const arrayToCheck = [null, {}, null];
        expect(UtilService.arrayHasNonNullElement(arrayToCheck)).toEqual(true);
      });

      it('should return false if it has all null elements', () => {
        const arrayToCheck = [null, null, null];
        expect(UtilService.arrayHasNonNullElement(arrayToCheck)).toEqual(false);
      });

      it('should return true if it has all non null elements', () => {
        const arrayToCheck = [{}, {}, {}];
        expect(UtilService.arrayHasNonNullElement(arrayToCheck)).toEqual(true);
      });
    });
  }

  function moveObjectUpTests() {
    describe('moveObjectUp()', () => {
      it('should move an object up when the object is not the top element', () => {
        const myArray = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
        const elementToMove = 1;
        UtilService.moveObjectUp(myArray, elementToMove);
        expect(myArray[0].name).toEqual('b');
        expect(myArray[1].name).toEqual('a');
        expect(myArray[2].name).toEqual('c');
      });

      it('should not move an object up when the object is the top element', () => {
        const myArray = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
        const elementToMove = 0;
        UtilService.moveObjectUp(myArray, elementToMove);
        expect(myArray[0].name).toEqual('a');
        expect(myArray[1].name).toEqual('b');
        expect(myArray[2].name).toEqual('c');
      });
    });
  }

  function moveObjectDownTests() {
    describe('moveObjectDown()', () => {
      it('should move an object down when the object is not the bottom element', () => {
        const myArray = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
        const elementToMove = 1;
        UtilService.moveObjectDown(myArray, elementToMove);
        expect(myArray[0].name).toEqual('a');
        expect(myArray[1].name).toEqual('c');
        expect(myArray[2].name).toEqual('b');
      });

      it('should not move an object down when the object is the bottom element', () => {
        const myArray = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
        const elementToMove = 2;
        UtilService.moveObjectDown(myArray, elementToMove);
        expect(myArray[0].name).toEqual('a');
        expect(myArray[1].name).toEqual('b');
        expect(myArray[2].name).toEqual('c');
      });
    });
  }

  function calculateMeanTests() {
    describe('calculateMean()', () => {
      it('should calculate the mean when there is one value', () => {
        const values = [1];
        expect(UtilService.calculateMean(values)).toEqual(1);
      });

      it('should calculate the mean when there are multiple values', () => {
        const values = [1, 2, 3, 4, 10];
        expect(UtilService.calculateMean(values)).toEqual(4);
      });
    });
  }

  function getIntersectOfArraysTests() {
    describe('getIntersectOfArrays()', () => {
      it('should find the intersect of arrays when there are no common items', () => {
        const obj1 = {};
        const obj2 = {};
        const obj3 = {};
        const array1 = [obj1, obj2];
        const array2 = [obj3];
        const intersect = UtilService.getIntersectOfArrays(array1, array2);
        expect(intersect.length).toEqual(0);
      });

      it('should find the intersect of arrays when there are some common items', () => {
        const obj1 = {};
        const obj2 = {};
        const obj3 = {};
        const array1 = [obj1, obj2];
        const array2 = [obj2, obj3];
        const intersect = UtilService.getIntersectOfArrays(array1, array2);
        expect(intersect.length).toEqual(1);
      });

      it('should find the intersect of arrays when all are common items', () => {
        const obj1 = {};
        const obj2 = {};
        const obj3 = {};
        const array1 = [obj1, obj2, obj3];
        const array2 = [obj1, obj2, obj3];
        const intersect = UtilService.getIntersectOfArrays(array1, array2);
        expect(intersect.length).toEqual(3);
      });
    });
  }

  function isValidJSONStringTests() {
    describe('isValidJSONString()', () => {
      it('should return true if json string is valid', () => {
        const validJSON = '{"a":1,"b":2}';
        expect(UtilService.isValidJSONString(validJSON)).toBeTruthy();
        const validJSON2 = '[{"a":1},{"b":2}]';
        expect(UtilService.isValidJSONString(validJSON2)).toBeTruthy();
      });

      it('should return false for invalid json strings', () => {
        const invalidJSON = '{"a":1,"b":2';
        expect(UtilService.isValidJSONString(invalidJSON)).toBeFalsy();
      });
    });
  }
});
