'use strict';

class ProjectInfoController {

  constructor(
      $filter,
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

    this.metadata = this.ProjectService.getProjectMetadata();
    this.metadataAuthoring = this.ConfigService.getConfigParam('projectMetadataSettings');
    this.projectIcons = [];
    this.projectIcon = '';
    this.isEditingProjectIcon = false;
    this.isShowProjectIcon = false;
    this.isShowProjectIconError = false;
    this.isShowProjectIconLoading = false;
    this.loadProjectIcon();
    this.processMetadata();
    this.registerListeners();
  }

  registerListeners() {
    this.$scope.$on('assetSelected', (event, args) => {
      if (args.target === 'projectIcon') {
        this.setCustomProjectIcon(args.assetItem.fileName);
        this.$mdDialog.hide();
      }
    });
  }

  processMetadata() {
    if (this.metadataAuthoring != null) {
      for (let field of this.metadataAuthoring.fields) {
        this.processMetadataAuthoringField(field);
      }
    }
  }

  processMetadataAuthoringField(field) {
    if (field != null) {
      if (field.type === 'checkbox') {
        this.processMetadataAuthoringFieldCheckbox(field);
      } else if (field.type === 'radio') {
        // do nothing. Radio buttons work automatically
      }
    }
  }

  processMetadataAuthoringFieldCheckbox(field) {
    let metadataField = this.metadata[field.key];
    if (metadataField != null && field.choices != null) {
      field.choicesMapping = {};
      for (let choice of field.choices) {
        if (choice != null) {
          field.choicesMapping[choice] =
              this.hasUserCheckedThisMetadataField(metadataField, choice);
        }
      }
    }
  }

  hasUserCheckedThisMetadataField(metadataField, choice) {
    let userHasCheckedThisMetadataField = false;
    for (let metadataFieldChoice of metadataField) {
      if (metadataFieldChoice != null && metadataFieldChoice == choice) {
        userHasCheckedThisMetadataField = true;
        break;
      }
    }
    return userHasCheckedThisMetadataField;
  }

  // returns the choice text that is appropriate for user's locale
  getMetadataChoiceText(choice) {
    let choiceText = choice;
    let userLocale = this.ConfigService.getLocale();
    let i18nMapping = this.metadataAuthoring.i18n;
    let i18nMappingContainingChoiceTextArray =
        Object.values(i18nMapping).filter((onei18nMapping) => {
          return Object.values(onei18nMapping).indexOf(choice) != -1;
        });
    if (i18nMappingContainingChoiceTextArray != null &&
        i18nMappingContainingChoiceTextArray.length > 0) {
      // shouldn't be more than one, but if so, use the first one we find
      let i18nMappingContainingChoiceText =
          i18nMappingContainingChoiceTextArray[0];
      if (i18nMappingContainingChoiceText[userLocale] != null) {
        choiceText = i18nMappingContainingChoiceText[userLocale];
      }
    }
    return choiceText;
  }

  metadataChoiceIsChecked(metadataField, choice) {
    return this.getMetadataChoiceText(this.metadata[metadataField.key])
        == this.getMetadataChoiceText(choice);
  }

  metadataCheckboxClicked(metadataField, choice) {
    let checkedChoices = [];
    let choices = metadataField.choices;
    for (let choice of choices) {
      let isChoiceChecked = metadataField.choicesMapping[choice];
      if (isChoiceChecked) {
        checkedChoices.push(this.getMetadataChoiceText(choice));
      }
    }
    this.metadata[metadataField.key] = checkedChoices;
    this.ProjectService.saveProject();
  }

  metadataRadioClicked(metadataField, choice) {
    this.metadata[metadataField.key] = this.getMetadataChoiceText(choice);
    this.ProjectService.saveProject();
  }

  getFeaturedProjectIcons() {
    this.ProjectService.getFeaturedProjectIcons().then((featuredProjectIcons) => {
      this.projectIcons = featuredProjectIcons;
    });
  }

  setFeaturedProjectIcon(projectIcon) {
    this.ProjectService.setFeaturedProjectIcon(projectIcon).then(() => {
      this.projectIcon = 'wise5/authoringTool/projectIcons/' + projectIcon;
      this.showProjectIcon();
      this.closeEditProjectIconMode();
    });
  }

  chooseCustomProjectIcon() {
    const params = {
      isPopup: true,
      target: 'projectIcon'
    };
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  setCustomProjectIcon(projectIcon) {
    this.showProjectIconLoading();
    this.ProjectService.setCustomProjectIcon(projectIcon).then(() => {
      this.loadProjectIconAfterTimeout();
    });
  }

  /*
   * Load the project_thumb.png after a timeout to allow time for the image to be updated on the server
   * and browser. This is to prevent the browser from displaying the previous project_thumb.png.
   */
  loadProjectIconAfterTimeout() {
    this.$timeout(() => {
      this.loadProjectIcon();
      this.closeEditProjectIconMode();
    }, 3000);
  }

  loadProjectIcon() {
    this.projectIcon = this.ConfigService.getConfigParam('projectBaseURL') + 'assets/project_thumb.png?timestamp=' + new Date().getTime();
    const image = new Image();
    image.onerror = () => {
      this.showProjectIconError();
    };
    image.onload = () => {
      this.showProjectIcon();
    };
    image.src = this.projectIcon;
  }

  toggleEditProjectIconMode() {
    this.isEditingProjectIcon = !this.isEditingProjectIcon;
    if (this.isEditingProjectIcon) {
      this.getFeaturedProjectIcons();
    }
  }

  closeEditProjectIconMode() {
    this.isEditingProjectIcon = false;
  }

  showProjectIcon() {
    this.isShowProjectIcon = true;
    this.isShowProjectIconError = false;
    this.isShowProjectIconLoading = false;
  }

  showProjectIconError() {
    this.isShowProjectIcon = false;
    this.isShowProjectIconError = true;
    this.isShowProjectIconLoading = false;
  }

  showProjectIconLoading() {
    this.isShowProjectIcon = false;
    this.isShowProjectIconError = false;
    this.isShowProjectIconLoading = true;
  }

  save() {
    this.ProjectService.saveProject();
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
