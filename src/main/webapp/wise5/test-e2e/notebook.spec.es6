// E2E test for working with the notebook in preview mode
describe('WISE5 Notebook in Preview Mode', () => {

    var hasClass = (element, cls) => {
        return element.getAttribute('class').then((classes) => {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    };

    let notebookButton = element(by.xpath('//md-toolbar/button[@aria-label="View Notes"]'));
    let reportButton = element(by.xpath('//md-toolbar/button[@aria-label="View Report"]'));
    let addNoteButton = element(by.xpath('//md-toolbar/button[@aria-label="Add Notebook item"]'));
    let addNoteDialog = element(by.xpath('//md-dialog[@aria-label="Add note"]'));

    it('should load the vle and go to node 1 and show notebook buttons', () => {
        browser.get('http://localhost:8080/wise/project/demo#/vle/node1');
        let nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
        browser.wait((nodeDropDownMenu).isPresent(), 5000);  // give it at most 5 seconds to load.
        expect(browser.getTitle()).toEqual('WISE');
        expect(nodeDropDownMenu.getText()).toBe('1.1: HTML Step');
        expect(notebookButton.isPresent()).toBeTruthy();
        expect(reportButton.isPresent()).toBeTruthy();
        expect(addNoteButton.isPresent()).toBeTruthy();
        expect(addNoteDialog.isPresent()).toBeFalsy();
    });

    it('should open and close the notebook notes view', () => {
        // Click on the notebook icon to open the notebook notes view
        notebookButton.click();
        // the url should change to /notebook
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/notebook/');
        // check that UI elements are displayed
        let closeNotebookButton = element(by.xpath('//md-toolbar/div/button[@aria-label="Close Notebook"]'));
        expect(closeNotebookButton.isPresent()).toBeTruthy();
        let notebookTitle = $(".toolbar-title");
        expect(notebookTitle.getText()).toBe("Notes");

        // Clicking on the closeNotebookButton should dismiss the notebook and bring user back to original step
        closeNotebookButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node1');
    });

    it('should open and close the notebook report view', () => {
        // Click on the report icon to open the notebook report view
        reportButton.click();
        // the url should change to /notebook
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/notebook/');
        // check that UI elements are displayed
        let closeNotebookButton = element(by.xpath('//md-toolbar/div/button[@aria-label="Close Notebook"]'));
        expect(closeNotebookButton.isPresent()).toBeTruthy();
        let notebookTitle = $(".toolbar-title");
        expect(notebookTitle.getText()).toBe("Report");

        // Clicking on the closeNotebookButton should dismiss the notebook and bring user back to original step
        closeNotebookButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node1');
    });

    it('should open and close the add note view', () => {
        // Click on the add note icon to open the add note dialog
        addNoteButton.click();
        // the url should stay the same
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node1');
        // check that UI elements are displayed
        expect(addNoteDialog.isPresent()).toBeTruthy();
        expect(addNoteDialog.isDisplayed()).toBeTruthy();

        let closeNoteDialogButton = element(by.xpath('//md-dialog-actions/button[@aria-label="Cancel"]'));
        expect(closeNoteDialogButton.isPresent()).toBeTruthy();

        // Clicking on the closeNoteDialogButton should dismiss the add note dialog and bring user back to original step
        closeNoteDialogButton.click();
        expect(addNoteDialog.isPresent()).toBeFalsy();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node1');
    });
});