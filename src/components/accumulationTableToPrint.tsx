'use client'

import React from 'react';
import ExcelJS, { CellValue } from 'exceljs';
import { Button } from '@nextui-org/react';

type ExportButtonProps = {
    columns: {
        key: string;
        label: string;
    }[],
    rows: RowData[]
};

type RowData = {
    key: string;
    location_id: string;
    location_name: string;
    total: number;
    [key: string]: string | number;
  };

const sectionColor = 'c7c7c7';
const lineColor = 'e0e0e0';
const cellColor = 'ffffff';
const summaryColor = 'd9e1f2'; 

export default function ExportButton({columns, rows} : ExportButtonProps){
    
    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        
        const headerStyle = {
            font: { bold: true, size: 10 },
            fill: { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: 'ffffff' } 
            }, 
            border: { 
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            },
            alignment: { horizontal: 'center', vertical: 'middle' } 
        };


        const cellStyle = {
            font: { size: 8 },
            border: { 
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            },
            alignment: { horizontal: 'center', vertical: 'middle' } 
        };


        let headerValues: CellValue[] = ["№ басейну"];

        columns.slice(1).map(column => (
            headerValues.push(column.label)
        ));
        

        let headerRow = worksheet.addRow(headerValues);
        
        headerRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.style.font = headerStyle.font;
            cell.style.fill = headerStyle.fill as ExcelJS.Fill;
            cell.style.border = headerStyle.border as ExcelJS.Borders;
            cell.style.alignment = {
                ...headerStyle.alignment as ExcelJS.Alignment,
                wrapText: true // Додаємо цю властивість для переносу тексту
            };
        });

        const firstRowValues = rows.map((row) =>
            columns.map((column) => row[column.key])
        );
        
        firstRowValues.forEach((rowValues) => {
            const value = worksheet.addRow(rowValues);

            value.eachCell({ includeEmpty: true }, (cell) => {
                cell.style.font = { bold: true, size: 10 };
                cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellColor } } as ExcelJS.Fill; 
                cell.style.border = cellStyle.border as ExcelJS.Borders;
                cell.style.alignment = cellStyle.alignment as ExcelJS.Alignment; 
            });

        });


        worksheet.pageSetup = {
            paperSize: 9, 
            orientation: 'landscape', 
            fitToPage: true,
            fitToWidth: 1, 
            fitToHeight: 2,
        };

        const collWidth = 10; 

        worksheet.columns = Array(18).fill({ width: collWidth });

        worksheet.views = [{ 
            state: 'frozen', 
            ySplit: 2 
        }];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accumulation.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className=''>
            <Button onClick={handleExport}>Export to Excel</Button>
        </div>
        
    )
    
};
