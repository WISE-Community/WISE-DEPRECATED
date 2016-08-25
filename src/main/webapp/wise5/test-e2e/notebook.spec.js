'use strict';

// E2E test for working with the notebook in preview mode
describe('WISE5 Notebook in Preview Mode', function () {

    var hasClass = function hasClass(element, cls) {
        return element.getAttribute('class').then(function (classes) {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    };

    var notebookButton = element(by.xpath('//md-toolbar/button[@aria-label="View Notes"]'));
    var reportButton = element(by.xpath('//md-toolbar/button[@aria-label="View Report"]'));
    var addNoteButton = element(by.xpath('//md-toolbar/button[@aria-label="Add Notebook item"]'));

    it('should load the vle and go to node 1 and show notebook buttons', function () {
        browser.get('http://localhost:8080/wise/project/demo#/vle/node1');
        var nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
        browser.wait(nodeDropDownMenu.isPresent(), 5000); // give it at most 5 seconds to load.
        expect(browser.getTitle()).toEqual('WISE');
        expect(nodeDropDownMenu.getText()).toBe('1.1: Introduction to Newton Scooters');
        expect(notebookButton.isPresent()).toBeTruthy();
        expect(reportButton.isPresent()).toBeTruthy();
        expect(addNoteButton.isPresent()).toBeTruthy();
    });

    it('should open and close the notebook', function () {
        // Click on the notebook icon to open the notebook
        notebookButton.click();
        // the url should change to /notebook
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/notebook/');
        // check that UI elements are displayed
        var closeNotebookButton = element(by.xpath('//md-toolbar/div/button[@aria-label="Close Notebook"]'));
        expect(closeNotebookButton.isPresent()).toBeTruthy();
        var notebookTitle = $(".toolbar-title");
        expect(notebookTitle.getText()).toBe("Notes");

        // Clicking on the closeNotebookButton should dismiss the notebook and bring user back to original step
        closeNotebookButton.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node1');
    });
});
//# sourceMappingURL=notebook.spec.js.map