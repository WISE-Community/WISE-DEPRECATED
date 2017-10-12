function hasClass(element, cls) {
    return element.getAttribute('class').then((classes) => {
        return classes.split(' ').indexOf(cls) !== -1;
    });
};

// TODO: this test should not depend on project created in authoringTool.spec.es6
// E2E test for Setting up a run.
// The project we created in authoringTool.spec.es6
// should now be available in the Project Library.
describe('WISE Setting Up a Run', () => {

    it('should require teacher user to log in to view the project library', () => {
        isAngularSite(false);
        browser.get('http://localhost:8080/wise/login');

        expect(browser.getTitle()).toEqual('Sign In');
    });

    it('should log in using preview username and password and open the project library', () => {
        isAngularSite(false);
        $('#username').sendKeys('preview');
        $('#password').sendKeys('wise');
        $('#signInButton').click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/teacher');
        expect(browser.getTitle()).toEqual('WISE Teacher Dashboard');

        // click on the project library link
        let projectLibraryLink = $('#projectLibraryLink');
        expect(projectLibraryLink.isPresent()).toBeTruthy();
        projectLibraryLink.click();

        // check that the user is now on the Project Library page and has projects
        expect(browser.getTitle()).toEqual('Project Library');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/teacher/management/library.html');

        // search for the newly created project
        let keywordFilterInput = $("#activeProjects input[type=text]");
        expect(keywordFilterInput.isPresent()).toBeTruthy();
        keywordFilterInput.sendKeys("My Awesome Science Project");
        keywordFilterInput.sendKeys(protractor.Key.ENTER);

        // filter by owned project
        let ownedSearch = $("#activeProjects #owned_search_0 a");
        expect(ownedSearch.isPresent()).toBeTruthy();
        ownedSearch.click();

        // get the first project in the filter result, which is the WISE5 project we created earlier.
        let setUpRunLink = $(".setupRun");
        setUpRunLink.click();
    });

    it('should display the set up run wizard page 1', () => {
        // check that the user is now on the set up run wizard page 1
        expect(browser.getTitle()).toEqual('Setting Up a Project Run - Step 1');
        let nextButton = $('#nextButt');
        expect(nextButton.isPresent()).toBeTruthy();
        nextButton.click();
    });

    it('should display the set up run wizard page 2', () => {
        // check that the user is now on the set up run wizard page 2
        expect(browser.getTitle()).toEqual('Setting Up a Project Run - Step 2');
        let nextButton = $('#nextButt');
        expect(nextButton.isPresent()).toBeTruthy();
        nextButton.click();
    });

    it('should display the set up run wizard page 3', () => {
        // check that the user is now on the set up run wizard page 3
        expect(browser.getTitle()).toEqual('Setting Up a Project Run - Step 3');

        // choose period 1
        $('#PERIOD_1').click();

        let nextButton = $('#nextButt');
        expect(nextButton.isPresent()).toBeTruthy();
        nextButton.click();
    });

    it('should display the set up run wizard page 4', () => {
        // check that the user is now on the set up run wizard page 4
        expect(browser.getTitle()).toEqual('Setting Up a Project Run - Step 4');
        let nextButton = $('#nextButt');
        expect(nextButton.isPresent()).toBeTruthy();
        nextButton.click();
    });

    it('should display the set up run wizard page 5', () => {
        // check that the user is now on the set up run wizard page 5
        expect(browser.getTitle()).toEqual('Setting Up a Project Run - Step 5');
        let submitFormButton = $('#submit_form');
        expect(submitFormButton.isPresent()).toBeTruthy();
        submitFormButton.click();
    });

    let newRunId;
    let newRunCode;

    it('should display the classroom run created confirmation page', () => {
        // check that the user is now on the classroom run created confirmation page
        expect(browser.getTitle()).toEqual('Classroom Run Created!');
        let runCode = $('#runCode').getText();
        runCode.then((value) => {
            newRunCode = value;
        });
        let runId = $('#runId').getText();
        runId.then((value) => {
            newRunId = value;
        });
        let myClassroomRunLink = $('#myClassroomRunLink');
        expect(myClassroomRunLink.isPresent()).toBeTruthy();
        myClassroomRunLink.click();
    });

    it('should display the my classroom runs page', () => {
        // check that the user is now on the my classroom runs page and the new run is listed.
        expect(browser.getTitle()).toEqual('My Classroom Runs');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/teacher/management/classroomruns.html');
        expect(element(by.cssContainingText('.runRow .accesscode', newRunCode)).isPresent()).toBeTruthy();
    });

    it('should sign out', () => {
        isAngularSite(false);
        let signOutButton = $("#signOut");
        expect(signOutButton.isPresent()).toBeTruthy();
        signOutButton.click();
        expect(browser.getTitle()).toEqual('Web-based Inquiry Science Environment (WISE)');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/wise/');
    });
});
