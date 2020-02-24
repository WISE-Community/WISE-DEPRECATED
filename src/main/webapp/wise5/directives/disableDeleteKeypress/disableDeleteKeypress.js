/**
 * Disable the backspace key so that it does not navigate the user back
 * in their browser history.
 */
class DisableDeleteKeypressController {
    constructor($document) {

        $document.bind('keydown', function (e) {

            // check for the delete key press
            if (e.keyCode === 8) {
                // the delete key was pressed

                // get the name of the node e.g. body, input, div, etc.
                let nodeName = e.target.nodeName;

                // get the type if applicable e.g. text, password, file, etc.
                let targetType = e.target.type;

                if (nodeName != null) {
                    nodeName = nodeName.toLowerCase();
                }

                if (targetType != null) {
                    targetType = targetType.toLowerCase();
                }

                let contentEditable = e.target.contentEditable === 'true';

                if ((nodeName === 'input' && targetType === 'text') ||
                    (nodeName === 'input' && targetType === 'password') ||
                    (nodeName === 'input' && targetType === 'file') ||
                    (nodeName === 'input' && targetType === 'search') ||
                    (nodeName === 'input' && targetType === 'email') ||
                    (nodeName === 'input' && targetType === 'number') ||
                    (nodeName === 'input' && targetType === 'date') ||
                    nodeName === 'textarea' || contentEditable) {
                    /*
                     * the user is typing in a valid input element so we will
                     * allow the delete key press
                     */
                } else {
                    /*
                     * the user is not typing in an input element so we will
                     * not allow the delete key press
                     */
                    e.preventDefault();
                }
            }
        });
    }
}

DisableDeleteKeypressController.$inject = ['$document'];

const DisableDeleteKeypress = {
    bindings: {
    },
    controller: DisableDeleteKeypressController
};

export default DisableDeleteKeypress;