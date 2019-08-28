import classroomMonitorModule from './classroomMonitor';

angular.element(document).ready(() => {
  angular.bootstrap(document, [classroomMonitorModule.name], { strictDi: true});
});
