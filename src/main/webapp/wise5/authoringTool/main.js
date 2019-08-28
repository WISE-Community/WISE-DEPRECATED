import authoringModule from './authoringTool';

angular.element(document).ready(() => {
  angular.bootstrap(document, [authoringModule.name], { strictDi: true});
});
