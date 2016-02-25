import mainModule from './main';

angular.element(document).ready(() => {
    angular.bootstrap(document.getElementsByTagName('body')[0], [mainModule.name], { strictDi: true});
});
