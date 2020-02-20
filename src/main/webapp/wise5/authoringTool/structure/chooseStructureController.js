'use strict';

class ChooseStructureController {
  constructor($rootScope, $state, $stateParams, $scope) {
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$scope = $scope;
    this.structures = [
      {
        label: 'Jigsaw',
        description: 'This is a Jigsaw. Students do stuff.',
        route: 'root.project.structure.jigsaw'
      },
      {
        label: 'Guidance Choice',
        description: 'This is a Guidance Choice. Students do stuff.',
        route: 'root.project.structure.guidance-choice'
      },
      {
        label: 'Self Directed Investigation',
        description: 'This is a Self Directed Investigation. Students do stuff.',
        route: 'root.project.structure.self-directed-investigation'
      },
      {
        label: 'Peer Review and Revision',
        description: 'This is a Peer Review and Revision. Students do stuff.',
        route: 'root.project.structure.peer-review-and-revision'
      },
      {
        label: 'KI Cycle Using OER',
        description: 'This is a KI Cycle Using OER. Students do stuff.',
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

ChooseStructureController.$inject = ['$rootScope', '$state', '$stateParams', '$scope'];

export default ChooseStructureController;
