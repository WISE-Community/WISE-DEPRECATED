import * as angular from 'angular';
import { EditRubricComponent } from './edit-rubric.component';

export default angular
  .module('editRubricModule', ['ui.router'])
  .component('editRubricComponent', EditRubricComponent)
  .config([
    '$stateProvider',
    ($stateProvider) => {
      $stateProvider.state('root.at.project.node.edit-rubric', {
        url: '/edit-rubric',
        component: 'editRubricComponent'
      });
    }
  ]);
