import vleModule from './main';

angular.element(document).ready(() => {
  angular.bootstrap(document.getElementsByTagName('body')[0], [vleModule.name], { strictDi: true});
});
