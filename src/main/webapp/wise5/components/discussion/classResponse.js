'use strict';

class ClassResponseController {
  constructor($scope, $filter, StudentStatusService, ConfigService) {
    this.$scope = $scope;
    this.$filter = $filter;
    this.StudentStatusService = StudentStatusService;
    this.ConfigService = ConfigService;
    this.$translate = this.$filter('translate');
    this.urlMatcher = /((http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?)/g;
    this.expanded = false;

    this.$scope.$watch(
      () => { return this.response.replies.length; },
      (numNew, numOld) => {
        if (numNew !== numOld) {
          this.expanded = true;
        }
      }
    );
  }

  $onInit() {
    this.injectLinksIntoResponse();
  }

  injectLinksIntoResponse() {
    this.response.studentData.responseText = this.injectLinks(this.response.studentData.response);
  }

  injectLinks(response) {
    return response.replace(this.urlMatcher, (match) => {
      let matchUrl = match;
      if (!match.startsWith('http')) {
        /*
         * The url does not begin with http so we will add // to the beginning of it so that the
         * browser treats the url as an absolute link and not a relative link. The browser will also
         * use the same protocol that the current page is loaded with (http or https).
         */
        matchUrl = '//' + match;
      }
      return `<a href="${matchUrl}" target="_blank">${match}</a>`;
    });
  }

  getAvatarColorForWorkgroupId(workgroupId) {
    return this.ConfigService.getAvatarColorForWorkgroupId(workgroupId);
  }

  replyEntered($event) {
    if($event.keyCode == 13 && !$event.shiftKey && this.response.replyText) {        
      $event.preventDefault();
      this.submitbuttonclicked({r: this.response});
    }
  }

  deleteButtonClicked(componentState) {
    if (confirm(this.$translate('discussion.areYouSureYouWantToDeleteThisPost'))) {
      this.deletebuttonclicked({componentState: componentState});
    }
  }

  undoDeleteButtonClicked(componentState) {
    if (confirm(this.$translate('discussion.areYouSureYouWantToShowThisPost'))) {
      this.undodeletebuttonclicked({componentState: componentState});
    }
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
  }

  adjustClientSaveTime(time) {
    return this.ConfigService.convertToClientTimestamp(time);
  }
}

ClassResponseController.$inject = ['$scope','$filter','StudentStatusService','ConfigService'];

const ClassResponseComponentOptions = {
  bindings: {
    response: '<',
    mode: '@',
    deletebuttonclicked: '&',
    undodeletebuttonclicked: '&',
    submitbuttonclicked: '&',
    studentdatachanged: '&',
    isdisabled: '<'
  },
  templateUrl: 'wise5/components/discussion/classResponse.html',
  controller: 'ClassResponseController as classResponseCtrl'
};

export { ClassResponseController, ClassResponseComponentOptions };
