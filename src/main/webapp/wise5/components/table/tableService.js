import ComponentService from '../componentService';
import html2canvas from 'html2canvas';

class TableService extends ComponentService {

  constructor($filter,
      $q,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    super($filter, StudentDataService, UtilService);
    this.$q = $q;
    this.StudentAssetService = StudentAssetService;
  }

  getComponentTypeLabel() {
    return this.$translate('table.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'Table';
    component.globalCellSize = 10;
    component.numRows = 3;
    component.numColumns = 3;
    component.tableData = [
      [
        {
          'text': '',
          'editable': true,
          'size': null
        },
        {
          'text': '',
          'editable': true,
          'size': null
        },
        {
          'text': '',
          'editable': true,
          'size': null
        }
      ],
      [
        {
          'text': '',
          'editable': true,
          'size': null
        },
        {
          'text': '',
          'editable': true,
          'size': null
        },
        {
          'text': '',
          'editable': true,
          'size': null
        }
      ],
      [
        {
          'text': '',
          'editable': true,
          'size': null
        },
        {
          'text': '',
          'editable': true,
          'size': null
        },
        {
          'text': '',
          'editable': true,
          'size': null
        }
      ]
    ];

    return component;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
    if (!this.componentHasEditableCells(component)) {
      /*
       * The component does not have any editable cells so we will say
       * it is completed.
       */
      return true;
    }
    if (componentStates && componentStates.length) {
      let submitRequired = node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);

      // loop through all the component states
      for (let c = 0, l = componentStates.length; c < l; c++) {

        // the component state
        let componentState = componentStates[c];

        // get the student data from the component state
        let studentData = componentState.studentData;

        if (studentData != null) {
          let tableData = studentData.tableData;

          if (tableData != null) {
            // there is a table data so the component has saved work
            // TODO: check for actual student data from the table (compare to starting state)
            if (submitRequired) {
              // completion requires a submission, so check for isSubmit
              if (componentState.isSubmit) {
                return true;
              }
            } else {
              return true;
            }
          }
        }
      }
    }

    return false;
  };

  /**
   * Check if a table component has any editable cells.
   * @param component The component content.
   * @return Whether the component has any editable cells.
   */
  componentHasEditableCells(component) {
    if (component != null) {
      let tableData = component.tableData;
      if (tableData != null) {
        for (let r = 0; r < tableData.length; r++) {
          let row = tableData[r];
          if (row != null) {
            for (let c = 0; c < row.length; c++) {
              let cell = row[c];
              if (cell != null) {
                if (cell.editable === true) {
                  return true;
                }
              }
            }
          }
        }
      }
    }

    return false;
  }

  componentStateHasStudentWork(componentState, componentContent) {

    if (componentState != null) {

      let studentData = componentState.studentData;

      if (studentData != null) {

        // get the table from the student data
        let studentTableData = studentData.tableData;

        // get the table from the component content
        let componentContentTableData = componentContent.tableData;

        if (studentTableData != null) {

          let studentRows = studentTableData;

          // loop through the student rows
          for (let r = 0; r < studentRows.length; r++) {
            let studentRow = studentRows[r];

            if (studentRow != null) {

              // loop through the student columns
              for (let c = 0; c < studentRow.length; c++) {

                // get cell from the student
                let studentCell = this.getTableDataCellValue(r, c, studentTableData);

                // get a cell from the component content
                let componentContentCell = this.getTableDataCellValue(r, c, componentContentTableData);

                if (studentCell !== componentContentCell) {
                  /*
                   * the cell values are not the same which means
                   * the student has changed the table
                   */
                  return true;
                }
              }
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Get the value of a cell in the table
   * @param x the x coordinate
   * @param y the y coordinate
   * @param table (optional) table data to get the value from. this is used
   * when we want to look up the value in the default authored table
   * @returns the cell value (text or a number)
   */
  getTableDataCellValue(x, y, table) {

    var cellValue = null;

    if (table != null) {

      // get the row we want
      var row = table[y];

      if (row != null) {

        // get the cell we want
        var cell = row[x];

        if (cell != null) {

          // set the value into the cell
          cellValue = cell.text;
        }
      }
    }

    return cellValue;
  }

  /**
   * The component state has been rendered in a <component></component> element
   * and now we want to take a snapshot of the work.
   * @param componentState The component state that has been rendered.
   * @return A promise that will return an image object.
   */
  generateImageFromRenderedComponentState(componentState) {
    let deferred = this.$q.defer();
    let tableElement = angular.element(document.querySelector('#table_' + componentState.nodeId + '_' + componentState.componentId));
    if (tableElement != null && tableElement.length > 0) {
      tableElement = tableElement[0];
      // convert the table element to a canvas element
      html2canvas(tableElement).then((canvas) => {
        // get the canvas as a base64 string
        let img_b64 = canvas.toDataURL('image/png');

        // get the image object
        let imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);

        // add the image to the student assets
        this.StudentAssetService.uploadAsset(imageObject).then((asset) => {
          deferred.resolve(asset);
        });
      });
    }
    return deferred.promise;
  }

  hasRequiredNumberOfFilledRows(componentState, requiredNumberOfFilledRows,
                                tableHasHeaderRow, requireAllCellsInARowToBeFilled) {
    const rows = componentState.studentData.tableData;
    let firstStudentRow = 0;
    if (tableHasHeaderRow) {
      firstStudentRow = 1;
    }
    let filledRows = 0;
    for (let r = firstStudentRow; r < rows.length; r++) {
      const row = rows[r];
      if (this.isRowFilled(row, requireAllCellsInARowToBeFilled)) {
        filledRows++;
      }
    }
    return filledRows >= requiredNumberOfFilledRows;
  }

  isRowFilled(row, requireAllCellsInARowToBeFilled) {
    if (requireAllCellsInARowToBeFilled) {
      return this.isAllCellsFilledInRow(row);
    } else {
      return this.isAtLeastOneCellFilledInRow(row);
    }
  }

  isAllCellsFilledInRow(row) {
    for (let c of row) {
      if (c.text == null || c.text == '') {
        return false;
      }
    }
    return true;
  }

  isAtLeastOneCellFilledInRow(row) {
    for (let c of row) {
      if (c.text != null && c.text != '') {
        return true;
      }
    }
    return false;
  }
}

TableService.$inject = [
  '$filter',
  '$q',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default TableService;
