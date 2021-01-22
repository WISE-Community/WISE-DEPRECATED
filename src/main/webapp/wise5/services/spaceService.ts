'use strict';

import { Injectable } from '@angular/core';
import { TeacherProjectService } from './teacherProjectService';

@Injectable()
export class SpaceService {
  constructor(private TeacherProjectService: TeacherProjectService) {}

  createSpace(
    id: string,
    name: string,
    isPublic: boolean = true,
    isShowInNotebook: boolean = true
  ) {
    return {
      id: id,
      name: name,
      isPublic: isPublic,
      isShowInNotebook: isShowInNotebook
    };
  }

  addSpace(id: string, name: string, isPublic: boolean = true, isShowInNotebook: boolean = true) {
    this.TeacherProjectService.addSpace(this.createSpace(id, name, isPublic, isShowInNotebook));
  }

  removeSpace(id: string) {
    this.TeacherProjectService.removeSpace(id);
  }
}
