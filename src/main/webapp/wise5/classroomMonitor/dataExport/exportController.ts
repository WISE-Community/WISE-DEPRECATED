'use strict';

class ExportController {
  $translate: any;
  maxExcelCellSize: number = 32767;

  static $inject = ['$filter', 'FileSaver'];

  constructor($filter, private FileSaver: any) {
    this.$translate = $filter('translate');
  }

  /**
   * Generate the csv file and have the client download it
   * @param rows a 2D array that represents the rows in the export. each row contains an array. the
   * inner array contains strings or numbers which represent the cell values in the export.
   * @param fileName the name of the file that will be generated
   */
  generateCSVFile(rows: any[], fileName: string) {
    const csvString = this.generateCSVString(rows);
    const csvBlob = new Blob([csvString], { type: 'text/csv' });
    this.FileSaver.saveAs(csvBlob, fileName);
  }

  generateCSVString(rows: any[]) {
    let csvString = '';
    for (const row of rows) {
      csvString += this.createCSVRow(row);
    }
    return csvString;
  }

  createCSVRow(row: any[]) {
    let csvString = '';
    for (const cell of row) {
      csvString += `${this.createCSVCell(cell)},`;
    }
    csvString += '\r\n';
    return csvString;
  }

  createCSVCell(cell: any) {
    let csvString = '';
    if (this.isEmpty(cell)) {
      csvString = ' ';
    } else if (this.isObject(cell)) {
      csvString = JSON.stringify(cell);
      csvString = csvString.replace(/"/g, '""');
      csvString = this.wrapInDoubleQuotes(csvString);
    } else if (this.isString(cell)) {
      csvString = this.wrapInDoubleQuotes(cell);
    } else {
      csvString = cell;
    }
    if (this.isStringTooLarge(csvString)) {
      csvString = 'Data Too Large';
    }
    return csvString;
  }

  isEmpty(data: any) {
    return data == null || data === '' || typeof data === 'undefined';
  }

  isObject(data: any) {
    return typeof data === 'object';
  }

  isString(data: any) {
    return typeof data === 'string';
  }

  wrapInDoubleQuotes(str: string) {
    return `"${str}"`;
  }

  isStringTooLarge(str: string) {
    return str.length >= this.maxExcelCellSize;
  }
}

export default ExportController;
