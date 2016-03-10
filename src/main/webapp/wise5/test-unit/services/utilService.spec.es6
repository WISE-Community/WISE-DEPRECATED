import angular from 'angular';
import mainModule from 'vle/main';
import 'angular-mocks';

describe('UtilService Unit Test', () => {

    var UtilService;

    beforeEach(angular.mock.module(mainModule.name));

    beforeEach(inject((_UtilService_) => {
        UtilService = _UtilService_;
    }));

    describe('UtilService', () => {

        // Test UtilService.generateKey()
        it('should return random keys', () => {
            // Calling generate key with no params should return length 10 string
            let generatedKey1 = UtilService.generateKey();
            let generatedKey2 = UtilService.generateKey();
            expect(generatedKey1.length).toEqual(10);
            expect(generatedKey2.length).toEqual(10);
            expect(generatedKey1).not.toEqual(generatedKey2);

            // Calling generate key with length key should produce key with specified length
            let genetatedKey3 = UtilService.generateKey(5);
            expect(genetatedKey3.length).toEqual(5);

            // Calling generate key 100 times should produce 100 unique random strings
            let generatedKeysSoFar = [];
            for (let i = 0; i < 100; i++) {
                let generatedKey = UtilService.generateKey();
                expect(generatedKeysSoFar.indexOf(generatedKey)).toEqual(-1);
                generatedKeysSoFar.push(generatedKey);
            }
        });

        // Test UtilService.convertStringToNumber()
        it('should convert a string to a number', () => {
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