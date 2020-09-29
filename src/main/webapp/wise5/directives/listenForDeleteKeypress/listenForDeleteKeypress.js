
/**
 * Listen for the backspace key press so we can perform special processing
 * specific for components such as deleting a point in a graph component.
 */
class ListenForDeleteKeypressController {
    constructor($document, StudentDataService) {
        this.StudentDataService = StudentDataService;
        this.deleteKeyCode = 8;
        $document.bind('keydown', (e) => {
            if (e.keyCode === this.deleteKeyCode) {
                this.StudentDataService.broadcastDeleteKeyPressed();
            }
        });
    }
}

ListenForDeleteKeypressController.$inject = ['$document', 'StudentDataService'];

const ListenForDeleteKeypress = {
    bindings: {
    },
    controller: ListenForDeleteKeypressController
};

export default ListenForDeleteKeypress;