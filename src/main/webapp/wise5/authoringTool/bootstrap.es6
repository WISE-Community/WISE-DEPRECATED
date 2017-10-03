import authoringModule from './main';

angular.element(document).ready(() => {
  angular.bootstrap(document, [authoringModule.name], { strictDi: true});
});
