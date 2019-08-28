import vleModule from './vle';

angular.element(document).ready(() => {
  angular.bootstrap(document.getElementsByTagName('body')[0], [vleModule.name], { strictDi: true});
});
