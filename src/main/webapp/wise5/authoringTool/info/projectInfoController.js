'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectInfoController = function () {
    function ProjectInfoController($filter, $mdDialog, $rootScope, $state, $stateParams, $scope, $timeout, ConfigService, ProjectService, UtilService) {
        _classCallCheck(this, ProjectInfoController);

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
    }

    _createClass(ProjectInfoController, [{
        key: 'processMetadataAuthoring',
        value: function processMetadataAuthoring() {

            var metadataAuthoring = this.metadataAuthoring;

            if (metadataAuthoring != null) {

                var fields = metadataAuthoring.fields;

                for (var f = 0; f < fields.length; f++) {
                    var field = fields[f];

                    if (field != null) {
                        var metadataField = this.metadata[field.key];

                        if (field.type == 'checkbox') {
                            field.choicesMapping = {};
                            if (metadataField != null) {
                                var choices = field.choices;

                                if (choices != null) {
                                    for (var c = 0; c < choices.length; c++) {
                                        var choice = choices[c];

                                        if (choice != null) {
                                            // check if user has checked this metadata field
                                            var userCheckedThisMetadataField = false;
                                            for (var metadataFieldChoiceIndex = 0; metadataFieldChoiceIndex < metadataField.length; metadataFieldChoiceIndex++) {
                                                var metadataFieldChoice = metadataField[metadataFieldChoiceIndex];
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
                        } else if (field.type == 'radio') {}
                    }
                }
            }
        }
    }, {
        key: 'getMetadataChoiceText',


        // returns the choice text that is appropriate for user's locale
        value: function getMetadataChoiceText(choice) {
            var choiceText = choice;

            // see if there is choice text in this user's locale
            var userLocale = this.ConfigService.getLocale(); // user's locale
            var i18nMapping = this.metadataAuthoring.i18n; // texts in other languages
            var i18nMappingContainingChoiceTextArray = Object.values(i18nMapping).filter(function (onei18nMapping) {
                return Object.values(onei18nMapping).indexOf(choice) != -1;
            });
            if (i18nMappingContainingChoiceTextArray != null && i18nMappingContainingChoiceTextArray.length > 0) {
                var i18nMappingContainingChoiceText = i18nMappingContainingChoiceTextArray[0]; // shouldn't be more than one, but if so, use the first one we find
                if (i18nMappingContainingChoiceText[userLocale] != null) {
                    choiceText = i18nMappingContainingChoiceText[userLocale];
                }
            }
            return choiceText;
        }
    }, {
        key: 'metadataChoiceIsChecked',
        value: function metadataChoiceIsChecked(metadataField, choice) {
            return this.getMetadataChoiceText(this.metadata[metadataField.key]) == this.getMetadataChoiceText(choice);
        }
    }, {
        key: 'metadataCheckboxClicked',
        value: function metadataCheckboxClicked(metadataField, choice) {

            var checkedChoices = [];

            var choices = metadataField.choices;
            for (var c = 0; c < choices.length; c++) {
                var _choice = choices[c];

                var checked = metadataField.choicesMapping[_choice];

                if (checked) {
                    checkedChoices.push(this.getMetadataChoiceText(_choice));
                }
            }

            this.metadata[metadataField.key] = checkedChoices;

            this.save();
        }
    }, {
        key: 'metadataRadioClicked',
        value: function metadataRadioClicked(metadataField, choice) {
            this.metadata[metadataField.key] = this.getMetadataChoiceText(choice);

            this.save();
        }
    }, {
        key: 'save',
        value: function save() {
            this.ProjectService.saveProject(); // save the project
        }
    }]);

    return ProjectInfoController;
}();

ProjectInfoController.$inject = ['$filter', '$mdDialog', '$rootScope', '$state', '$stateParams', '$scope', '$timeout', 'ConfigService', 'ProjectService', 'UtilService'];

exports.default = ProjectInfoController;
//# sourceMappingURL=projectInfoController.js.map