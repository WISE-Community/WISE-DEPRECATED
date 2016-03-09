// E2E test for working with the notebook in preview mode
describe('WISE5 Student VLE Preview', () => {

    var hasClass = (element, cls) => {
        return element.getAttribute('class').then((classes) => {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    };

    browser.get('http://localhost:8080/wise/project/demo');
    var notebookButton = element(by.xpath('//button[@id="notebookButton"]'));
    var notebookSideNav = element(by.xpath('//md-sidenav'));  // side navigation bar for the notebook
    var addNoteButton = element(by.xpath('//button[@id="addNoteButton"]'));
    var newNoteDiv = element(by.xpath('//div[@id="newNote"]'));
    var newNoteTextArea = element(by.xpath('//textarea[@id="newNoteTextArea"]'));
    var saveNewNoteButton = element(by.xpath('//button[@id="saveNewNoteButton"]'));
    var cancelNewNoteButton = element(by.xpath('//button[@id="cancelNewNoteButton"]'));

    // MARK: Notebook tests

    // Returns true iff new note text area and buttons are displayed
    var verifyAddNewNoteDisplayed = (isDisplayed) => {
        if (isDisplayed) {
            expect(addNoteButton.getAttribute("aria-hidden")).toEqual('true');  // The +Note button should be hidden
            expect(newNoteDiv.getAttribute("aria-hidden")).toEqual('false');  // The new note div should be displayed
            expect(newNoteTextArea.getAttribute('placeholder')).toEqual('Type your note here...');  // There should be a placeholder text in the textarea
        } else {
            expect(addNoteButton.getAttribute("aria-hidden")).toEqual('false');  // The +Note button should be displayed
            expect(newNoteDiv.getAttribute("aria-hidden")).toEqual('true');  // The new note div should be hidden
        }
    };

    it('should open and close the notebook', () => {
        // Click on the notebook icon to open the notebook
        notebookButton.click();
        expect(hasClass(notebookSideNav, 'md-closed')).toBe(false);  // side nav should appear on the page with the notebook
        expect(notebookSideNav.element(by.tagName('h3')).getText()).toEqual("Notebook");
        verifyAddNewNoteDisplayed(false);

        // The drop-down filters should have 'all', 'notes', 'bookmarks', and 'questions' options
        element.all(by.repeater('filter in vleController.notebookFilters')).then((notebookFilterItems) => {
            var filter0 = notebookFilterItems[0];
            expect(filter0.getAttribute("value")).toEqual('all');
            var filter1 = notebookFilterItems[1];
            expect(filter1.getAttribute("value")).toEqual('notes');
        });

        // Hitting the escape key should dismiss the notebook
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        expect(hasClass(notebookSideNav, 'md-closed')).toBe(true);  // side nav should disappear
    });

    it('should allow user to add a new note in the notebook', () => {
        // Click on the notebook icon to open the notebook again
        notebookButton.click();
        expect(hasClass(notebookSideNav, 'md-closed')).toBe(false);  // side nav should appear on the page with the notebook

        addNoteButton.click();   // Open add note display
        verifyAddNewNoteDisplayed(true);

        // Save button should be disabled because user hasn't typed anything yet.
        expect(saveNewNoteButton.getAttribute("disabled")).not.toBeNull();

        // Canceling should hide the add note view without saving
        cancelNewNoteButton.click();
        verifyAddNewNoteDisplayed(false);

        // Add my first note
        addNoteButton.click();
        verifyAddNewNoteDisplayed(true);
        newNoteTextArea.sendKeys('my note #1');
        saveNewNoteButton.click();
        verifyAddNewNoteDisplayed(false);

        // Verify that the new note is displayed
        element.all(by.repeater('notebookItem in notebookController.notebook.items')).then((notebookItems) => {
            expect(notebookItems[0].getText()).toEqual('my note #1');
        });

        // Add my second note
        addNoteButton.click();
        verifyAddNewNoteDisplayed(true);
        newNoteTextArea.sendKeys('my note #2');
        saveNewNoteButton.click();
        verifyAddNewNoteDisplayed(false);

        // Verify that the first and second notes are displayed
        element.all(by.repeater('notebookItem in notebookController.notebook.items')).then((notebookItems) => {
            expect(notebookItems[0].getText()).toEqual('my note #1');
            expect(notebookItems[1].getText()).toEqual('my note #2');
        });

        // Clicking outside of the notebook should dismiss the notebook
        element(by.xpath('//body')).click();
        expect(hasClass(notebookSideNav, 'md-closed')).toBe(true);  // side nav should disappear
    })
});