'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The <compile> component compiles the "data" attribute of the element and replaces it in the element's HTML.
 * This is often used in rendering component's prompt string, as sometimes they contain other components like wiselink
 * that needs to be compiled before rendering.
 */
var CompileController = function CompileController($compile, $element, $scope) {
    var _this = this;

    _classCallCheck(this, CompileController);

    $scope.$watch(function () {
        return _this.data;
    }, function (data) {
        // update the html
        $element.html(data);
        $compile($element.contents())($scope);
    });
};

CompileController.$inject = ['$compile', '$element', '$scope'];

var Compile = {
    bindings: {
        data: '<'
    },
    controller: CompileController
};

exports.default = Compile;
//# sourceMappingURL=compile.js.map
