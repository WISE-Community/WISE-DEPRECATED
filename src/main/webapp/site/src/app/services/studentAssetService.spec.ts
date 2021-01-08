import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { StudentAssetService } from '../../../../wise5/services/studentAssetService';
import { ConfigService } from '../../../../wise5/services/configService';

let configService: ConfigService;
let service: StudentAssetService;
let http: HttpTestingController;
const studentAssetURL = '/student/asset/123';
const workgroupId = 1;
const periodId = 256;
let asset1, asset2;

describe('StudentAssetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [StudentAssetService, ConfigService]
    });
    http = TestBed.get(HttpTestingController);
    service = TestBed.get(StudentAssetService);
    configService = TestBed.get(ConfigService);
  });
  initialize();
  retrieveAssets();
  deleteAsset();
});

function initialize() {
  asset1 = { id: 1, fileName: 'wise.png', url: '/curriculum/1/wise.png' };
  asset2 = { id: 2, fileName: 'wiser.png', url: '/curriculum/1/wiser.png' };
}

function retrieveAssets() {
  describe('retrieveAssets', () => {
    beforeEach(() => {
      spyOn(configService, 'getWorkgroupId').and.returnValue(workgroupId);
      spyOn(configService, 'getConfigParam')
        .withArgs('mode')
        .and.returnValue('studentRun')
        .withArgs('studentAssetsURL')
        .and.returnValue(studentAssetURL);
    });
    retrieveAssets_StudentMode_FetchAssetsAndSetAttributes();
  });
}

function deleteAsset() {
  describe('deleteAsset', () => {
    beforeEach(() => {
      spyOn(configService, 'getWorkgroupId').and.returnValue(workgroupId);
      spyOn(configService, 'getPeriodId').and.returnValue(periodId);
      spyOn(configService, 'getConfigParam')
        .withArgs('mode')
        .and.returnValue('studentRun')
        .withArgs('studentAssetsURL')
        .and.returnValue(studentAssetURL);
    });
    deleteAsset_StudentMode_DeleteAsset();
  });
}

function retrieveAssets_StudentMode_FetchAssetsAndSetAttributes() {
  it('should fetch assets and set attributes', () => {
    service.retrieveAssets().then((response) => {
      expect(response.length).toEqual(1);
      expect(response[0].type).toEqual('image');
    });
    http.expectOne(`${studentAssetURL}/${workgroupId}`).flush([asset1]);
  });
}

function deleteAsset_StudentMode_DeleteAsset() {
  it('should delete', fakeAsync(() => {
    service.allAssets = [asset2];
    expect(service.allAssets.length).toEqual(1);
    service.deleteAsset(asset2);
    const request = http.expectOne((req): boolean => {
      return req.url.startsWith(`${studentAssetURL}/delete`);
    });
    expect(request.request.method).toEqual('DELETE');
    expect(request.request.params.get('studentAssetId')).toEqual(2 as any);
    expect(request.request.params.get('clientDeleteTime')).toBeDefined();
    request.flush({});
    tick();
    expect(service.allAssets.length).toEqual(0);
  }));
}
