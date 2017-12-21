import angular from 'angular';
import mainModule from 'vle/main';
import 'angular-mocks';

describe('UtilService', () => {

  beforeEach(angular.mock.module(mainModule.name));

  let UtilService;

  beforeEach(inject((_UtilService_) => {
    UtilService = _UtilService_;
  }));

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

  describe('convertStringToNumber()', () => {
    it('should convert a number string to a number', () => {
      expect(UtilService.convertStringToNumber("5")).toEqual(5);
      expect(UtilService.convertStringToNumber("-100")).toEqual(-100);
    });

    it('should return null for null argument', () => {
      expect(UtilService.convertStringToNumber(null)).toBeNull();
    });

    it('should return non-null number string as is', () => {
      expect(UtilService.convertStringToNumber("abc")).toEqual("abc");
      expect(UtilService.convertStringToNumber("")).toEqual("");
    });
  })

  describe('makeCopyOfJSONObject()', () => {
    it('should copy an array object', () => {
      const array1 = [1, 2, 3];
      const copiedArray = UtilService.makeCopyOfJSONObject(array1);
      expect(copiedArray).toEqual(array1);
    });

    it('should copy an object', () => {
      const obj = {"name":"WISE", "address":"Berkeley"};
      const copiedObj = UtilService.makeCopyOfJSONObject(obj);
      expect(copiedObj).toEqual(obj);
    });
  });
});
