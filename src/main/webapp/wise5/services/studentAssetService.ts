'use strict';

import { Injectable } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigService } from './configService';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class StudentAssetService {
  allAssets = [];
  imageFileExtensions = ['png', 'jpg', 'jpeg', 'gif'];
  audioFileExtensions = ['wav', 'mp3', 'ogg', 'm4a', 'm4p', 'raw', 'aiff', 'webm'];
  private showStudentAssetsSource: Subject<any> = new Subject<any>();
  public showStudentAssets$: Observable<any> = this.showStudentAssetsSource.asObservable();

  constructor(
    private upgrade: UpgradeModule,
    private http: HttpClient,
    private ConfigService: ConfigService
  ) {}

  getAssetById(assetId) {
    for (const asset of this.allAssets) {
      if (asset.id === assetId) {
        return asset;
      }
    }
    return null;
  }

  retrieveAssets() {
    if (this.ConfigService.isPreview()) {
      this.allAssets = [];
      const deferred = this.upgrade.$injector.get('$q').defer();
      deferred.resolve(this.allAssets);
      return deferred.promise;
    } else {
      return this.http
        .get(`${this.ConfigService.getStudentAssetsURL()}/${this.ConfigService.getWorkgroupId()}`)
        .toPromise()
        .then((assets: any) => {
          this.allAssets = [];
          const studentUploadsBaseURL = this.ConfigService.getStudentUploadsBaseURL();
          for (const asset of assets) {
            if (
              !asset.isReferenced &&
              asset.serverDeleteTime == null &&
              asset.fileName !== '.DS_Store'
            ) {
              asset.url = studentUploadsBaseURL + asset.filePath;
              if (this.isImage(asset)) {
                asset.type = 'image';
                asset.iconURL = asset.url;
              } else if (this.isAudio(asset)) {
                asset.type = 'audio';
                asset.iconURL = 'wise5/vle/notebook/audio.png';
              } else {
                asset.type = 'file';
                asset.iconURL = 'wise5/vle/notebook/file.png';
              }
              this.allAssets.push(asset);
            }
          }
          return this.allAssets;
        });
    }
  }

  getAssetContent(asset) {
    return this.http
      .get(asset.url)
      .toPromise()
      .then((response) => {
        return response;
      });
  }

  hasSuffix(assetURL, suffixes) {
    const assetExtension = assetURL.substring(assetURL.lastIndexOf('.') + 1);
    return suffixes.includes(assetExtension.toLowerCase());
  }

  isImage(asset) {
    return this.hasSuffix(this.getFileNameFromAsset(asset), this.imageFileExtensions);
  }

  isAudio(asset) {
    return this.hasSuffix(this.getFileNameFromAsset(asset), this.audioFileExtensions);
  }

  getFileNameFromAsset(asset) {
    if (this.ConfigService.isPreview()) {
      return asset.file.name;
    } else {
      return asset.fileName;
    }
  }

  uploadAsset(file) {
    if (this.ConfigService.isPreview()) {
      return this.upgrade.$injector.get('$q')((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = ((theFile) => {
          return (e) => {
            let fileSrc = e.target.result;
            let fileName = theFile.name;

            let asset: any = {};
            asset.file = file;
            asset.url = fileSrc;
            if (this.isImage(asset)) {
              asset.type = 'image';
              asset.iconURL = asset.url;
            } else if (this.isAudio(asset)) {
              asset.type = 'audio';
              asset.iconURL = 'wise5/themes/default/images/audio.png';
            } else {
              asset.type = 'file';
              asset.iconURL = 'wise5/themes/default/images/file.png';
            }
            this.allAssets.push(asset);
            return resolve(asset);
          };
        })(file);
        reader.readAsDataURL(file);
      });
    } else {
      const deferred = this.upgrade.$injector.get('$q').defer();
      this.upgrade.$injector
        .get('Upload')
        .upload({
          url: this.ConfigService.getStudentAssetsURL(),
          fields: {
            runId: this.ConfigService.getRunId(),
            workgroupId: this.ConfigService.getWorkgroupId(),
            periodId: this.ConfigService.getPeriodId(),
            clientSaveTime: Date.parse(new Date().toString())
          },
          file: file
        })
        .success((asset, status, headers, config) => {
          if (asset === 'error') {
            alert(
              this.upgrade.$injector.get('$filter')('translate')('THERE_WAS_AN_ERROR_UPLOADING')
            );
          } else {
            const studentUploadsBaseURL = this.ConfigService.getStudentUploadsBaseURL();
            asset.url = studentUploadsBaseURL + asset.filePath;
            if (this.isImage(asset)) {
              asset.type = 'image';
              asset.iconURL = asset.url;
            } else if (this.isAudio(asset)) {
              asset.type = 'audio';
              asset.iconURL = 'wise5/themes/default/images/audio.png';
            } else {
              asset.type = 'file';
              asset.iconURL = 'wise5/themes/default/images/file.png';
            }
            this.allAssets.push(asset);
            deferred.resolve(asset);
          }
        })
        .error((asset, status, headers, config) => {
          alert(
            this.upgrade.$injector.get('$filter')('translate')(
              'THERE_WAS_AN_ERROR_UPLOADING_YOU_MIGHT_HAVE_REACHED_LIMIT'
            )
          );
        });
      return deferred.promise;
    }
  }

  uploadAssets(files) {
    const promises = files.map((file) => {
      return this.upgrade.$injector.get('Upload').upload({
        url: this.ConfigService.getStudentAssetsURL(),
        fields: {
          runId: this.ConfigService.getRunId(),
          workgroupId: this.ConfigService.getWorkgroupId(),
          periodId: this.ConfigService.getPeriodId(),
          clientSaveTime: Date.parse(new Date().toString())
        },
        file: file
      });
    });
    return this.upgrade.$injector.get('$q').all(promises);
  }

  // given asset, makes a copy of it so steps can use for reference. Returns newly-copied asset.
  copyAssetForReference(studentAsset) {
    if (this.ConfigService.isPreview()) {
      return this.upgrade.$injector.get('$q')((resolve, reject) => {
        return resolve(studentAsset);
      });
    } else {
      return this.http
        .post(`${this.ConfigService.getStudentAssetsURL()}/copy`, {
          studentAssetId: studentAsset.id,
          workgroupId: this.ConfigService.getWorkgroupId(),
          periodId: this.ConfigService.getPeriodId(),
          clientSaveTime: Date.parse(new Date().toString())
        })
        .toPromise()
        .then((copiedAsset: any) => {
          if (copiedAsset != null) {
            const studentUploadsBaseURL = this.ConfigService.getStudentUploadsBaseURL();
            if (copiedAsset.isReferenced && copiedAsset.fileName !== '.DS_Store') {
              copiedAsset.url = studentUploadsBaseURL + copiedAsset.filePath;
              if (this.isImage(copiedAsset)) {
                copiedAsset.type = 'image';
                copiedAsset.iconURL = copiedAsset.url;
              } else if (this.isAudio(copiedAsset)) {
                copiedAsset.type = 'audio';
                copiedAsset.iconURL = 'wise5/vle/notebook/audio.png';
              } else {
                copiedAsset.type = 'file';
                copiedAsset.iconURL = 'wise5/vle/notebook/file.png';
              }
              return copiedAsset;
            }
          }
          return null;
        });
    }
  }

  deleteAsset(studentAsset: any) {
    if (this.ConfigService.isPreview()) {
      return this.upgrade.$injector.get('$q')((resolve, reject) => {
        this.allAssets = this.allAssets.splice(this.allAssets.indexOf(studentAsset), 1);
        return resolve(studentAsset);
      });
    } else {
      let httpParams = new HttpParams();
      httpParams = httpParams.set('studentAssetId', studentAsset.id);
      httpParams = httpParams.set('workgroupId', this.ConfigService.getWorkgroupId());
      httpParams = httpParams.set('periodId', this.ConfigService.getPeriodId());
      httpParams = httpParams.set('clientDeleteTime', `${Date.parse(new Date().toString())}`);
      const options = { params: httpParams };
      return this.http
        .delete(`${this.ConfigService.getStudentAssetsURL()}/delete`, options)
        .toPromise()
        .then(() => {
          this.allAssets.splice(this.allAssets.indexOf(studentAsset), 1);
          return studentAsset;
        });
    }
  }

  broadcastShowStudentAssets(args: any) {
    this.showStudentAssetsSource.next(args);
  }
}
