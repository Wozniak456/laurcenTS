'use client'

import React from 'react';
import ExcelJS, { CellValue } from 'exceljs';
import { Button } from '@nextui-org/react';

// export type DataItem = {
//     poolName: string;
//     batchName?: string;
//     quantity?: number;
//     planWeight?: number;
//     factWeight?: number;
//     feed?: string;
//     // updated?: string;
// };

interface feedingInfo{
    date: string,
    
}

type ExportButtonProps = {
    
};

const sectionColor = 'c7c7c7';
const lineColor = 'e0e0e0';
const cellColor = 'ffffff';
const summaryColor = 'd9e1f2'; 

export default function ExportButton(props : ExportButtonProps){
    
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
            alignment: {wrapText: true, horizontal: 'center', vertical: 'middle' } 
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


    let firstHeaderValues: CellValue[] = [
        "Залишок на початок місяця",  // Об'єднано 1-3 колонки
        null,  // Залишаємо порожніми для коректного відображення
        null,  // Залишаємо порожніми для коректного відображення
        "Надходження",  // Об'єднано 4-8 колонки
        null,
        null,
        null,
        null,
        "Всього на складі",  // Об'єднано 9-10 колонки
        null,
        "Використання",  // Об'єднано 11-13 колонки
        null,
        null,
        "Сальдо",  // Об'єднано 14-15 колонки
        null,
        "Підпис"  // Немає об'єднання, лише одна колонка
    ];

    const firstRow = worksheet.addRow(firstHeaderValues)

    worksheet.mergeCells(firstRow.number, 1, firstRow.number, 3);
    worksheet.mergeCells(firstRow.number, 4, firstRow.number, 8);
    worksheet.mergeCells(firstRow.number, 9, firstRow.number, 10);
    worksheet.mergeCells(firstRow.number, 11, firstRow.number, 13);
    worksheet.mergeCells(firstRow.number, 14, firstRow.number, 15);

    let secondHeaderValues: CellValue[] = [
        "Кількість",  // Об'єднано 1-3 колонки
        // null,  
        null,  // Залишаємо порожніми для коректного відображення
        "Термін придатності",  // Об'єднано 4-8 колонки
        "Дата",
        "Кількість",
        null,
        "Термін придатності",
        "№ партії",
        "Кількість",
        null,
        "Дата",
        "Кількість",
        null,
        "Кількість",
        null,
        null
    ];

    const secondRow = worksheet.addRow(secondHeaderValues)

    worksheet.mergeCells(secondRow.number, 1, secondRow.number, 2);
    worksheet.mergeCells(secondRow.number, 5, secondRow.number, 6);
    worksheet.mergeCells(secondRow.number, 9, secondRow.number, 10);
    worksheet.mergeCells(secondRow.number, 12, secondRow.number, 13);
    worksheet.mergeCells(secondRow.number, 14, secondRow.number, 15);

    

    let thirdHeaderValues: CellValue[] = [
        "Мішки",  // Об'єднано 1-3 колонки
        "кг",  
        null,  
        null,
        "Мішки",  // Об'єднано 1-3 колонки
        "кг",
        null,  
        null,
        "Мішки",  // Об'єднано 1-3 колонки
        "кг",
        null,
        "Мішки",  // Об'єднано 1-3 колонки
        "кг",
        "Мішки",  // Об'єднано 1-3 колонки
        "кг",
    ];

    const thirdRow = worksheet.addRow(thirdHeaderValues)

    worksheet.mergeCells(secondRow.number, 3, thirdRow.number, 3);
    worksheet.mergeCells(secondRow.number, 4, thirdRow.number, 4);
    worksheet.mergeCells(secondRow.number, 7, thirdRow.number, 7);
    worksheet.mergeCells(secondRow.number, 8, thirdRow.number, 8);
    worksheet.mergeCells(secondRow.number, 11, thirdRow.number, 11);
    worksheet.mergeCells(firstRow.number, 16, thirdRow.number, 16);

    firstRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.style.font = headerStyle.font;
        cell.style.fill = headerStyle.fill as ExcelJS.Fill;
        cell.style.border = headerStyle.border as ExcelJS.Borders;
        cell.style.alignment = headerStyle.alignment as ExcelJS.Alignment;
    });

    secondRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.style.font = headerStyle.font;
        cell.style.fill = headerStyle.fill as ExcelJS.Fill;
        cell.style.border = headerStyle.border as ExcelJS.Borders;
        cell.style.alignment = headerStyle.alignment as ExcelJS.Alignment;
    });

    thirdRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.style.font = headerStyle.font;
        cell.style.fill = headerStyle.fill as ExcelJS.Fill;
        cell.style.border = headerStyle.border as ExcelJS.Borders;
        cell.style.alignment = headerStyle.alignment as ExcelJS.Alignment;
    });

//     props.times.forEach(time => {
//         headerValues.push(time.time);  // Додаємо час до масиву значень заголовка
//         headerValues.push('Коригування');  // Додаємо текст "Коригування" до масиву значень заголовка
//     });

//     const dateRow = worksheet.addRow([props.data[0].date]);

//     dateRow.eachCell({ includeEmpty: true }, (cell) => {
//         cell.style.font = headerStyle.font;
//         cell.style.fill = headerStyle.fill as ExcelJS.Fill;
//         cell.style.border = headerStyle.border as ExcelJS.Borders;
//         cell.style.alignment = headerStyle.alignment as ExcelJS.Alignment;
//     });

//     worksheet.mergeCells(dateRow.number, 1, dateRow.number, 13);

//     let headerRow = worksheet.addRow(headerValues);
    
//         headerRow.eachCell({ includeEmpty: true }, (cell) => {
//             cell.style.font = headerStyle.font;
//             cell.style.fill = headerStyle.fill as ExcelJS.Fill;
//             cell.style.border = headerStyle.border as ExcelJS.Borders;
//             cell.style.alignment = headerStyle.alignment as ExcelJS.Alignment;
//         });

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
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 }
        ];

        worksheet.views = [{ 
            state: 'frozen', 
            ySplit: 3 
        }];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leftovers.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className=''>
            <Button onClick={handleExport}>Export to Excel</Button>
        </div>
        
    )
    
};
