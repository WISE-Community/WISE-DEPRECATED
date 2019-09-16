import classroomMonitorModule from './classroomMonitor';

angular.element(document).ready(() => {
  angular.bootstrap(document.body, ['classroomMonitor'], { strictDi: true });
});
