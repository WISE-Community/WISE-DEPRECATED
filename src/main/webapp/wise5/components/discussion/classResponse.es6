'use strict';

class ClassResponseController {
    constructor($scope, $element, $filter, StudentStatusService, ConfigService) {
        this.$scope = $scope;
        this.$element = $element;
        this.$filter = $filter;
        this.StudentStatusService = StudentStatusService;
        this.ConfigService = ConfigService;

        this.$translate = this.$filter('translate');

        this.$scope.$watch(
            () => { return this.response.replies.length; },
            (oldValue, newValue) => {
                if (newValue !== oldValue) {
                    this.toggleExpanded(true);
                    this.response.replyText = '';
                }
            }
        );
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
        studentdatachanged: '&'
    },
    templateUrl: 'wise5/components/discussion/classResponse.html',
    controller: 'ClassResponseController as classResponseCtrl'
};

export { ClassResponseController, ClassResponseComponentOptions };
