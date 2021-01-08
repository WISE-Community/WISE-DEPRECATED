'use strict';

import * as angular from 'angular';
import { Injectable } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './configService';
import { map } from 'rxjs/operators';
import { ProjectService } from './projectService';

@Injectable()
export class TagService {
  tags: any[] = [];

  constructor(
    protected http: HttpClient,
    protected ConfigService: ConfigService,
    protected ProjectService: ProjectService
  ) {}

  setTags(tags: any[]) {
    this.tags = tags;
  }

  getTags() {
    return this.tags;
  }

  addTag(id: number, name: string) {
    const tagObject: any = {
      name: name
    };
    if (id != null) {
      tagObject.id = id;
    }
    this.tags.push(tagObject);
  }

  retrieveRunTags() {
    return this.http.get(`/api/tag/run/${this.ConfigService.getRunId()}`).pipe(
      map((data: any) => {
        this.tags = data;
        return data;
      })
    );
  }

  retrieveStudentTags() {
    return this.http.get(`/api/tag/workgroup/${this.ConfigService.getWorkgroupId()}`).pipe(
      map((data: any) => {
        this.tags = data;
        return data;
      })
    );
  }

  getNextAvailableTag() {
    this.getTagsFromProject();
    let counter = 1;
    const tagPrefix = 'Group ';
    const existingTagNames = this.getExistingTagNames();
    while (true) {
      const newTagName = tagPrefix + counter;
      if (!existingTagNames.includes(newTagName)) {
        this.addTag(null, newTagName);
        return newTagName;
      }
      counter++;
    }
  }

  getExistingTagNames() {
    return this.tags.map((tag) => {
      return tag.name;
    });
  }

  getTagsFromProject() {
    this.tags = this.ProjectService.getTags();
  }

  hasTagName(tagName: string): boolean {
    return this.getExistingTagNames().includes(tagName);
  }
}
