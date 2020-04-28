'use strict';

class ChooseStructureController {
  structures: any[];

  static $inject = ['$filter', '$state'];

  constructor(private $filter: any, private $state: any) {
    const translate = this.$filter('translate');
    this.structures = [
      {
        label: translate('jigsaw.label'),
        description: translate('jigsaw.description'),
        icon: 'extension',
        route: 'root.at.project.structure.jigsaw'
      },
      {
        label: translate('selfDirectedInvestigation.label'),
        description: translate('selfDirectedInvestigation.description'),
        icon: 'contact_support',
        route: 'root.at.project.structure.self-directed-investigation'
      },
      {
        label: translate('peerReview.label'),
        description: translate('peerReview.description'),
        icon: 'question_answer',
        route: 'root.at.project.structure.peer-review-and-revision'
      },
      {
        label: translate('kiOER.label'),
        description: translate('kiOER.description'),
        icon: 'autorenew',
        route: 'root.at.project.structure.ki-cycle-using-oer'
      }
    ];
  }

  chooseStructure(route) {
    this.$state.go(route);
  }

  cancel() {
    this.$state.go('root.at.project');
  }
}

export default ChooseStructureController;
