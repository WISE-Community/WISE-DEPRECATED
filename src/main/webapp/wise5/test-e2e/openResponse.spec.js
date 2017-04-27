'use strict';

// E2E test for Open Response component in preview mode
describe('WISE5 Open Response', function () {

    var hasClass = function hasClass(element, cls) {
        return element.getAttribute('class').then(function (classes) {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    };

    var saveButton = element(by.xpath('//button[@translate="SAVE"]'));
    var saveMessage = element(by.xpath('//span[@ng-show="openResponseController.saveMessage.text"]'));
    var submitButton = element(by.xpath('//button[@translate="SUBMIT"]'));
    var textarea = element(by.xpath('//textarea[@ng-change="openResponseController.studentDataChanged()"]'));

    it('should load the vle and go to node 2', function () {
        browser.get('http://localhost:8080/wise/project/demo#/vle/node2');
        var nodeDropDownMenu = element(by.model("stepToolsCtrl.toNodeId"));
        browser.wait(nodeDropDownMenu.isPresent(), 5000); // give it at most 5 seconds to load.
        expect(browser.getTitle()).toEqual('WISE');
        expect(nodeDropDownMenu.getText()).toBe('1.2: Open Response Step');

        var nodeContent = element(by.cssContainingText('.node-content', 'This is a step where students enter text.'));
        expect(nodeContent.isPresent()).toBeTruthy();
        expect(textarea.isPresent()).toBeTruthy();

        // save and submit buttons should be displayed but disabled
        expect(saveButton.isPresent()).toBeTruthy();
        expect(hasClass(saveButton, "disabled"));
        expect(submitButton.isPresent()).toBeTruthy();
        expect(hasClass(submitButton, "disabled"));
        expect(saveMessage.getText()).toBe(""); // there should be nothing in the save message
    });

    it('should allow students to type text and save', function () {
        var firstSentence = 'Here is my first sentence. ';
        var secondSentence = 'Here is my second sentence.';
        textarea.sendKeys(firstSentence);

        // save and submit buttons should now be enabled
        expect(!hasClass(saveButton, "disabled"));
        expect(!hasClass(submitButton, "disabled"));

        // click on save button
        saveButton.click();
        expect(saveMessage.getText()).toContain("Saved"); // save message should show the last saved time

        // save buttons should be displayed but disabled, but the submit button should still be enabled.
        expect(hasClass(saveButton, "disabled"));
        expect(!hasClass(submitButton, "disabled"));

        // click on submit button
        submitButton.click();
        expect(saveMessage.getText()).toContain("Submitted"); // save message should show the last submitted time

        // save buttons and submit buttons should both be disabled.
        expect(!hasClass(saveButton, "disabled"));
        expect(!hasClass(submitButton, "disabled"));

        // you should be able to edit your text
        textarea.sendKeys(secondSentence);
        expect(textarea.getAttribute('value')).toEqual(firstSentence + secondSentence); // check the value in the textarea
    });
});
//# sourceMappingURL=openResponse.spec.js.map