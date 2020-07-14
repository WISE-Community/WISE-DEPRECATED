'use strict';

import { Injectable } from '@angular/core';
import { ProjectService } from './projectService';

@Injectable()
export class SpaceService {
  constructor(private ProjectService: ProjectService) {}

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
    this.ProjectService.addSpace(this.createSpace(id, name, isPublic, isShowInNotebook));
  }

  removeSpace(id: string) {
    this.ProjectService.removeSpace(id);
  }
}
