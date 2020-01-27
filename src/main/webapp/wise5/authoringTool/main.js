import authoringModule from './authoringTool';

angular.element(document).ready(() => {
  angular.bootstrap(document.body, ['authoring'], { strictDi: true });
});
