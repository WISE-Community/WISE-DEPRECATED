/**
 * Copyright (c) 2008-2019 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers.run;

import java.io.BufferedInputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import javax.servlet.http.HttpServletResponse;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFFormulaEvaluator;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

/**
 * Admin/researcher tool to merge multiple spreadsheets based on one common column in each sheet.
 *
 * Each sheet must contain exactly one common column. We'll refer to this as the "mergeColumn", and the values
 * in the mergeColumn will be called "mergeColumnValue".
 *
 * If there are multiple mergeColumnValue rows in a sheet, the resulting merged file will contain copies of the header
 * of that sheet. So if sheet X has headers {headerA, headerB, header C}, the resulting merged file would contain
 * headers {headerA sheetX 1, headerB sheetX 1, headerC sheetX 1, headerA sheetX 2, headerB sheetX 2, headerC sheetX 3}
 *
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/admin/run/mergespreadsheets")
public class MergeSpreadsheetsController {

  @PostMapping
  protected ModelAndView mergeSpreadsheets(
      @RequestParam("uploadFile") MultipartFile uploadFile,
      @RequestParam("mergeColumnTitle") String mergeColumnTitle,
      HttpServletResponse response
  ) throws Exception {
    BufferedInputStream fis = new BufferedInputStream(uploadFile.getInputStream());
    XSSFWorkbook workbook = new XSSFWorkbook(fis);
    fis.close();
    DataFormatter objDefaultFormat = new DataFormatter();
    FormulaEvaluator objFormulaEvaluator = new XSSFFormulaEvaluator((XSSFWorkbook) workbook);
    int numberOfSheets = workbook.getNumberOfSheets();

    // contains all values of the merge column across all sheets
    ArrayList<String> mergeColumnValues = new ArrayList<String>();

    // maps mergeColumn value to a Map<SheetIndex, ArrayList<Row>>
    HashMap<String, HashMap<Integer, ArrayList<Row>>> mergeColumnValueToSheetRows = new HashMap<String, HashMap<Integer, ArrayList<Row>>>();

    // maps sheet index to the headers in that sheet
    HashMap<Integer, ArrayList<String>> sheetIndexToSheetColumnHeaders = new HashMap<Integer, ArrayList<String>>();

    // how many copies of headers need to be created for each sheet
    HashMap<Integer, Integer> sheetIndexToMaxSheetRowCount = new HashMap<Integer, Integer>();

    // loop through the sheets in the workbook and populate the variables
    for (int sheetIndex = 0; sheetIndex < numberOfSheets; sheetIndex++) {
      XSSFSheet sheet = workbook.getSheetAt(sheetIndex);
      int mergeColumnIndex = -1;  // index of the merge column in this sheet
      int rowIteratorIndex = 0;   // index of current row iteration

      // collect all of the merge column rows in each sheet
      Iterator<Row> rowIterator = sheet.rowIterator();

      int maxSheetRowCountForCurrentSheet = 0;
      while (rowIterator.hasNext()) {
        Row row = (Row) rowIterator.next();
        if (rowIteratorIndex == 0) {
          // for the very first row in this sheet, go through all the cells in the top row and add to sheetColumnHeaders
          // and add it to sheetIndexToSheetColumnHeaders
          ArrayList<String> sheetColumnHeaders = new ArrayList<String>();

          int rowCellIteratorIndex = 0;
          Iterator<Cell> topRowCellIterator = row.cellIterator();
          while (topRowCellIterator.hasNext()) {
            Cell topRowCell = topRowCellIterator.next();
            String topRowCellString = topRowCell.toString();
            if (!topRowCellString.isEmpty()) {
              sheetColumnHeaders.add(topRowCellString);
            }
            if (!topRowCellString.isEmpty() && topRowCellString.equals(mergeColumnTitle)) {
              // this is the mergeColumn. Remember the column index
              if (mergeColumnIndex == -1) {
                mergeColumnIndex = rowCellIteratorIndex;
              } else {
                // there are multiple mergeColumnTitles in this sheet. Let the user know and exit
                ModelAndView mav = new ModelAndView("/admin/run/mergespreadsheets");
                mav.addObject("errorMsg", "You have multiple columns titled \"" + mergeColumnTitle + "\" in worksheet #" + (sheetIndex + 1) + ". You can have only one merge column per worksheet. Please fix and try again.");
                return mav;
              }
            }
            rowCellIteratorIndex++;
          }
          sheetIndexToSheetColumnHeaders.put(sheetIndex, sheetColumnHeaders);
        } else {
          // for rows that are not the top row (header)
          // 1. get all the mergeColumnValues
          // 2. populate mergeColumnValueToSheetRows
          // 3. calculate sheetIndexToMaxSheetRowCount
          Cell mergeColumnValueCell = row.getCell(mergeColumnIndex);
          if (mergeColumnValueCell != null && !mergeColumnValueCell.toString().isEmpty()) {

            objFormulaEvaluator.evaluate(mergeColumnValueCell);
            String mergeColumnValueString = objDefaultFormat.formatCellValue(mergeColumnValueCell, objFormulaEvaluator);

            HashMap<Integer, ArrayList<Row>> sheetIndexToSheetRows = mergeColumnValueToSheetRows.get(mergeColumnValueString);
            if (sheetIndexToSheetRows == null) {
              sheetIndexToSheetRows = new HashMap<Integer, ArrayList<Row>>();
              mergeColumnValueToSheetRows.put(mergeColumnValueString, sheetIndexToSheetRows);
            }
            ArrayList<Row> sheetRows = sheetIndexToSheetRows.get(sheetIndex);
            if (sheetRows == null) {
              sheetRows = new ArrayList<>();
              sheetIndexToSheetRows.put(sheetIndex, sheetRows);
            }
            sheetRows.add(row);
            if (sheetRows.size() > maxSheetRowCountForCurrentSheet) {
              maxSheetRowCountForCurrentSheet = sheetRows.size();
            }

            Iterator<Cell> rowCellIterator = row.cellIterator();
            int rowCellIteratorIndex = 0;
            while (rowCellIterator.hasNext()) {
              Cell rowCell = rowCellIterator.next();
              if (rowCellIteratorIndex == mergeColumnIndex) {
                // this is a merge column cell, so add its value to mergeColumnValues
                if (!rowCell.toString().isEmpty()) {
                  objFormulaEvaluator.evaluate(rowCell);
                  String rowCellValueString = objDefaultFormat.formatCellValue(rowCell, objFormulaEvaluator);
                  if (!mergeColumnValues.contains(rowCellValueString)) {
                    mergeColumnValues.add(rowCellValueString);
                  }
                }
              }
              rowCellIteratorIndex++;
            }
          }
        }
        rowIteratorIndex++;
      }
      sheetIndexToMaxSheetRowCount.put(sheetIndex, maxSheetRowCountForCurrentSheet);
    }

    // Now we are ready to make the merge sheet. We will be writing one row at a time.

    Workbook wbOut = new XSSFWorkbook();
    Sheet mergedSheet = wbOut.createSheet("merged");  // output merged result in "merged" sheet

    // make the header row
    Row headerRow = mergedSheet.createRow(0);

    // (0,0) will be the merge cell header. Column 0 will contain mergeColumnValues.
    Cell mergeColumnHeaderCell = headerRow.createCell(0);
    mergeColumnHeaderCell.setCellValue(mergeColumnTitle);

    // current column index "cursor" where we will be writing to
    int cellIndexWithoutMergeColumn = 1;

    for (int sheetIndex = 0; sheetIndex < numberOfSheets; sheetIndex++) {
      Integer maxSheetRowCount = sheetIndexToMaxSheetRowCount.get(sheetIndex);
      ArrayList<String> sheetColumnHeaders = sheetIndexToSheetColumnHeaders.get(sheetIndex);
      XSSFSheet sheet = workbook.getSheetAt(sheetIndex);
      String sheetName = sheet.getSheetName();

      for (int i = 0; i < maxSheetRowCount; i++) {
        for (int sheetColumnHeaderIndex = 0; sheetColumnHeaderIndex < sheetColumnHeaders.size(); sheetColumnHeaderIndex++) {
          String sheetColumnHeader = sheetColumnHeaders.get(sheetColumnHeaderIndex);
          if (!sheetColumnHeader.isEmpty() && !sheetColumnHeader.equals(mergeColumnTitle)) {
            String newSheetColumnHeader = sheetColumnHeader + " ( " + sheetName + " " + (i + 1) + " ) ";
            Cell headerCell = headerRow.createCell(cellIndexWithoutMergeColumn);
            headerCell.setCellValue(newSheetColumnHeader);
            cellIndexWithoutMergeColumn++;
          }
        }
      }
    }

    // now make all the non-header rows
    for (int mergeColumnValueIndex = 0; mergeColumnValueIndex < mergeColumnValues.size(); mergeColumnValueIndex++) {
      String mergeColumnValue = mergeColumnValues.get(mergeColumnValueIndex);
      HashMap<Integer, ArrayList<Row>> mergeColumnValueSheetRow = mergeColumnValueToSheetRows.get(mergeColumnValue);
      if (mergeColumnValueSheetRow == null) {
        System.out.println("Null mergeColumnValueSheetRow, continuing. mergeColumnValueIndex: " + mergeColumnValueIndex + " mergeColumnValue: " + mergeColumnValue);
        continue;
      }

      Row row = mergedSheet.createRow(mergeColumnValueIndex + 1);  // + 1 is to account for the header row;

      // reset current cursor as we make each row
      cellIndexWithoutMergeColumn = 0;

      // first column will be the merge column value
      Cell mergeColumnCell = row.createCell(0);
      mergeColumnCell.setCellValue(mergeColumnValue);
      cellIndexWithoutMergeColumn++;

      for (int sheetIndex = 0; sheetIndex < numberOfSheets; sheetIndex++) {
        ArrayList<Row> sheetRows = mergeColumnValueSheetRow.get(sheetIndex);
        int currentSheetSheetRowIndex = 0;
        ArrayList<String> sheetHeaders = sheetIndexToSheetColumnHeaders.get(sheetIndex);

        if (sheetRows != null) {
          for (int sheetRowIndex = 0; sheetRowIndex < sheetRows.size(); sheetRowIndex++) {
            Row sheetRow = sheetRows.get(sheetRowIndex);
            for (int sheetHeaderIndex = 0; sheetHeaderIndex < sheetHeaders.size(); sheetHeaderIndex++) {
              String sheetHeader = sheetHeaders.get(sheetHeaderIndex);
              if (!sheetHeader.equals(mergeColumnTitle)) {
                Cell cell = sheetRow.getCell(sheetHeaderIndex);
                Cell exportCell = row.createCell(cellIndexWithoutMergeColumn);
                objFormulaEvaluator.evaluate(cell);
                String cellString = objDefaultFormat.formatCellValue(cell, objFormulaEvaluator);
                exportCell.setCellValue(cellString);
                cellIndexWithoutMergeColumn++;
              }
            }
            currentSheetSheetRowIndex++;
          }
        }

        // some columns do not have any values to populate, so populate them with empty cells
        Integer maxSheetRowCount = sheetIndexToMaxSheetRowCount.get(sheetIndex);
        while (currentSheetSheetRowIndex < maxSheetRowCount) {
          for (int i = 0; i < sheetHeaders.size(); i++) {
            String sheetHeader = sheetHeaders.get(i);
            if (!sheetHeader.isEmpty() && !sheetHeader.equals(mergeColumnTitle)) {
              Cell exportCell = row.createCell(cellIndexWithoutMergeColumn);
              exportCell.setCellValue("");
              cellIndexWithoutMergeColumn++;
            }
          }
          currentSheetSheetRowIndex++;
        }
      }
    }

    String mergedResultFileName = "merged_" + uploadFile.getOriginalFilename();
    response.setHeader("Content-Disposition", "attachment; filename=\"" + mergedResultFileName + "\"");
    wbOut.write(response.getOutputStream());
    return null;
  }

  @GetMapping
  public ModelAndView initializeForm() {
    return new ModelAndView();
  }
}
