import * as angular from 'angular';

angular.element(document).ready(() => {
  angular.bootstrap(document.body, ['authoring'], { strictDi: true });
});
