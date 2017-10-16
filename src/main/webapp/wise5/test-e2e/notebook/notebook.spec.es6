let hasClass = (element, cls) => {
    return element.getAttribute('class').then((classes) => {
        return classes.split(' ').indexOf(cls) !== -1;
    });
};

// E2E test for working with the notebook in preview mode
describe('WISE5 Notebook in Preview Mode', () => {
    let notebookButton = element(by.tagName('notebook'));
    let notebookReport = element(by.tagName('notebook-report'));
    let notebookReportToolbar = notebookReport.element(by.css('.notebook-report__toolbar'));
    let notebookReportContainer = notebookReport.element(by.css('.notebook-report-container'));
    let notebookLauncherButton = element(by.xpath('//button[@aria-label="Notebook"]'));
    let addNoteButton = element(by.xpath('//button[@aria-label="Add note"]'));  // add note button in fab menu
    let addNoteDialog = element(by.xpath('//md-dialog[@aria-label="Add note"]'));  // dialog for adding a new note
    let insertNoteButton = element(by.css('.notebook-item--report__add-note'));  // insert note button inside report dialog
    let fullScreenButton = element(by.css('[ng-click="$ctrl.fullscreen()"]'));
    let collapseButton = element(by.css('[ng-click="$event.stopPropagation(); $ctrl.collapse()"]'));
    let notebookDialog = element(by.xpath('//notebook-notes/md-sidenav'));

    it('should load the vle and go to node 1 and show notebook buttons', () => {
        browser.get('http://localhost:8080/wise/project/demo#/vle/node1');
        let nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
        browser.wait((nodeDropDownMenu).isPresent(), 5000);  // give it at most 5 seconds to load.
        expect(browser.getTitle()).toEqual('WISE');
        expect(nodeDropDownMenu.getText()).toBe('1.1: HTML Step');
        expect(notebookButton.isDisplayed()).toBeTruthy();
        expect(notebookReport.isDisplayed()).toBeTruthy();
        expect(notebookDialog.isDisplayed()).toBeFalsy();

        expect(notebookReportToolbar.isDisplayed()).toBeTruthy();
        expect(notebookLauncherButton.isDisplayed()).toBeTruthy();
        expect(insertNoteButton.isDisplayed()).toBeFalsy();
        expect(fullScreenButton.isDisplayed()).toBeTruthy();
        expect(collapseButton.isDisplayed()).toBeTruthy();
        expect(hasClass(notebookReportContainer, 'notebook-report-container__collapsed')).toBeTruthy(); // notebook report should be collapsed at this point
    });

    it('should open the report in different modes', () => {
        notebookReportToolbar.click(); // clicking on the notebook report should display the report
        expect(notebookLauncherButton.isDisplayed()).toBeTruthy(); // notebook fab icon should still be displayed
        expect(insertNoteButton.isDisplayed()).toBeTruthy();
        expect(fullScreenButton.isDisplayed()).toBeTruthy();
        expect(collapseButton.isDisplayed()).toBeTruthy();
        expect(hasClass(notebookReportContainer, 'notebook-report-container__collapsed')).toBeFalsy(); // notebook report should be displayed at this point, in small view

        collapseButton.click(); // clicking on collapse button should minimize the report
        expect(notebookReportToolbar.isDisplayed()).toBeTruthy();
        expect(notebookLauncherButton.isDisplayed()).toBeTruthy(); // notebook fab icon should still be displayed
        expect(insertNoteButton.isDisplayed()).toBeFalsy();
        expect(fullScreenButton.isDisplayed()).toBeTruthy();
        expect(collapseButton.isDisplayed()).toBeTruthy();
        expect(hasClass(notebookReportContainer, 'notebook-report-container__collapsed')).toBeTruthy(); // notebook report should be collapsed at this point

        fullScreenButton.click();  // clicking on fullscreen button should display the report in full screen mode.
        expect(notebookLauncherButton.isDisplayed()).toBeTruthy(); // notebook fab icon should still be displayed
        expect(insertNoteButton.isDisplayed()).toBeTruthy();
        expect(fullScreenButton.isDisplayed()).toBeTruthy();
        expect(collapseButton.isDisplayed()).toBeTruthy();
        expect(hasClass(notebookReportContainer, 'notebook-report-container__collapsed')).toBeFalsy(); // notebook report should be displayed at this point, in full view
        expect(hasClass(notebookReportContainer, 'notebook-report-container__full')).toBeTruthy(); // notebook report should be displayed at this point, in full view

        collapseButton.click(); // clicking on collapse button should minimize the report
        collapseButton.click();  // clicking on collapse button should display the report in full screen mode again
        expect(notebookLauncherButton.isDisplayed()).toBeTruthy(); // notebook fab icon should still be displayed
        expect(insertNoteButton.isDisplayed()).toBeTruthy();
        expect(fullScreenButton.isDisplayed()).toBeTruthy();
        expect(collapseButton.isDisplayed()).toBeTruthy();
        expect(hasClass(notebookReportContainer, 'notebook-report-container__collapsed')).toBeFalsy(); // notebook report should be displayed at this point, in full view
        expect(hasClass(notebookReportContainer, 'notebook-report-container__full')).toBeTruthy(); // notebook report should be displayed at this point, in full view
        collapseButton.click(); // clicking on collapse button should minimize the report
    });

    it('should snip image to notebook', () => {
        let nyanCatImage = element(by.xpath('//img[@src="/wise/curriculum/demo/assets/nyan_cat.png"]'));
        expect(nyanCatImage.isDisplayed()).toBeTruthy();
        nyanCatImage.click();  // click on the nyan cat image
        expect(addNoteDialog.isDisplayed()).toBeTruthy();  // add note dialog should appear
        let addNoteCancelButton = addNoteDialog.element(by.xpath('//md-dialog-actions/button[@aria-label="Cancel"]'));
        expect(addNoteCancelButton.isPresent()).toBeTruthy();

        // clicking on the cancelAddNoteButton should dismiss the add note dialog
        addNoteCancelButton.click();
        expect(addNoteDialog.isPresent()).toBeFalsy();

        // add the nyan cat image note without text
        nyanCatImage.click();  // click on the nyan cat image
        expect(addNoteDialog.isDisplayed()).toBeTruthy();  // add note dialog should appear
        let addNoteSaveButton = addNoteDialog.element(by.xpath('//md-dialog-actions/button[@aria-label="Save"]'));
        expect(addNoteSaveButton.isPresent()).toBeTruthy();
        addNoteSaveButton.click();
        expect(addNoteDialog.isPresent()).toBeFalsy(); // adding note should close the add note dialog
    });

    it('should open and close the notebook notes view', () => {
        // Click on the notebook icon to open the notebook notes view
        notebookLauncherButton.click();
        //browser.wait((addNoteButton).isPresent(), 1000);  // give it at most 1 seconds to load.
        expect(notebookDialog.isDisplayed()).toBeTruthy(); // should display the notebook notes dialog
        expect(addNoteButton.isDisplayed()).toBeTruthy();

        // should display the notes added from above
        element.all(by.repeater("(localNotebookItemId, notes) in $ctrl.notebook.items")).then((notes) => {
            expect(notes.length).toEqual(1);
        });

        // hitting the close button should dismiss the notebook dialog
        let closeNotebookButton = element(by.xpath('//notebook-notes/md-sidenav/md-toolbar/div/button[@aria-label="Close"]'));
        //let closeNotebookButton = notebookDialog.element(by.xpath('//button[@aria-label="Close"]'));
        expect(closeNotebookButton.isPresent()).toBeTruthy();
        closeNotebookButton.click();
        expect(notebookDialog.isDisplayed()).toBeFalsy();

        // open the notebook notes view again
        notebookLauncherButton.click();
        expect(notebookDialog.isDisplayed()).toBeTruthy(); // should display the notebook notes dialog
        expect(addNoteButton.isDisplayed()).toBeTruthy();

        // hitting the escape key should also dismiss the notebook dialog
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        expect(notebookDialog.isDisplayed()).toBeFalsy();
    });

    /*
     TODO: update these tests to match the new UI design


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
        let noteTextarea = element(by.xpath('//textarea[@placeholder="Note text..."]'));
        expect(noteTextarea.isPresent()).toBeTruthy();

        let saveNoteDialogButton = element(by.xpath('//md-dialog-actions/button[@aria-label="Save"]'));
        expect(saveNoteDialogButton.isPresent()).toBeTruthy();
        expect(saveNoteDialogButton.getAttribute("disabled")).toBe("true");  // the save button should be disabled because user hasn't typed anything.

        let closeNoteDialogButton = element(by.xpath('//md-dialog-actions/button[@aria-label="Cancel"]'));
        expect(closeNoteDialogButton.isPresent()).toBeTruthy();

        // Clicking on the closeNoteDialogButton should dismiss the add note dialog and bring user back to original step
        closeNoteDialogButton.click();
        expect(addNoteDialog.isPresent()).toBeFalsy();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node1');
    });

    it('should add text note', () => {
        // Click on the add note icon to open the add note dialog
        addNoteButton.click();
        // the url should stay the same
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node1');
        // check that UI elements are displayed
        expect(addNoteDialog.isPresent()).toBeTruthy();
        expect(addNoteDialog.isDisplayed()).toBeTruthy();
        let noteTextarea = element(by.xpath('//textarea[@placeholder="Note text..."]'));
        expect(noteTextarea.isPresent()).toBeTruthy();

        let saveNoteDialogButton = element(by.xpath('//md-dialog-actions/button[@aria-label="Save"]'));
        expect(saveNoteDialogButton.isPresent()).toBeTruthy();
        expect(saveNoteDialogButton.getAttribute("disabled")).toBe("true");  // the save button should be disabled because user hasn't typed anything.

        noteTextarea.clear();
        noteTextarea.sendKeys('This is my text note!');
        saveNoteDialogButton.click();

        expect(addNoteDialog.isPresent()).toBeFalsy();  // clicking on the save button shoud hide the note.
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/vle/node1');

        // Click on the notebook icon to open the notebook notes view
        notebookButton.click();
        // the url should change to /notebook
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/project/demo#/notebook/');

        // Check to see that the new note shows up in the notes view
        let newNoteItemDiv = element(by.xpath('//notebook-item/ng-include/md-card/md-card-content'));
        expect(newNoteItemDiv.isPresent()).toBeTruthy();
        expect(newNoteItemDiv.getText()).toBe('This is my text note!');
        //let deleteNotebookItemButton = element(by.xpath('//md-card-actions/button[@aria-label="Delete notebook item"]'));
        //expect(deleteNotebookItemButton.isPresent()).toBeTruthy();
        var notebookItemContentLocation = element(by.cssContainingText('.notebook-item__content__location','1.1'));
        expect(notebookItemContentLocation.isPresent()).toBeTruthy();
    });
    */
});
