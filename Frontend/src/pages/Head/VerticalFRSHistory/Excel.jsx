import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const downloadExcel = (rows, columns) => {
  const workbook = new ExcelJS.Workbook();

  // Overall List Sheet
  const overallSheet = workbook.addWorksheet('Overall List');
  addSheetContent(overallSheet, rows, columns, 'Overall List');

  // Group rows by Academic Year
  const groupedByYear = rows.reduce((acc, row) => {
    const { academicYear } = row;
    if (!acc[academicYear]) {
      acc[academicYear] = [];
    }
    acc[academicYear].push(row);
    return acc;
  }, {});

  // Add a sheet for each Academic Year
  Object.keys(groupedByYear).forEach(year => {
    const yearSheet = workbook.addWorksheet(year);
    addSheetContent(yearSheet, groupedByYear[year], columns, year);
  });

  // Write the workbook and trigger download
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'FacultyFRS_Scores.xlsx');
  });
};

const addSheetContent = (worksheet, rows, columns, sheetTitle) => {
  // Add a title row
  worksheet.mergeCells('A1:H1'); // Adjust if more columns
  const titleRow = worksheet.getCell('A1');
  titleRow.value = sheetTitle;
  titleRow.font = { size: 14, bold: true };
  titleRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Define header style
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E88E5' } },
    alignment: { vertical: 'middle', horizontal: 'center' },
  };

  // Adjust column widths based on content
  worksheet.columns = columns.map(col => ({
    header: col.headerName,
    key: col.field,
    width: col.field === 'reason' ? Math.max(...rows.map(row => row[col.field]?.length || 0), col.width / 10) : col.width / 10, // Adjust width for Reason column based on content
    style: {
      alignment: { vertical: 'middle', horizontal: 'center' },
    },
  }));

  // Insert an additional row for headers
  worksheet.addRow(); // This adds a blank row for spacing after the title row

  // Apply header style and insert headers below the title row
  worksheet.getRow(2).values = columns.map(col => col.headerName); // Set header names
  worksheet.getRow(2).eachCell((cell) => {
    cell.style = headerStyle;
  });

  // Add rows (starting from the third row)
  rows.forEach(row => {
    worksheet.addRow(row);
  });

  // Apply styles to data rows
  worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    if (rowNumber > 2) { // Skip title and header row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }
  });

  // Add conditional formatting for FRS Score
  worksheet.getColumn('frsScore').eachCell((cell, rowNumber) => {
    if (rowNumber > 2) { // Skip title and header row
      const frsScore = parseFloat(cell.value);
      cell.font = {
        color: { argb: frsScore > 0 ? 'FF008000' : 'FFFF0000' },
      };
    }
  });
};