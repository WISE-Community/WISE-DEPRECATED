import mainModule from './main';

angular.element(document).ready(() => {
    angular.bootstrap(document, [mainModule.name], { strictDi: true});
});