import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ConfigService } from '../../../../wise5/services/configService';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from '../../../../wise5/services/projectService';
import { UtilService } from '../../../../wise5/services/utilService';
import { ProjectAssetService } from './projectAssetService';
import { UpgradeModule } from '@angular/upgrade/static';
import { SessionService } from '../../../../wise5/services/sessionService';
let service: ProjectAssetService;
let configService: ConfigService;
let http: HttpTestingController;
let spongeBobAndPatrickAssets: any;

describe('ProjectAssetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [ConfigService, ProjectAssetService, ProjectService, SessionService, UtilService]
    });
    http = TestBed.get(HttpTestingController);
    configService = TestBed.get(ConfigService);
    service = TestBed.get(ProjectAssetService);
    spyOn(configService, 'getConfigParam').and.callFake((param) => {
      if (param === 'projectAssetURL') {
        return '/author/project/asset/1';
      } else if (param === 'projectAssetTotalSizeMax') {
        return 10000;
      }
      return '';
    });
    spongeBobAndPatrickAssets = {
      files: [
        { fileName: 'spongebob.png', fileSize: 1000 },
        { fileName: 'patrick.png', fileSize: 2000 }
      ],
      totalFileSize: 3000
    };
  });

  retrieveProjectAssets();
  uploadAssets();
  downloadAssetItem();
  deleteAssetItem();
  calculateAssetUsage();
  retrieveTextFilesAndCalculateUsedFiles();
  getAllUsedTextContent();
  isFileAlreadyAdded();
  getAllTextFiles();
  isTextFile();
  calculateUsedFiles();
  getFileNameFromURL();
  getTextFiles();
  injectFileTypeValues();
});

function retrieveProjectAssets() {
  it('should make a request to retrieve project assets', fakeAsync(() => {
    service.retrieveProjectAssets();
    const request = http.expectOne({ url: '/author/project/asset/1', method: 'GET' });
    request.flush(spongeBobAndPatrickAssets);
    expect(service.totalSizeMax).toEqual(10000);
    expect(service.getProjectAssets().getValue()).toEqual(spongeBobAndPatrickAssets);
  }));
}

function uploadAssets() {
  it('should make a request to upload assets', fakeAsync(() => {
    const files = [new File([''], 'spongebob.png'), new File([''], 'patrick.png')];
    const result = {
      assetDirectoryInfo: spongeBobAndPatrickAssets,
      success: [],
      error: []
    };
    service.uploadAssets(files).subscribe((data) => {
      expect(data).toEqual(result);
    });
    const request = http.expectOne({ url: '/author/project/asset/1', method: 'POST' });
    request.flush(result);
    expect(service.getProjectAssets().getValue()).toEqual(result.assetDirectoryInfo);
  }));
}

function downloadAssetItem() {
  it('should make a request to download an asset item', () => {
    spyOn(window, 'open');
    service.downloadAssetItem({ fileName: 'spongebob.png' });
    expect(window.open).toHaveBeenCalledWith(
      '/author/project/asset/1/download?assetFileName=spongebob.png'
    );
  });
}

function deleteAssetItem() {
  it('should make a request to delete an asset item', fakeAsync(() => {
    service.setProjectAssets(spongeBobAndPatrickAssets);
    const assetItem = { fileName: 'patrick.png' };
    service.deleteAssetItem(assetItem);
    const request = http.expectOne({ url: '/author/project/asset/1/delete', method: 'POST' });
    const response = {
      files: [{ fileName: 'spongebob.png', fileSize: 1000 }],
      totalFileSize: 1
    };
    request.flush(response);
    tick();
    expect(service.getProjectAssets().getValue()).toEqual(response);
  }));
}

