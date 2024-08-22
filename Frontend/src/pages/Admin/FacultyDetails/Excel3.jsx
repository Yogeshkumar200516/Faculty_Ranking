import { alignProperty } from '@mui/material/styles/cssUtils';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const downloadExcel = (rows, columns) => {
  const filteredColumns = columns.filter(col => col.field !== 'action');
  const workbook = new ExcelJS.Workbook();
  const mainSheet = workbook.addWorksheet('Faculty FRS Overview');
  addSheetContent(mainSheet, rows, filteredColumns, 'Faculty FRS Overview');

  const groupedByYear = rows.reduce((acc, row) => {
    const { academicYear } = row;
    if (!acc[academicYear]) {
      acc[academicYear] = [];
    }
    acc[academicYear].push(row);
    return acc;
  }, {});

  Object.keys(groupedByYear).forEach(year => {
    const yearSheet = workbook.addWorksheet(year);
    addSheetContent(yearSheet, groupedByYear[year], filteredColumns, 'Faculty FRS Overview');
  });

  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Faculty_FRS_Overview.xlsx');
  }).catch((error) => {
    console.error('Error writing Excel file:', error);
    alert('Failed to generate Excel file. Please try again.');
  });
};

const addSheetContent = (worksheet, rows, columns, sheetTitle) => {
  const totalColumns = columns.length;
  worksheet.mergeCells(1, 1, 1, totalColumns);
  const titleRow = worksheet.getCell('A1');
  titleRow.value = sheetTitle;
  titleRow.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
  titleRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E88E5' },
  };

  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } }, // White text
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } }, // Darker blue background
    alignment: { vertical: 'middle', horizontal: 'center' },
    border: {
      top: { style: 'thin', color: { argb: 'FFB0BEC5' } },    // Light gray border
      left: { style: 'thin', color: { argb: 'FFB0BEC5' } },
      bottom: { style: 'thin', color: { argb: 'FFB0BEC5' } },
      right: { style: 'thin', color: { argb: 'FFB0BEC5' } },
    },
  };

  worksheet.columns = columns.map(col => ({
    header: 'Faculty FRS Overview', // Use headerName if available
    key: col.field,
    width: col.field === 'reason' ? Math.max(...rows.map(row => row[col.field]?.length || 0), col.width / 10) : col.width / 10,
    style: {
      alignment: { vertical: 'middle', horizontal: 'center' },
    },
  }));

  // Add the headers in row 2
  worksheet.getRow(2).values = columns.map(col => col.headerName);
  worksheet.getRow(2).eachCell((cell) => {
    cell.style = headerStyle;
  });

  // Add data rows
  rows.forEach(row => {
    const newRow = worksheet.addRow(columns.map(col => row[col.field]));
    newRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCFD8DC' } },
        left: { style: 'thin', color: { argb: 'FFCFD8DC' } },
        bottom: { style: 'thin', color: { argb: 'FFCFD8DC' } },
        right: { style: 'thin', color: { argb: 'FFCFD8DC' } },
      };
     
      if (columns[colNumber - 1].field === 'positiveCount') {
        cell.style = { 
          font: { color: { argb: 'FF00FF00' } }, // Green
          alignment: { horizontal: 'center', vertical: 'middle' } 
        };
      } else if (columns[colNumber - 1].field === 'negativeCount') {
        cell.style = { 
          font: { color: { argb: 'FFFF0000' } }, // Red
          alignment: { horizontal: 'center', vertical: 'middle' } 
        };
      }
    });
  });
};
