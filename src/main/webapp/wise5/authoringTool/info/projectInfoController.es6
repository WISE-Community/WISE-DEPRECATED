'use strict';

class ProjectInfoController {

    constructor($filter,
                $mdDialog,
                $rootScope,
                $state,
                $stateParams,
                $scope,
                $timeout,
                ConfigService,
                ProjectService,
                UtilService) {

        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.UtilService = UtilService;
        this.$translate = this.$filter('translate');

        // process metadata
        this.metadata = this.ProjectService.getProjectMetadata();
        this.metadataAuthoring = this.ConfigService.getConfigParam("projectMetadataSettings");
        this.processMetadataAuthoring();

    };

    processMetadataAuthoring() {

        let metadataAuthoring = this.metadataAuthoring;

        if (metadataAuthoring != null) {

            let fields = metadataAuthoring.fields;

            for (let f = 0; f < fields.length; f++) {
                let field = fields[f];

                if (field != null) {
                    let metadataField = this.metadata[field.key];

                    if (field.type == 'checkbox') {
                        field.choicesMapping = {};
                        if (metadataField != null) {
                            let choices = field.choices;

                            if (choices != null) {
                                for (let c = 0; c < choices.length; c++) {
                                    let choice = choices[c];

                                    if (choice != null) {
                                        // check if user has checked this metadata field
                                        let userCheckedThisMetadataField = false;
                                        for (let metadataFieldChoiceIndex = 0; metadataFieldChoiceIndex < metadataField.length; metadataFieldChoiceIndex++) {
                                            let metadataFieldChoice = metadataField[metadataFieldChoiceIndex];
                                            if (metadataFieldChoice != null && metadataFieldChoice == choice) {
                                                userCheckedThisMetadataField = true;
                                                break;
                                            }
                                        }
                                        if (userCheckedThisMetadataField) {
                                            field.choicesMapping[choice] = true;
                                        } else {
                                            field.choicesMapping[choice] = false;
                                        }
                                    }
                                }
                            }
                        }
                    } else if (field.type == 'radio') {

                    }
                }
            }
        }
    };


    // returns the choice text that is appropriate for user's locale
    getMetadataChoiceText(choice) {
        let choiceText = choice;

        // see if there is choice text in this user's locale
        let userLocale = this.ConfigService.getLocale();  // user's locale
        let i18nMapping = this.metadataAuthoring.i18n; // texts in other languages
        let i18nMappingContainingChoiceTextArray = Object.values(i18nMapping).filter(function (onei18nMapping) {
            return Object.values(onei18nMapping).indexOf(choice) != -1;
        });
        if (i18nMappingContainingChoiceTextArray != null && i18nMappingContainingChoiceTextArray.length > 0) {
            let i18nMappingContainingChoiceText = i18nMappingContainingChoiceTextArray[0]; // shouldn't be more than one, but if so, use the first one we find
            if (i18nMappingContainingChoiceText[userLocale] != null) {
                choiceText = i18nMappingContainingChoiceText[userLocale];
            }
        }
        return choiceText;
    };

    metadataChoiceIsChecked(metadataField, choice) {
        return this.getMetadataChoiceText(this.metadata[metadataField.key]) == this.getMetadataChoiceText(choice);
    };

    metadataCheckboxClicked(metadataField, choice) {

        let checkedChoices = [];

        let choices = metadataField.choices;
        for (let c = 0; c < choices.length; c++) {
            let choice = choices[c];

            let checked = metadataField.choicesMapping[choice];

            if (checked) {
                checkedChoices.push(this.getMetadataChoiceText(choice));
            }
        }

        this.metadata[metadataField.key] = checkedChoices;

        this.save();
    };

    metadataRadioClicked(metadataField, choice) {
        this.metadata[metadataField.key] = this.getMetadataChoiceText(choice);

        this.save();
    };

    save() {
        this.ProjectService.saveProject(); // save the project
    }

}

ProjectInfoController.$inject = [
    '$filter',
    '$mdDialog',
    '$rootScope',
    '$state',
    '$stateParams',
    '$scope',
    '$timeout',
    'ConfigService',
    'ProjectService',
    'UtilService'
];

export default ProjectInfoController;