function calculateAssetUsage() {
  it('should calculate asset usage when there are no text files', fakeAsync(() => {
    spyOn(service, 'calculateUsedFiles');
    service.calculateAssetUsage(spongeBobAndPatrickAssets);
    expect(service.calculateUsedFiles).toHaveBeenCalled();
  }));
  it('should calculate asset usage when there are text files', fakeAsync(() => {
    const assets = {
      files: [
        { fileName: 'spongebob.png', fileSize: 1000 },
        { fileName: 'patrick.png', fileSize: 1000 },
        { fileName: 'model.html', fileSize: 1000 },
        { fileName: 'model.js', fileSize: 1000 }
      ],
      totalFileSize: 4000
    };
    spyOn(service, 'retrieveTextFilesAndCalculateUsedFiles');
    service.calculateAssetUsage(assets);
    expect(service.retrieveTextFilesAndCalculateUsedFiles).toHaveBeenCalled();
  }));
  it('should calculate asset usage with usedTextContent containing project_thumb.png', () => {
    spyOn(service, 'calculateUsedFiles');
    service.calculateAssetUsage(spongeBobAndPatrickAssets);
    const usedTextContent = 'null' + service.projectThumbnailFileName;
    expect(service.calculateUsedFiles).toHaveBeenCalledWith(
      spongeBobAndPatrickAssets,
      usedTextContent
    );
  });
}

function getAllTextFiles() {
  it('should get all text files when there are no files', () => {
    const assets = {
      files: []
    };
    const allTextFiles = service.getAllTextFiles(assets);
    expect(allTextFiles.length).toEqual(0);
  });
  it('should get all text files when there are no text files', () => {
    const assets = {
      files: [{ fileName: 'spongebob.png' }]
    };
    const allTextFiles = service.getAllTextFiles(assets);
    expect(allTextFiles.length).toEqual(0);
  });
  it('should get all text files when there are text files', () => {
    const assets = {
      files: [{ fileName: 'spongebob.png' }, { fileName: 'model.html' }]
    };
    const allTextFiles = service.getAllTextFiles(assets);
    expect(allTextFiles.length).toEqual(1);
  });
}

function isTextFile() {
  it('should check if a file is a text file when it is not', () => {
    expect(service.isTextFile('spongebob.png')).toEqual(false);
  });
  it('should check if a file is a text file when it is', () => {
    expect(service.isTextFile('model.html')).toEqual(true);
  });
}

function calculateUsedFiles() {
  it('should calculate used files when none are used', () => {
    const usedTextContent = '';
    service.calculateUsedFiles(spongeBobAndPatrickAssets, usedTextContent);
    expect(service.getTotalFileSize().getValue()).toEqual(3000);
    expect(service.getTotalUnusedFileSize().getValue()).toEqual(3000);
  });
  it('should calculate used files when one is used', () => {
    const usedTextContent = 'spongebob.png';
    service.calculateUsedFiles(spongeBobAndPatrickAssets, usedTextContent);
    expect(service.getTotalFileSize().getValue()).toEqual(3000);
    expect(service.getTotalUnusedFileSize().getValue()).toEqual(2000);
  });
  it('should calculate used files when all are used', () => {
    const usedTextContent = 'spongebob.png,patrick.png';
    service.calculateUsedFiles(spongeBobAndPatrickAssets, usedTextContent);
    expect(service.getTotalFileSize().getValue()).toEqual(3000);
    expect(service.getTotalUnusedFileSize().getValue()).toEqual(0);
  });
}

function retrieveTextFilesAndCalculateUsedFiles() {
  it('should retrieve text files and calculate used files', fakeAsync(() => {
    const usedTextContent = '{}';
    const allTextFiles = ['model.html', 'model.js'];
    const textFile1 = { url: 'model.html', body: '<html></html>' };
    const textFile2 = { url: 'model.js', body: 'let a = 0;' };
    const allUsedTextContent = usedTextContent + textFile1.body + textFile2.body;
    spyOn(service, 'getAllUsedTextContent').and.returnValue(allUsedTextContent);
    spyOn(service, 'calculateUsedFiles');
    service.retrieveTextFilesAndCalculateUsedFiles(
      spongeBobAndPatrickAssets,
      usedTextContent,
      allTextFiles
    );
    const request1 = http.expectOne({ url: 'assets/model.html', method: 'GET' });
    const request2 = http.expectOne({ url: 'assets/model.js', method: 'GET' });
    request1.flush(textFile1);
    request2.flush(textFile2);
    expect(service.getAllUsedTextContent).toHaveBeenCalled();
    expect(service.calculateUsedFiles).toHaveBeenCalledWith(
      spongeBobAndPatrickAssets,
      allUsedTextContent
    );
  }));
}

