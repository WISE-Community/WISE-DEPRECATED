import { TestBed } from '@angular/core/testing';
import { UtilService } from '../../../../wise5/services/utilService';
import { UpgradeModule } from '@angular/upgrade/static';
let service: UtilService;

describe('UtilService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UpgradeModule],
      providers: [UtilService]
    });
    service = TestBed.get(UtilService);
  });

  generateKeyTests();
  convertStringToNumberTests();
  makeCopyOfJSONObjectTests();
  arrayHasNonNullElementTests();
  moveObjectTests();
  calculateMeanTests();
  getIntersectOfArraysTests();
  isValidJSONStringTests();
});

function generateKeyTests() {
  describe('generateKey()', () => {
    it('should return random keys of length 10 by default', () => {
      const generatedKey1 = service.generateKey();
      const generatedKey2 = service.generateKey();
      expect(generatedKey1.length).toEqual(10);
      expect(generatedKey2.length).toEqual(10);
      expect(generatedKey1).not.toEqual(generatedKey2);
    });

    it('should return random keys of specified length', () => {
      expect(service.generateKey(5).length).toEqual(5);
      expect(service.generateKey(23).length).toEqual(23);
    });

    it('should produce 100 unique random strings', () => {
      const generatedKeysSoFar = [];
      for (let i = 0; i < 100; i++) {
        const generatedKey = service.generateKey();
        expect(generatedKeysSoFar.includes(generatedKey)).toEqual(false);
        generatedKeysSoFar.push(generatedKey);
      }
    });
  });
}

function convertStringToNumberTests() {
  describe('convertStringToNumber()', () => {
    it('should convert a number string to a number', () => {
      expect(service.convertStringToNumber('5')).toEqual(5);
      expect(service.convertStringToNumber('-100')).toEqual(-100);
    });

    it('should return null for null argument', () => {
      expect(service.convertStringToNumber(null)).toBeNull();
    });

    it('should return non-null number string as is', () => {
      expect(service.convertStringToNumber('abc')).toEqual('abc');
      expect(service.convertStringToNumber('')).toEqual('');
    });
  });
}

function makeCopyOfJSONObjectTests() {
  describe('makeCopyOfJSONObject()', () => {
    it('should copy an array object', () => {
      const array1 = [1, 2, 3];
      const copiedArray = service.makeCopyOfJSONObject(array1);
      expect(copiedArray).toEqual(array1);
    });

    it('should copy an object', () => {
      const obj = { name: 'WISE', address: 'Berkeley' };
      const copiedObj = service.makeCopyOfJSONObject(obj);
      expect(copiedObj).toEqual(obj);
    });

    it('should return null for null input', () => {
      expect(service.makeCopyOfJSONObject(null)).toEqual(null);
    });
  });
}

function arrayHasNonNullElementTests() {
  describe('arrayHasNonNullElement()', () => {
    it('should return true if it has at least one non null element', () => {
      const arrayToCheck = [null, {}, null];
      expect(service.arrayHasNonNullElement(arrayToCheck)).toEqual(true);
    });

    it('should return false if it has all null elements', () => {
      const arrayToCheck = [null, null, null];
      expect(service.arrayHasNonNullElement(arrayToCheck)).toEqual(false);
    });

    it('should return true if it has all non null elements', () => {
      const arrayToCheck = [{}, {}, {}];
      expect(service.arrayHasNonNullElement(arrayToCheck)).toEqual(true);
    });
  });
}

let myArray;
function moveObjectTests() {
  describe('moveObject', () => {
    beforeEach(() => {
      myArray = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
    });
    moveObjectUpNotTopElement();
    moveObjectUpIsTopElement();
    moveObjectDownNotBottomElement();
    moveObjectDownIsBottomElement();
  });
}

function expectArrayNameOrder(arr, nameOrder) {
  for (let i = 0; i < arr.length; i++) {
    expect(arr[i].name).toEqual(nameOrder[i]);
  }
}

function moveObjectUpNotTopElement() {
  it('moveObjectUp should move an object up when the object is not the top element', () => {
    expectMoveFunctionResult('moveObjectUp', 1, ['b', 'a', 'c']);
  });
}

function moveObjectUpIsTopElement() {
  it('moveObjectUp should not move an object up when the object is the top element', () => {
    expectMoveFunctionResult('moveObjectUp', 0, ['a', 'b', 'c']);
  });
}

function moveObjectDownNotBottomElement() {
  it('moveObjectDown should move an object down when the object is not the bottom element', () => {
    expectMoveFunctionResult('moveObjectDown', 1, ['a', 'c', 'b']);
  });
}

function moveObjectDownIsBottomElement() {
  it('moveObjectDown should not move an object down when the object is the bottom element', () => {
    expectMoveFunctionResult('moveObjectDown', 2, ['a', 'b', 'c']);
  });
}

function expectMoveFunctionResult(func, index, expectedResult) {
  service[func](myArray, index);
  expectArrayNameOrder(myArray, expectedResult);
}

function calculateMeanTests() {
  describe('calculateMean()', () => {
    it('should calculate the mean when there is one value', () => {
      const values = [1];
      expect(service.calculateMean(values)).toEqual(1);
    });

    it('should calculate the mean when there are multiple values', () => {
      const values = [1, 2, 3, 4, 10];
      expect(service.calculateMean(values)).toEqual(4);
    });
  });
}

function getIntersectOfArraysTests() {
  describe('getIntersectOfArrays()', () => {
    const obj1 = {};
    const obj2 = {};
    const obj3 = {};
    it('should find the intersect of arrays when there are no common items', () => {
      const array1 = [obj1, obj2];
      const array2 = [obj3];
      const intersect = service.getIntersectOfArrays(array1, array2);
      expect(intersect.length).toEqual(0);
    });

    it('should find the intersect of arrays when there are some common items', () => {
      const array1 = [obj1, obj2];
      const array2 = [obj2, obj3];
      const intersect = service.getIntersectOfArrays(array1, array2);
      expect(intersect.length).toEqual(1);
    });

    it('should find the intersect of arrays when all are common items', () => {
      const array1 = [obj1, obj2, obj3];
      const array2 = [obj1, obj2, obj3];
      const intersect = service.getIntersectOfArrays(array1, array2);
      expect(intersect.length).toEqual(3);
    });
  });
}

function isValidJSONStringTests() {
  describe('isValidJSONString()', () => {
    it('should return true if json string is valid', () => {
      const validJSON = '{"a":1,"b":2}';
      expect(service.isValidJSONString(validJSON)).toBeTruthy();
      const validJSON2 = '[{"a":1},{"b":2}]';
      expect(service.isValidJSONString(validJSON2)).toBeTruthy();
    });

    it('should return false for invalid json strings', () => {
      const invalidJSON = '{"a":1,"b":2';
      expect(service.isValidJSONString(invalidJSON)).toBeFalsy();
    });
  });
}
