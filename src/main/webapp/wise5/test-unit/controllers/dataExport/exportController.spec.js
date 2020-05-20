import classroomMonitorModule from '../../../classroomMonitor/classroomMonitor';

let $controller;
let $rootScope;
let $scope;
let exportController;
let FileSaver;

describe('ExportController', () => {
  beforeEach(angular.mock.module(classroomMonitorModule.name));
  beforeEach(inject((_$controller_, _$rootScope_, _FileSaver_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    FileSaver = _FileSaver_;
    exportController = $controller('ExportController', {});
  }));
  generateCSVFile_ShouldCallSaveAs();
  generateCSVString_WithA2DArray_ShouldGenerateACSVString();
  generateCSVRow_WithAnArray_ShouldGenerateACSVRow();
  generateCSVCell_WithNull_ShouldGenerateACSVCell();
  generateCSVCell_WithEmptyString_ShouldGenerateACSVCell();
  generateCSVCell_WithUndefined_ShouldGenerateACSVCell();
  generateCSVCell_WithAString_ShouldGenerateACSVCell();
  generateCSVCell_WithANumber_ShouldGenerateACSVCell();
  generateCSVCell_WithAnObject_ShouldGenerateACSVCell();
  generateCSVCell_WithAStringTooLong_ShouldGenerateACSVCell();
  generateCSVCell_WithAStringNotTooLong_ShouldGenerateACSVCell();
});

function generateCSVFile_ShouldCallSaveAs() {
  it('generateCSVFile should call save as', () => {
    spyOn(FileSaver, 'saveAs').and.callFake(() => {});
    exportController.generateCSVFile('', 'test.csv');
    expect(FileSaver.saveAs).toHaveBeenCalled();
  });
}

function generateCSVString_WithA2DArray_ShouldGenerateACSVString() {
  it('generateCSVString with a 2d array should generate a csv string', () => {
    const data = [
      ['ID', 'Spatulas', 'Burger Orders'],
      [1, 10, 100]
    ];
    const csvString = exportController.generateCSVString(data);
    expect(csvString).toEqual('"ID","Spatulas","Burger Orders",\r\n1,10,100,\r\n');
  });
}

function generateCSVRow_WithAnArray_ShouldGenerateACSVRow() {
  it('generateCSVRow with an array should generate a csv row', () => {
    const data = ['ID', 'Spatulas', 'Burger Orders'];
    const csvString = exportController.createCSVRow(data);
    expect(csvString).toEqual('"ID","Spatulas","Burger Orders",\r\n');
  });
}

function generateCSVCell_WithNull_ShouldGenerateACSVCell() {
  it('generateCSVCell with null should generate a csv cell', () => {
    const data = null;
    const csvString = exportController.createCSVCell(data);
    expect(csvString).toEqual(' ');
  });
}

function generateCSVCell_WithEmptyString_ShouldGenerateACSVCell() {
  it('generateCSVCell with empty string should generate a csv cell', () => {
    const data = '';
    const csvString = exportController.createCSVCell(data);
    expect(csvString).toEqual(' ');
  });
}

function generateCSVCell_WithUndefined_ShouldGenerateACSVCell() {
  it('generateCSVCell with undefined should generate a csv cell', () => {
    const data = undefined;
    const csvString = exportController.createCSVCell(data);
    expect(csvString).toEqual(' ');
  });
}

function generateCSVCell_WithAString_ShouldGenerateACSVCell() {
  it('generateCSVCell with a string should generate a csv cell', () => {
    const data = 'Hello';
    const csvString = exportController.createCSVCell(data);
    expect(csvString).toEqual('"Hello"');
  });
}

function generateCSVCell_WithANumber_ShouldGenerateACSVCell() {
  it('generateCSVCell with a number should generate a csv cell', () => {
    const data = 11;
    const csvString = exportController.createCSVCell(data);
    expect(csvString).toEqual(11);
  });
}

function generateCSVCell_WithAnObject_ShouldGenerateACSVCell() {
  it('generateCSVCell with an object should generate a csv cell', () => {
    const data = { id: 1, type: 'Hot Dog' };
    const csvString = exportController.createCSVCell(data);
    expect(csvString).toEqual('"{""id"":1,""type"":""Hot Dog""}"');
  });
}

function generateCSVCell_WithAStringTooLong_ShouldGenerateACSVCell() {
  it('generateCSVCell with a string too long should generate a csv cell', () => {
    const data = 'a'.repeat(32767);
    const csvString = exportController.createCSVCell(data);
    expect(csvString).toEqual('Data Too Large');
  });
}

function generateCSVCell_WithAStringNotTooLong_ShouldGenerateACSVCell() {
  it('generateCSVCell with a string not too long should generate a csv cell', () => {
    const data = 'a'.repeat(32764);
    const csvString = exportController.createCSVCell(data);
    expect(csvString).toEqual(`"${data}"`);
  });
}
