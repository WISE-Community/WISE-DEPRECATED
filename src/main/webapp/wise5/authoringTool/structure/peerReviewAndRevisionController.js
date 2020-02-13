'use strict';

class PeerReviewAndRevisionController {
  constructor($filter, $rootScope, $state, $stateParams, $scope, UtilService) {
    this.$filter = $filter;
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$scope = $scope;
    this.$translate = this.$filter('translate');
    this.UtilService = UtilService;
    this.structure = this.$stateParams.structure;
    this.summernoteOptions = {
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'video']],
        ['customButton', ['insertWISELinkButton', 'insertAssetButton']],
        ['view', ['fullscreen', 'help']],
        ['view', ['codeview']]
      ],
      minHeight: 300,
      disableDragAndDrop: true,
      buttons: {
        insertWISELinkButton: this.UtilService.createInsertWISELinkButton(
          this,
          null,
          this.nodeId,
          this.componentId,
          'prompt',
          this.$translate('INSERT_WISE_LINK')
        ),
        insertAssetButton: this.UtilService.createInsertAssetButton(
          this,
          null,
          this.nodeId,
          this.componentId,
          'prompt',
          this.$translate('INSERT_ASSET')
        )
      }
    };
  }

  chooseLocation() {
    this.$state.go('root.project.structure.location', { structure: this.structure });
  }

  cancel() {
    this.$state.go('root.project');
  }
}

PeerReviewAndRevisionController.$inject = [
  '$filter',
  '$rootScope',
  '$state',
  '$stateParams',
  '$scope',
  'UtilService'
];

export default PeerReviewAndRevisionController;
