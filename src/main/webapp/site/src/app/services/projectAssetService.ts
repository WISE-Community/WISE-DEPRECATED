'use strict';

import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigService } from '../../../../wise5/services/configService';
import { Injectable } from '@angular/core';
import { UtilService } from '../../../../wise5/services/utilService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { map } from 'rxjs/operators';
import { forkJoin, BehaviorSubject } from 'rxjs';
import { UpgradeModule } from '@angular/upgrade/static';

@Injectable()
export class ProjectAssetService {
  totalSizeMax = 0;
  projectAssets: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  totalFileSize: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  totalUnusedFileSize: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  projectThumbnailFileName = 'project_thumb.png';

  constructor(
    protected upgrade: UpgradeModule,
    protected http: HttpClient,
    protected ConfigService: ConfigService,
    protected ProjectService: ProjectService,
    protected UtilService: UtilService
  ) {
    this.getProjectAssets().subscribe((projectAssets) => {
      if (projectAssets != null) {
        this.calculateAssetUsage(projectAssets);
      }
    });
  }

  getProjectAssets(): BehaviorSubject<any> {
    return this.projectAssets;
  }

  setProjectAssets(projectAssets: any) {
    this.projectAssets.next(projectAssets);
  }

  getTotalFileSize(): BehaviorSubject<number> {
    return this.totalFileSize;
  }

  setTotalFileSize(totalFileSize: number) {
    this.totalFileSize.next(totalFileSize);
  }

  getTotalUnusedFileSize(): BehaviorSubject<number> {
    return this.totalUnusedFileSize;
  }

  setTotalUnusedFileSize(totalUnusedFileSize: number) {
    this.totalUnusedFileSize.next(totalUnusedFileSize);
  }

  getAssetUsagePercentage() {
    return (this.getTotalFileSize().getValue() / this.totalSizeMax) * 100;
  }

  getAssetUnusedPercentage() {
    return (this.getTotalUnusedFileSize().getValue() / this.totalSizeMax) * 100;
  }

  retrieveProjectAssets(): any {
    const url = this.ConfigService.getConfigParam('projectAssetURL');
    return this.http.get(url).subscribe((projectAssets: any) => {
      this.totalSizeMax = this.ConfigService.getConfigParam('projectAssetTotalSizeMax');
      this.injectFileTypeValues(projectAssets.files);
      this.setProjectAssets(projectAssets);
    });
  }

  injectFileTypeValues(projectAssets: any[]) {
    projectAssets.forEach((projectAsset) => {
      if (this.UtilService.isImage(projectAsset.fileName)) {
        projectAsset.fileType = 'image';
      } else if (this.UtilService.isVideo(projectAsset.fileName)) {
        projectAsset.fileType = 'video';
      } else if (this.UtilService.isAudio(projectAsset.fileName)) {
        projectAsset.fileType = 'audio';
      } else {
        projectAsset.fileType = 'other';
      }
    });
  }

  uploadAssets(files: any[]) {
    const url = this.ConfigService.getConfigParam('projectAssetURL');
    const formData = new FormData();
    files.forEach((file: any) => formData.append('files', file, file.name));
    return this.http.post(url, formData).pipe(
      map((data: any) => {
        this.injectFileTypeValues(data.assetDirectoryInfo.files);
        this.setProjectAssets(data.assetDirectoryInfo);
        return data;
      })
    );
  }

  downloadAssetItem(assetItem: any) {
    window.open(
      `${this.ConfigService.getConfigParam('projectAssetURL')}` +
        `/download?assetFileName=${assetItem.fileName}`
    );
  }

  deleteAssetItem(assetItem: any): any {
    const url = `${this.ConfigService.getConfigParam('projectAssetURL')}/delete`;
    const params = new HttpParams().set('assetFileName', assetItem.fileName);
    return this.http.post(url, params).subscribe((projectAssets: any) => {
      this.injectFileTypeValues(projectAssets.files);
      this.setProjectAssets(projectAssets);
    });
  }

