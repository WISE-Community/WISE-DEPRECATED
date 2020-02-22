'use strict';

class ChooseStructureController {
  constructor($filter, $rootScope, $state, $stateParams, $scope) {
    this.$filter = $filter;
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$scope = $scope;
    this.$translate = this.$filter('translate');
    this.structures = [
      {
        label: this.$translate('jigsaw.label'),
        description: this.$translate('jigsaw.description'),
        icon: 'extension',
        route: 'root.project.structure.jigsaw'
      },
      {
        label: this.$translate('selfDirectedInvestigation.label'),
        description: this.$translate('selfDirectedInvestigation.description'),
        icon: 'contact_support',
        route: 'root.project.structure.self-directed-investigation'
      },
      {
        label: this.$translate('peerReview.label'),
        description: this.$translate('peerReview.description'),
        icon: 'question_answer',
        route: 'root.project.structure.peer-review-and-revision'
      },
      {
        label: this.$translate('kiOER.label'),
        description: this.$translate('kiOER.description'),
        icon: 'autorenew',
        route: 'root.project.structure.ki-cycle-using-oer'
      }
    ];
  }

  chooseStructure(route) {
    this.$state.go(route);
  }

  cancel() {
    this.$state.go('root.project');
  }
}

ChooseStructureController.$inject = ['$filter', '$rootScope', '$state', '$stateParams', '$scope'];

export default ChooseStructureController;
