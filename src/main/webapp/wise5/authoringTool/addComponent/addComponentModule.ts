import * as angular from 'angular';
import { ChooseNewComponent } from './choose-new-component.component';
import { ChooseNewComponentLocation } from './choose-new-component-location.component';

export default angular.module('addComponentModule', ['ui.router'])
  .component('chooseNewComponent', ChooseNewComponent)
  .component('chooseNewComponentLocation', ChooseNewComponentLocation)
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('root.at.project.node.add-component', {
        url: '/add-component',
        abstract: true,
        resolve: {}
      })
      .state('root.at.project.node.add-component.choose-component', {
        url: '/choose-component',
        component: 'chooseNewComponent',
        params: {
          componentType: 'Animation'
        }
      })
      .state('root.at.project.node.add-component.choose-location', {
        url: '/choose-location',
        component: 'chooseNewComponentLocation',
        params: {
          componentType: 'Animation'
        }
      });
  }]);
