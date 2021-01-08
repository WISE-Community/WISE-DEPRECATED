import * as angular from 'angular';
import { ChooseComponent } from './choose-component.component';
import { ChooseComponentLocation } from './choose-component-location.component';

export default angular
  .module('importComponentModule', ['ui.router'])
  .component('chooseComponent', ChooseComponent)
  .component('chooseComponentLocation', ChooseComponentLocation)
  .config([
    '$stateProvider',
    ($stateProvider) => {
      $stateProvider
        .state('root.at.project.node.import-component', {
          url: '/import-component',
          abstract: true,
          resolve: {}
        })
        .state('root.at.project.node.import-component.choose-step', {
          url: '/choose-component',
          component: 'chooseComponent'
        })
        .state('root.at.project.node.import-component.choose-location', {
          url: '/choose-location',
          component: 'chooseComponentLocation',
          params: {
            importFromProjectId: '',
            selectedComponents: []
          }
        });
    }
  ]);
