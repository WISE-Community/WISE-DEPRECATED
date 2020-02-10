'use strict';

class ChooseStructureController {

  constructor($rootScope,
      $state,
      $stateParams,
      $scope) {
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$scope = $scope;
    this.structures = [
      { id: 'jigsaw', label: 'Jigsaw',
          description: 'This is a Jigsaw. Students do stuff.' },
      { id: 'guidanceChoice', label: 'Guidance Choice',
          description: 'This is a Guidance Choice. Students do stuff.' },
      { id: 'selfDirectedInvestigation', label: 'Self Directed Investigation',
          description: 'This is a Self Directed Investigation. Students do stuff.' },
      { id: 'peerReviewAndRevision', label: 'Peer Review and Revision',
          description: 'This is a Peer Review and Revision. Students do stuff.' },
      { id: 'kiCycleUsingOER', label: 'KI Cycle Using OER',
          description: 'This is a KI Cycle Using OER. Students do stuff.' },
    ];
  }

  chooseStructure(structure) {
    this.$state.go('root.project.structure.configure', {structure: structure});
  }

  cancel() {
    this.$state.go('root.project');
  }
}

ChooseStructureController.$inject = [
  '$rootScope',
  '$state',
  '$stateParams',
  '$scope',
];

export default ChooseStructureController;
