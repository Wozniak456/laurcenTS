'use client'

import React from 'react';
import ExcelJS, { CellValue } from 'exceljs';
import { Button } from '@nextui-org/react';

type FetchingInfo = {
    locationName: string,
    locationId: number,
    commercialFishingAmount: number,
    commercialFishingWeight: number,
    sortedAmount: number,
    sortedWeight: number,
    growOutAmount: number,
    growOutWeight: number,
    moreThan500Amount: number,
    moreThan500Weight: number,
    lessThan500Amount: number,
    lessThan500Weight: number,
    weekNum: number
}

type ExportButtonProps = {
    summary: FetchingInfo[]
};

const sectionColor = 'c7c7c7';
const lineColor = 'e0e0e0';
const cellColor = 'ffffff';
const summaryColor = 'd9e1f2'; 

export default function ExportButton({summary} : ExportButtonProps){
    
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


    let headerValues: CellValue[] = [
        "№ басейну", 
        "Товарна", 
        "кг",
        "сер. вага",
        "Відсортована",
        "кг",
        "сер. вага",
        "Доріст",
        "кг",
        "сер. вага",
        "500+",
        "кг",
        "сер. вага",
        "-500",
        "кг",
        "сер. вага"]; // Масив для зберігання значень заголовка

    const dateRow = worksheet.addRow([`Тиждень ${summary[0].weekNum}`]);

    dateRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.style.font = headerStyle.font;
        cell.style.fill = headerStyle.fill as ExcelJS.Fill;
        cell.style.border = headerStyle.border as ExcelJS.Borders;
        cell.style.alignment = headerStyle.alignment as ExcelJS.Alignment;
    });

    worksheet.mergeCells(dateRow.number, 1, dateRow.number, 16);

    let headerRow = worksheet.addRow(headerValues);
    
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.style.font = headerStyle.font;
        cell.style.fill = headerStyle.fill as ExcelJS.Fill;
        cell.style.border = headerStyle.border as ExcelJS.Borders;
        cell.style.alignment = headerStyle.alignment as ExcelJS.Alignment;
    });

    summary.forEach((pool) => {
        const poolValues  = [
            pool.locationName,
            pool.commercialFishingAmount,
            pool.commercialFishingWeight,
            pool.commercialFishingAmount > 0 ? pool.commercialFishingWeight / pool.commercialFishingAmount : 0,
    
            pool.sortedAmount,
            pool.sortedWeight,
            pool.sortedAmount > 0 ? pool.sortedWeight / pool.sortedAmount : 0,

            pool.growOutAmount,
            pool.growOutWeight,
            pool.growOutAmount > 0 ? pool.growOutWeight / pool.growOutAmount : 0,

            pool.moreThan500Amount,
            pool.moreThan500Weight,
            pool.moreThan500Amount > 0 ? pool.moreThan500Weight / pool.moreThan500Amount : 0,

            pool.lessThan500Amount,
            pool.lessThan500Weight,
            pool.lessThan500Amount > 0 ? pool.lessThan500Weight / pool.lessThan500Amount : 0,
        ];

        const poolRow = worksheet.addRow(poolValues );

        poolRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.style.font = { bold: true, size: 10 };
            cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sectionColor } } as ExcelJS.Fill; 
            cell.style.border = cellStyle.border as ExcelJS.Borders;
            cell.style.alignment = cellStyle.alignment as ExcelJS.Alignment; 
        });
    })

//     //     let currentRowNumber = 2; 

//     //     const batchQuantities: { [batchName: string]: number } = {};

//         props.lines.forEach((line) => {
//             const lineRow = worksheet.addRow([line.name]);

//             worksheet.mergeCells(lineRow.number, 1, lineRow.number, 13);

//             lineRow.eachCell({ includeEmpty: true }, (cell) => {
//                 cell.style.font = { bold: true, size: 10 };
//                 cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sectionColor } } as ExcelJS.Fill; 
//                 cell.style.border = cellStyle.border as ExcelJS.Borders;
//                 cell.style.alignment = cellStyle.alignment as ExcelJS.Alignment; 
//             });

        

//             line.pools.forEach((pool) => {
//                 // const poolRow = worksheet.addRow([pool.name]); 
                

//                 const poolItems = props.data.filter(poolItem => poolItem.poolId === pool.id);
//                 const poolItem = poolItems[0]
                
//                 const firstRowValues  = [
//                     pool.name,
//                     poolItem?.feedType,
//                     poolItem?.feedName,
//                     poolItem?.feeding6,
//                     poolItem?.editing6 ?? '',
//                     poolItem?.feeding10,
//                     poolItem?.editing10 ?? '',
//                     poolItem?.feeding14,
//                     poolItem?.editing14 ?? '',
//                     poolItem?.feeding18,
//                     poolItem?.editing18 ?? '',
//                     poolItem?.feeding22,
//                     poolItem?.editing22 ?? '',
//                 ];

//                 const firstRow = worksheet.addRow(firstRowValues );

//                 firstRow.eachCell({ includeEmpty: true }, (cell) => {
//                     cell.style.font = { bold: true, size: 10 };
//                     cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellColor } } as ExcelJS.Fill; 
//                     cell.style.border = cellStyle.border as ExcelJS.Borders;
//                     cell.style.alignment = cellStyle.alignment as ExcelJS.Alignment; 
//                 });

//                 if (poolItem?.rowCount == 2){
//                     const poolItem = poolItems[1]

//                     const secondRowValues   = [
//                         '',
//                         poolItem?.feedType,
//                         poolItem?.feedName,
//                         poolItem?.feeding6,
//                         poolItem?.editing6 ?? '',
//                         poolItem?.feeding10,
//                         poolItem?.editing10 ?? '',
//                         poolItem?.feeding14,
//                         poolItem?.editing14 ?? '',
//                         poolItem?.feeding18,
//                         poolItem?.editing18 ?? '',
//                         poolItem?.feeding22,
//                         poolItem?.editing22 ?? '',
//                     ];

//                     const secondRow = worksheet.addRow(secondRowValues );

//                     secondRow.eachCell({ includeEmpty: true }, (cell) => {
//                         cell.style.font = { bold: true, size: 10 };
//                         cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellColor } } as ExcelJS.Fill; 
//                         cell.style.border = cellStyle.border as ExcelJS.Borders;
//                         cell.style.alignment = cellStyle.alignment as ExcelJS.Alignment; 
//                     });

//                     worksheet.mergeCells(firstRow.number, 1, secondRow.number, 1);
//                 }

//             })
// })

        worksheet.pageSetup = {
            paperSize: 9, 
            orientation: 'portrait', 
            fitToPage: true,
            fitToWidth: 1, 
            fitToHeight: 2,
        };

        
        worksheet.columns = [
            { width: 12 }, 
            { width: 12 }, 
            { width: 20 }, 
            { width: 8 }, 
            { width: 12 }, 
            { width: 8 }, 
            { width: 12 }, 
            { width: 8 }, 
            { width: 12 },
            { width: 8 }, 
            { width: 12 },
            { width: 8 }, 
            { width: 12 }
        ];

        worksheet.views = [{ 
            state: 'frozen', 
            ySplit: 2 
        }];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fetching.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className=''>
            <Button onClick={handleExport}>Export to Excel</Button>
        </div>
        
    )
    
};
