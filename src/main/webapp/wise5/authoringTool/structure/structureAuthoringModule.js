'use strict';

import ChooseStructureController from './chooseStructureController';
import ChooseStructureLocationController from './chooseStructureLocationController';
import ConfigureStructureController from './configureStructureController';
import PeerReviewAndRevisionController from './peerReviewAndRevisionController';

const structureAuthoringModule = angular
  .module('structureAuthoringModule', ['ui.router'])
  .controller('ConfigureStructureController', ConfigureStructureController)
  .controller('ChooseStructureLocationController', ChooseStructureLocationController)
  .controller('ChooseStructureController', ChooseStructureController)
  .controller('PeerReviewAndRevisionController', PeerReviewAndRevisionController)
  .config([
    '$stateProvider',
    $stateProvider => {
      $stateProvider
        .state('root.project.structure', {
          url: '/structure',
          abstract: true,
          resolve: {}
        })
        .state('root.project.structure.choose', {
          url: '/choose',
          templateUrl: 'wise5/authoringTool/structure/chooseStructure.html',
          controller: 'ChooseStructureController',
          controllerAs: 'chooseStructureController',
          params: {
            structure: null
          }
        })
        .state('root.project.structure.configure', {
          url: '/configure',
          templateUrl: 'wise5/authoringTool/structure/configureStructure.html',
          controller: 'ConfigureStructureController',
          controllerAs: 'configureStructureController',
          abstract: true,
          params: {
            structure: null
          }
        })
        .state('root.project.structure.peer-review-and-revision', {
          url: '/peer-review-and-revision',
          templateUrl: 'wise5/authoringTool/structure/peerReviewAndRevision.html',
          controller: 'PeerReviewAndRevisionController',
          controllerAs: 'peerReviewAndRevisionController',
          params: {
            structure: null
          }
        })
        .state('root.project.structure.location', {
          url: '/location',
          templateUrl: 'wise5/authoringTool/structure/chooseStructureLocation.html',
          controller: 'ChooseStructureLocationController',
          controllerAs: 'chooseStructureLocationController',
          params: {
            structure: null
          }
        });
    }
  ]);

export default structureAuthoringModule;
