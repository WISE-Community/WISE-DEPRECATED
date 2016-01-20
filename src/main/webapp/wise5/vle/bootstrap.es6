import mainModule from './main';
import themeModule from './themes/default/theme3.js';

angular.element(document).ready(function() {
    angular.bootstrap(document, [mainModule.name, themeModule.name], { strictDi: true});
})