import * as angular from 'angular';
import { ChooseNewComponent } from '../../../site/src/app/authoring-tool/add-component/choose-new-component/choose-new-component.component';
import { ChooseNewComponentLocation } from '../../../site/src/app/authoring-tool/add-component/choose-new-component-location/choose-new-component-location.component';
import { downgradeComponent } from '@angular/upgrade/static';

export default angular
  .module('addComponentModule', ['ui.router'])
  .directive(
    'chooseNewComponent',
    downgradeComponent({ component: ChooseNewComponent }) as angular.IDirectiveFactory
  )
  .directive(
    'chooseNewComponentLocation',
    downgradeComponent({ component: ChooseNewComponentLocation }) as angular.IDirectiveFactory
  )
  .config([
    '$stateProvider',
    ($stateProvider) => {
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
    }
  ]);
