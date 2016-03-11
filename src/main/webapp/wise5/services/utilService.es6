'use strict';

class UtilService {

    constructor() {
    }

    /**
     * Generates and returns a random key of the given length if
     * specified. If length is not specified, returns a key 10
     * characters in length.
     */
    generateKey(length) {
        this.CHARS = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r", "s","t",
            "u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9"];

        /* set default length if not specified */
        if (!length) {
            length = 10;
        }

        /* generate the key */
        var key = '';
        for (var a = 0; a < length; a++) {
            key += this.CHARS[Math.floor(Math.random() * (this.CHARS.length - 1))];
        }

        /* return the generated key */
        // TODO: check that the new key is unique
        return key;
    };

    /**
     * Try to convert a string to a number
     * @param str the string to convert
     * @returns a number if we were able to convert the string to a number.
     * if we couldn't convert the string to a number we will just return the string.
     */
    convertStringToNumber(str) {
        var result = str;

        if (str != null && str != '' && !isNaN(Number(str))) {
            result = Number(str);
        }

        return result;
    };

    /**
     * Create a copy of a JSON object
     * @param jsonObject the JSON object to get a copy of
     * @return a copy of the JSON object that was passed in
     */
    makeCopyOfJSONObject(jsonObject) {
        var copyOfJSONObject = null;

        if (jsonObject != null) {
            // create a JSON string from the JSON object
            var jsonObjectString = angular.toJson(jsonObject);

            // create a JSON object from the JSON string
            copyOfJSONObject = angular.fromJson(jsonObjectString);
        }

        return copyOfJSONObject;
    };
}

UtilService.$inject = [];

export default UtilService;
