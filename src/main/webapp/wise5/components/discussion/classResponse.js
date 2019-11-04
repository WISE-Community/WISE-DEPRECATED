'use strict';

class ClassResponseController {
  constructor($scope, $element, $filter, StudentStatusService, ConfigService) {
    this.$scope = $scope;
    this.$element = $element;
    this.$filter = $filter;
    this.StudentStatusService = StudentStatusService;
    this.ConfigService = ConfigService;

    this.$translate = this.$filter('translate');
    this.urlMatcher = /((http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?)/g;
  }

  $onInit() {
    this.$scope.$watch(
      () => { return this.response.replies.length; },
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          this.injectLinksIntoReplies();
          this.toggleExpanded(true);
        }
      }
    );
    this.injectLinksIntoResponse();
    this.injectLinksIntoReplies();
  }

  injectLinksIntoResponse() {
    this.response.studentData.responseText = this.injectLinks(this.response.studentData.response);
  }

  injectLinksIntoReplies() {
    for (const reply of this.response.replies) {
      if (reply.studentData.responseText == null) {
        reply.studentData.responseText = this.injectLinks(reply.studentData.response);
      }
    }
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

  replyEntered($event, response) {
    if ($event.keyCode === 13) {
      if (response.replyText) {
        this.submitButtonClicked(response);
      }
    }
  }

  submitButtonClicked(response) {
    // call the callback function in discussionController
    this.submitbuttonclicked({r: response});
  }

  /**
   * The delete button was clicked on a student post
   * @param componentState the student component state
   */
  deleteButtonClicked(componentState) {

    var answer = confirm(this.$translate("discussion.areYouSureYouWantToDeleteThisPost"));

    if (answer) {
      // the teacher has answered yes to delete

      // tell the discussionController to delete the post
      this.deletebuttonclicked({componentState: componentState});
    }
  }

  /**
   * The undo delete button was clicked on a student post
   * @param componentState the student component state
   */
  undoDeleteButtonClicked(componentState) {

    var answer = confirm(this.$translate("discussion.areYouSureYouWantToShowThisPost"));

    if (answer) {
      // the teacher has answered yes to undo the delete

      // tell the discussionController to undo the delete of the post
      this.undodeletebuttonclicked({componentState: componentState});
    }
  }

  toggleExpanded(open) {
    if (open) {
      this.expanded = true;
    } else {
      this.expanded = !this.expanded;
    }

    if (this.expanded) {
      var $clist = $(this.element).find('.discussion-comments__list');
      setTimeout(function () {
        $clist.animate({scrollTop: $clist.height()}, 250);
      }, 250);
    }
  }

  adjustClientSaveTime(time) {
    return this.ConfigService.convertToClientTimestamp(time);
  }
}

ClassResponseController.$inject = ['$scope','$element','$filter','StudentStatusService','ConfigService'];

const ClassResponseComponentOptions = {
  bindings: {
    response: '=',
    mode: '=',
    deletebuttonclicked: '&',
    undodeletebuttonclicked: '&',
    submitbuttonclicked: '&',
    studentdatachanged: '&',
    isdisabled: '='
  },
  templateUrl: 'wise5/components/discussion/classResponse.html',
  controller: 'ClassResponseController as classResponseCtrl'
};

export { ClassResponseController, ClassResponseComponentOptions };
