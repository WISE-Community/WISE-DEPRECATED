import classroomMonitorModule from './main';

angular.element(document).ready(() => {
    angular.bootstrap(document, [classroomMonitorModule.name], { strictDi: true});
});