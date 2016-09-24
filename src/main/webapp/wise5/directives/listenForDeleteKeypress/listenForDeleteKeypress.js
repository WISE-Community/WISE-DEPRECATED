'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Listen for the backspace key press so we can perform special processing
 * specific for components such as deleting a point in a graph component.
 */
var ListenForDeleteKeypressController = function ListenForDeleteKeypressController($document, $rootScope) {
    _classCallCheck(this, ListenForDeleteKeypressController);

    $document.bind('keydown', function (e) {

        // check for the delete key press
        if (e.keyCode === 8) {
            // the delete key was pressed

            // fire the deleteKeyPressed event
            $rootScope.$broadcast('deleteKeyPressed');
        }
    });
};

ListenForDeleteKeypressController.$inject = ['$document', '$rootScope'];

var ListenForDeleteKeypress = {
    bindings: {},
    controller: ListenForDeleteKeypressController
};

exports.default = ListenForDeleteKeypress;
//# sourceMappingURL=listenForDeleteKeypress.js.map