  calculateAssetUsage(assets: any = this.getProjectAssets().getValue()) {
    let usedTextContent = JSON.stringify(this.ProjectService.project);
    usedTextContent += this.projectThumbnailFileName;
    const allTextFiles = this.getAllTextFiles(assets);
    if (allTextFiles.length == 0) {
      this.calculateUsedFiles(assets, usedTextContent);
    } else {
      this.retrieveTextFilesAndCalculateUsedFiles(assets, usedTextContent, allTextFiles);
    }
  }

  getAllTextFiles(assets: any) {
    const allTextFiles = [];
    for (const asset of assets.files) {
      const fileName = asset.fileName;
      if (this.isTextFile(fileName)) {
        allTextFiles.push(fileName);
      }
    }
    return allTextFiles;
  }

  isTextFile(fileName: string) {
    return (
      this.UtilService.endsWith(fileName, '.html') ||
      this.UtilService.endsWith(fileName, '.htm') ||
      this.UtilService.endsWith(fileName, '.js')
    );
  }

  calculateUsedFiles(assets: any, usedTextContent: string) {
    let totalUnusedFilesSize = 0;
    for (const asset of assets.files) {
      const fileName = asset.fileName;
      if (usedTextContent.indexOf(fileName) != -1) {
        asset.used = true;
      } else {
        asset.used = false;
        totalUnusedFilesSize += asset.fileSize;
      }
    }
    this.setTotalFileSize(assets.totalFileSize);
    this.setTotalUnusedFileSize(totalUnusedFilesSize);
  }

  retrieveTextFilesAndCalculateUsedFiles(
    assets: any,
    usedTextContent: string,
    allTextFiles: any[]
  ) {
    this.getTextFiles(allTextFiles).subscribe((textFiles: any[]) => {
      const allUsedTextContent = this.getAllUsedTextContent(usedTextContent, textFiles);
      this.calculateUsedFiles(assets, allUsedTextContent);
    });
  }

  /*
   * Loop through all the text files and check if there are any references to a text file from
   * content that is used. Each time a text file is found to be used, we will check all the assets
   * again to see if the new text file uses other text files. For example, if we find model.html to
   * be used we need to check all the assets again incase model.html uses a text file like model.js.
   */
  getAllUsedTextContent(usedTextContentSoFar: string, textFiles: any[]) {
    const usedTextFileNames = [];
    let foundNewUsedTextFile = true;
    while (foundNewUsedTextFile) {
      foundNewUsedTextFile = false;
      for (const textFile of textFiles) {
        const fileName = this.getFileNameFromURL(textFile.url);
        if (
          !this.isFileAlreadyAdded(usedTextFileNames, fileName) &&
          this.isFileReferencedInContent(usedTextContentSoFar, fileName)
        ) {
          usedTextFileNames.push(fileName);
          usedTextContentSoFar += textFile.body;
          foundNewUsedTextFile = true;
        }
      }
    }
    return usedTextContentSoFar;
  }

  isFileAlreadyAdded(usedTextFilenames: any[], fileName: string) {
    return usedTextFilenames.includes(fileName);
  }

  isFileReferencedInContent(content: string, fileName: string) {
    return content.indexOf(fileName) != -1;
  }

  getFileNameFromURL(url: string) {
    let fileName = '';
    const lastIndexOfSlash = url.lastIndexOf('/');
    if (lastIndexOfSlash == -1) {
      fileName = url;
    } else {
      fileName = url.substring(lastIndexOfSlash + 1);
    }
    return fileName;
  }

  getTextFiles(textFileNames: string[]): any {
    const requests = [];
    const projectAssetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
    for (const textFileName of textFileNames) {
      const request = this.http.get(`${projectAssetsDirectoryPath}/${textFileName}`, {
        observe: 'response',
        responseType: 'text'
      });
      requests.push(request);
    }
    return forkJoin(requests);
  }

  isProjectAssetsAvailable() {
    return this.getProjectAssets().getValue() != null;
  }

  openAssetChooser(params: any) {
    return this.upgrade.$injector.get('$mdDialog').show({
      templateUrl: 'wise5/authoringTool/asset/asset.html',
      controller: 'ProjectAssetController',
      controllerAs: 'projectAssetController',
      $stateParams: params,
      clickOutsideToClose: true,
      escapeToClose: true
    });
  }
}
