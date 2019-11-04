'use strict';

let Filters = angular.module('filters', [])
    .filter('sanitizeHTML', ['$sce', function($sce) {
        return function(htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        };
    }])

    .filter('appropriateSizeText', function() {
        /**
         * Given a string of a number of bytes, returns a string of the size
         * in either: bytes, kilobytes or megabytes depending on the size.
         */
        return function(bytes) {
            /**
             * Returns the given number @param num to the nearest
             * given decimal place @param decimal. (e.g if called
             * roundToDecimal(4.556, 1) it will return 4.6.
             */
            var roundToDecimal = function(num, decimal) {
                var rounder = 1;
                if (decimal) {
                    rounder = Math.pow(10, decimal);
                };

                return Math.round(num*rounder) / rounder;
            };

            if (bytes > 1048576) {
                return roundToDecimal(((bytes/1024) / 1024), 1) + ' mb';
            } else if (bytes > 1024) {
                return roundToDecimal((bytes/1024), 1) + ' kb';
            } else {
                return bytes + ' b';
            };
        };
    })

    /**
     * Returns the given number @param num to the nearest
     * given decimal place @param decimal. (e.g if called
     * roundToDecimal(4.556, 1) it will return 4.6.
     */
    .filter('roundToDecimal', function() {

        return function(num, decimal) {
            var rounder = 1;
            if (decimal) {
                rounder = Math.pow(10, decimal);
            };

            return Math.round(num*rounder) / rounder;
        };
    });

export default Filters;