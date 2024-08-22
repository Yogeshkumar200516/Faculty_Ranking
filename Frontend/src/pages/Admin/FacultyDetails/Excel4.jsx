import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const downloadExcel = (rows, columns, facultyId, facultyName, department, totalPositiveUpdates, totalNegativeUpdates, totalFRS) => {
    const workbook = new ExcelJS.Workbook();
    const mainSheet = workbook.addWorksheet('Faculty FRS Overview');

    addSheetContent(mainSheet, rows, columns, 'Faculty FRS Overview', facultyId, facultyName, department, totalPositiveUpdates, totalNegativeUpdates, totalFRS);


    const groupedByVertical = rows.reduce((acc, row) => {
        const { vertical } = row;
        if (!acc[vertical]) {
            acc[vertical] = [];
        }
        acc[vertical].push(row);
        return acc;
    }, {});
    Object.keys(groupedByVertical).forEach(vertical => {
        const verticalSheet = workbook.addWorksheet(vertical);
        const verticalRows = groupedByVertical[vertical];
        const positiveUpdates = verticalRows.filter(row => row.updatedFRS > 0).length;
        const negativeUpdates = verticalRows.filter(row => row.updatedFRS < 0).length;
        const totalFRS = verticalRows.reduce((sum, row) => sum + (row.updatedFRS || 0), 0);

        addSheetContent(verticalSheet, verticalRows, columns, vertical, facultyId, facultyName, department, positiveUpdates, negativeUpdates, totalFRS);
    });

    // Generate and download the Excel file
    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'Faculty_FRS_Overview.xlsx');
    }).catch((error) => {
        console.error('Error writing Excel file:', error);
        alert('Failed to generate Excel file. Please try again.');
    });
};

const addSheetContent = (worksheet, rows, columns, sheetTitle, facultyId, facultyName, department, totalPositiveUpdates, totalNegativeUpdates, totalFRS) => {
   
    const filteredColumns = columns.filter(col => col.headerName !== 'S.No' && col.field !== 'S.No');

    worksheet.columns = [
        { header: 'S. No', key: 'sno', width: 8, style: { alignment: { vertical: 'middle', horizontal: 'center' } } },
        ...filteredColumns.map(col => ({
            header: col.headerName || col.field,
            key: col.field,
            width: col.field === 'reason' ? Math.max(...rows.map(row => row[col.field]?.length || 0), col.width / 10) : col.width / 10,
            style: { alignment: { vertical: 'middle', horizontal: 'center' } },
        }))
    ];

    // Add and style the title row
    worksheet.mergeCells(1, 1, 1, filteredColumns.length + 1); // Adjusted to include S. No column
    worksheet.mergeCells(2, 1, 2, filteredColumns.length + 1);
    worksheet.mergeCells(3, 1, 3, filteredColumns.length + 1);

    worksheet.getCell('A1').value = sheetTitle;
    worksheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E88E5' },
    };

    // Faculty information row
    worksheet.getCell('A2').value = `${facultyName} - ${facultyId} - ${department}`;
    worksheet.getCell('A2').font = { size: 12, bold: true , color: { argb: 'FFFFFFFF' } };
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E88E5' } };

    // Add row for Positive, Negative, and Total FRS counts
    worksheet.getCell('A3').value = {
        richText: [
            {
                text: `Positive Updates: ${totalPositiveUpdates}`,
                font: { bold: true, color: { argb: 'FF008000' } }, // Green for positive updates
            },
          
            {
                text: `            Negative Updates: ${totalNegativeUpdates}`,
                font: { bold: true, color: { argb: 'FFFF0000' } }, // Red for negative updates
            },
        // Space separator
            {
                text: `            Total FRS: ${totalFRS}`,
                font: { bold: true, color: { argb: 'FF0000FF' } }, // Blue for total FRS
            }
        ]
    };
    
    
    worksheet.getCell('A3').font = { size: 12, bold: true };
    worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    worksheet.getRow(4).values = ['S. No', ...filteredColumns.map(col => col.headerName)];
    worksheet.getRow(4).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FFB0BEC5' } },
            left: { style: 'thin', color: { argb: 'FFB0BEC5' } },
            bottom: { style: 'thin', color: { argb: 'FFB0BEC5' } },
            right: { style: 'thin', color: { argb: 'FFB0BEC5' } },
        };
    });

    rows.forEach((row, index) => {
        const rowData = filteredColumns.map(col => 
            col.field !== 'S.No' ? row[col.field] : undefined
        ).filter(value => value !== undefined);
    
        const newRow = worksheet.addRow([index + 1, ...rowData]);
    
        newRow.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFCFD8DC' } },
                left: { style: 'thin', color: { argb: 'FFCFD8DC' } },
                bottom: { style: 'thin', color: { argb: 'FFCFD8DC' } },
                right: { style: 'thin', color: { argb: 'FFCFD8DC' } },
            };
    
            const column = filteredColumns[colNumber - 2];
            if (column) {
                if (column.field === 'updatedFRS') {
                    if (row.updatedFRS > 0) {
                        cell.font = { color: { argb: 'FF008000' } }; 
                    } else if (row.updatedFRS < 0) {
                        cell.font = { color: { argb: 'FFFF0000' } };  
                    }
                } else if (column.field === 'totalFRS') {
                    cell.font = { bold: true };
                }
            }
    
            // Center align the cells by default
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
    });
};
