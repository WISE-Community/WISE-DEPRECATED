'use strict';

import { TeacherDataService } from '../../services/teacherDataService';

class DashboardController {
  static $inject = ['TeacherDataService'];

  constructor(private TeacherDataService: TeacherDataService) {
    const context = 'ClassroomMonitor',
      nodeId = null,
      componentId = null,
      componentType = null,
      category = 'Navigation',
      event = 'dashboardViewDisplayed',
      data = {};
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      data
    );
  }
}

export default DashboardController;