function getAllUsedTextContent() {
  it('should get all used text content when none of the text files are used', () => {
    const usedTextContentSoFar = '{}';
    const textFiles = [{ url: 'model.html', body: '<html></html>' }];
    const usedTextContent = service.getAllUsedTextContent(usedTextContentSoFar, textFiles);
    expect(usedTextContent).toEqual('{}');
  });
  it('should get all used text content when one of the text files are used', () => {
    const usedTextContentSoFar = '{url:"model.html"}';
    const textFiles = [{ url: 'model.html', body: '<html></html>' }];
    const usedTextContent = service.getAllUsedTextContent(usedTextContentSoFar, textFiles);
    expect(usedTextContent).toEqual('{url:"model.html"}<html></html>');
  });
  it('should get all used text content when one text file references another text file', () => {
    const usedTextContentSoFar = '{url:"model.html"}';
    const textFiles = [
      { url: 'model.js', body: 'let a = 0;' },
      { url: 'model.html', body: '<html><script src="model.js"></script></html>' }
    ];
    const usedTextContent = service.getAllUsedTextContent(usedTextContentSoFar, textFiles);
    expect(usedTextContent).toEqual(
      '{url:"model.html"}<html><script src="model.js"></script></html>let a = 0;'
    );
  });
}

function isFileAlreadyAdded() {
  it('should check if file is already added when there are no used text file names', () => {
    const usedTextFileNames = [];
    const fileName = 'model2.html';
    expect(service.isFileAlreadyAdded(usedTextFileNames, fileName)).toEqual(false);
  });
  it('should check if file is already added when it has not been added', () => {
    const usedTextFileNames = ['model1.html'];
    const fileName = 'model2.html';
    expect(service.isFileAlreadyAdded(usedTextFileNames, fileName)).toEqual(false);
  });
  it('should check if file is already added when it has been added', () => {
    const usedTextFileNames = ['model1.html', 'model2.html'];
    const fileName = 'model2.html';
    expect(service.isFileAlreadyAdded(usedTextFileNames, fileName)).toEqual(true);
  });
}

function getFileNameFromURL() {
  it('should get file name from URL when the URL is an absolute path', () => {
    expect(service.getFileNameFromURL('/curriculum/1/assets/spongebob.png')).toEqual(
      'spongebob.png'
    );
  });
  it('should get file name from URL when URL is just the file name', () => {
    expect(service.getFileNameFromURL('spongebob.png')).toEqual('spongebob.png');
  });
}

function getTextFiles() {
  it('should get text files', fakeAsync(() => {
    const url1 = 'assets/model1.html';
    const url2 = 'assets/model2.html';
    const text1 = 'text from model1';
    const text2 = 'text from model2';
    const textFileNames = ['model1.html', 'model2.html'];
    service.getTextFiles(textFileNames).subscribe((textFiles) => {
      expect(textFiles[0].url).toEqual(url1);
      expect(textFiles[1].url).toEqual(url2);
      expect(textFiles[0].body).toEqual(text1);
      expect(textFiles[1].body).toEqual(text2);
    });
    const request1 = http.expectOne({ url: url1, method: 'GET' });
    const request2 = http.expectOne({ url: url2, method: 'GET' });
    const result1 = text1;
    const result2 = text2;
    request1.flush(result1);
    request2.flush(result2);
  }));
}

function injectFileTypeValues() {
  it('should inject file type values', () => {
    const files: any = [
      { fileName: 'spongebob.png' },
      { fileName: 'squidward.mp4' },
      { fileName: 'plankton.pdf' }
    ];
    service.injectFileTypeValues(files);
    expect(files[0].fileType).toEqual('image');
    expect(files[1].fileType).toEqual('video');
    expect(files[2].fileType).toEqual('other');
  });
}
