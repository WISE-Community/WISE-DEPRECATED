'use strict';

class ClassResponseController {
    constructor($scope, $element, StudentStatusService, ConfigService) {
        this.$scope = $scope;
        this.$element = $element;
        this.StudentStatusService = StudentStatusService;
        this.ConfigService = ConfigService;

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
        return this.StudentStatusService.getAvatarColorForWorkgroupId(workgroupId);
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

ClassResponseController.$inject = ['$scope','$element','StudentStatusService','ConfigService'];

const ClassResponseComponentOptions = {
    bindings: {
        response: '=',
        submitbuttonclicked: '&',
        studentdatachanged: '&'
    },
    templateUrl: 'wise5/components/discussion/classResponse.html',
    controller: 'ClassResponseController as classResponseCtrl'
};

export { ClassResponseController, ClassResponseComponentOptions };
