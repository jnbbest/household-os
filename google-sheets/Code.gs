/**
 * ============================================================
 * HOUSEHOLD OS · GOOGLE APPS SCRIPT WEBHOOK ENGINE
 * Author: Jigar Bhanushali · GrowthX
 * Repository: https://github.com/jnbbest/household-os
 * ============================================================
 * 
 * Setup Instructions:
 * 1. Create a Google Sheet with 4 tabs:
 *    - Ownership
 *    - Money_Pool
 *    - Doc_Index
 *    - Sunday_Reset
 * 2. Extensions > Apps Script > Paste this entire file into Code.gs
 * 3. Deploy > New deployment > Select 'Web app'
 *    - Description: Household OS Webhook v1.0
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone
 * 4. Copy the Web App URL (starts with https://script.google.com/macros/s/...)
 * 5. Set as VITE_GOOGLE_SHEET_URL in your Vercel project environment variables!
 */

// Handle GET requests (Read data from Google Sheet)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var tabName = (e && e.parameter && e.parameter.tab) ? e.parameter.tab : 'all';
    var result = {};

    var tabNames = ['Ownership', 'Money_Pool', 'Doc_Index', 'Sunday_Reset'];

    if (tabName !== 'all' && tabNames.indexOf(tabName) !== -1) {
      tabNames = [tabName];
    }

    tabNames.forEach(function(name) {
      var sheet = ss.getSheetByName(name);
      if (sheet) {
        var values = sheet.getDataRange().getValues();
        if (values.length > 1) {
          var headers = values[0];
          var rows = [];
          for (var i = 1; i < values.length; i++) {
            var rowObj = {};
            for (var j = 0; j < headers.length; j++) {
              rowObj[headers[j]] = values[i][j];
            }
            rows.push(rowObj);
          }
          result[name] = rows;
        } else {
          result[name] = [];
        }
      } else {
        result[name] = [];
      }
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: result
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle POST requests (Write / Update data in Google Sheet)
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = JSON.parse(e.postData.contents);
    var tabName = payload.tab;
    var action = payload.action || 'sync_tab';
    var rows = payload.rows || [];

    if (!tabName) {
      throw new Error("Missing 'tab' parameter in payload");
    }

    var sheet = ss.getSheetByName(tabName) || ss.insertSheet(tabName);

    if (action === 'sync_tab') {
      // Overwrite tab data while preserving headers
      if (rows.length > 0) {
        var headers = Object.keys(rows[0]);
        sheet.clear();
        sheet.appendRow(headers);
        
        var matrix = [];
        for (var i = 0; i < rows.length; i++) {
          var rowData = [];
          for (var j = 0; j < headers.length; j++) {
            var val = rows[i][headers[j]];
            rowData.push(val !== undefined && val !== null ? val : '');
          }
          matrix.push(rowData);
        }
        
        if (matrix.length > 0) {
          sheet.getRange(2, 1, matrix.length, headers.length).setValues(matrix);
        }
      }
    } else if (action === 'append_row') {
      // Append a single row
      var row = payload.row;
      if (Array.isArray(row)) {
        sheet.appendRow(row);
      } else if (typeof row === 'object') {
        var lastHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        var rowArr = lastHeaders.map(function(h) { return row[h] || ''; });
        sheet.appendRow(rowArr);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      tab: tabName,
      syncedRows: rows.length,
      updatedAt: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
