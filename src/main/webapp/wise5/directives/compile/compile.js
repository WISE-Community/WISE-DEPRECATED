/**
 * The <compile> component compiles the "data" attribute of the element and replaces it in the element's HTML.
 * This is often used in rendering component's prompt string, as sometimes they contain other components like wiselink
 * that needs to be compiled before rendering.
 */
class CompileController {
    constructor($compile, $element, $scope) {

        $scope.$watch(() => {
            return this.data;
        }, (data) => {
            // update the html
            $element.html(data);
            $compile($element.contents())($scope);
        })
    }
}

CompileController.$inject = ['$compile', '$element', '$scope'];

const Compile = {
    bindings: {
        data: '<'
    },
    controller: CompileController
};

export default Compile;
