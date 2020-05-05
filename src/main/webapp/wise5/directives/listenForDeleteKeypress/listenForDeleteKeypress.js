
/**
 * Listen for the backspace key press so we can perform special processing
 * specific for components such as deleting a point in a graph component.
 */
class ListenForDeleteKeypressController {
    constructor($document, $rootScope) {
        $document.bind('keydown', (e) => {

            // check for the delete key press
            if (e.keyCode === 8) {
                // the delete key was pressed

                // fire the deleteKeyPressed event
                $rootScope.$broadcast('deleteKeyPressed');
            }
        });
    }
}

ListenForDeleteKeypressController.$inject = ['$document', '$rootScope'];


const ListenForDeleteKeypress = {
    bindings: {
    },
    controller: ListenForDeleteKeypressController
};

export default ListenForDeleteKeypress;