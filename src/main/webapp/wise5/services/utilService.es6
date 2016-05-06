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
    
    /**
     * Get the image object
     * @params img_b64 the base64 image string
     * @returns an image object
     */
    getImageObjectFromBase64String(img_b64) {
        
        // create a blob from the base64 image string
        var blob = this.dataURItoBlob(img_b64);
        
        var now = new Date().getTime();
        var filename = encodeURIComponent('picture_' + now + '.png');
        var pngFile = new File([blob], filename, {
            lastModified: now, // optional - default = now
            type: 'image/png' // optional - default = ''
        });
        
        return pngFile;
    }
    
    /**
     * Convert base64/URLEncoded data component to raw binary data held in a string
     * @param dataURI base64/URLEncoded data
     * @returns a Blob object
     */
    dataURItoBlob(dataURI) {
        
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type:mimeString});
    };
}

UtilService.$inject = [];

export default UtilService;
