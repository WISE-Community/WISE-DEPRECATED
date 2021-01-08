'use strict';

import * as angular from 'angular';
import ChooseStructureController from './chooseStructureController';
import ChooseStructureLocationController from './chooseStructureLocationController';
import ConfigureStructureController from './configureStructureController';
import PeerReviewAndRevisionController from './peerReviewAndRevision/peerReviewAndRevisionController';
import JigsawController from './jigsaw/jigsawController';
import GuidanceChoiceController from './guidanceChoice/guidanceChoiceController';
import SelfDirectedInvestigationController from './selfDirectedInvestigation/selfDirectedInvestigationController';
import KICycleUSINGOERController from './kiCycleUsingOER/kiCycleUsingOERController';
import AutomatedAssessmentChooseItemController from './automatedAssessment/automatedAssessmentChooseItemController';
import AutomatedAssessmentConfigureController from './automatedAssessment/automatedAssessmentConfigureController';

const structureAuthoringModule = angular
  .module('structureAuthoringModule', ['ui.router'])
  .controller('AutomatedAssessmentChooseItemController', AutomatedAssessmentChooseItemController)
  .controller('AutomatedAssessmentConfigureController', AutomatedAssessmentConfigureController)
  .controller('ConfigureStructureController', ConfigureStructureController)
  .controller('ChooseStructureLocationController', ChooseStructureLocationController)
  .controller('ChooseStructureController', ChooseStructureController)
  .controller('JigsawController', JigsawController)
  .controller('GuidanceChoiceController', GuidanceChoiceController)
  .controller('SelfDirectedInvestigationController', SelfDirectedInvestigationController)
  .controller('PeerReviewAndRevisionController', PeerReviewAndRevisionController)
  .controller('KICycleUsingOERController', KICycleUSINGOERController)
  .config([
    '$stateProvider',
    ($stateProvider) => {
      $stateProvider
        .state('root.at.project.structure', {
          url: '/structure',
          abstract: true,
          resolve: {}
        })
        .state('root.at.project.structure.choose', {
          url: '/choose',
          templateUrl: 'wise5/authoringTool/structure/chooseStructure.html',
          controller: 'ChooseStructureController',
          controllerAs: 'chooseStructureController',
          params: {
            structure: null
          }
        })
        .state('root.at.project.structure.configure', {
          url: '/configure',
          templateUrl: 'wise5/authoringTool/structure/configureStructure.html',
          controller: 'ConfigureStructureController',
          controllerAs: 'configureStructureController',
          abstract: true,
          params: {
            structure: null
          }
        })
        .state('root.at.project.structure.jigsaw', {
          url: '/jigsaw',
          templateUrl: 'wise5/authoringTool/structure/jigsaw/jigsaw.html',
          controller: 'JigsawController',
          controllerAs: 'jigsawController',
          params: {
            structure: null
          }
        })
        .state('root.at.project.structure.guidance-choice', {
          url: '/guidance-choice',
          templateUrl: 'wise5/authoringTool/structure/guidanceChoice/guidanceChoice.html',
          controller: 'GuidanceChoiceController',
          controllerAs: 'guidanceChoiceController',
          params: {
            structure: null
          }
        })
        .state('root.at.project.structure.self-directed-investigation', {
          url: '/self-directed-investigation',
          templateUrl:
            'wise5/authoringTool/structure/selfDirectedInvestigation/selfDirectedInvestigation.html',
          controller: 'SelfDirectedInvestigationController',
          controllerAs: 'selfDirectedInvestigationController',
          params: {
            structure: null
          }
        })
        .state('root.at.project.structure.peer-review-and-revision', {
          url: '/peer-review-and-revision',
          templateUrl:
            'wise5/authoringTool/structure/peerReviewAndRevision/peerReviewAndRevision.html',
          controller: 'PeerReviewAndRevisionController',
          controllerAs: 'peerReviewAndRevisionController',
          params: {
            structure: null
          }
        })
        .state('root.at.project.structure.ki-cycle-using-oer', {
          url: '/ki-cycle-using-oer',
          templateUrl: 'wise5/authoringTool/structure/kiCycleUsingOER/kiCycleUsingOER.html',
          controller: 'KICycleUsingOERController',
          controllerAs: 'kiCycleUsingOERController',
          params: {
            structure: null
          }
        })
        .state('root.at.project.structure.automated-assessment', {
          url: '/automated-assessment',
          abstract: true,
          params: {
            structure: null
          }
        })
        .state('root.at.project.structure.automated-assessment.choose-item', {
          url: '/choose-item',
          templateUrl: 'wise5/authoringTool/structure/automatedAssessment/choose-item.html',
          controller: 'AutomatedAssessmentChooseItemController',
          controllerAs: '$ctrl',
          params: {
            structure: null
          }
        })
        .state('root.at.project.structure.automated-assessment.configure', {
          url: '/configure',
          templateUrl: 'wise5/authoringTool/structure/automatedAssessment/configure-item.html',
          controller: 'AutomatedAssessmentConfigureController',
          controllerAs: '$ctrl',
          params: {
            node: null,
            importFromProjectId: null
          }
        })
        .state('root.at.project.structure.location', {
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
