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
    poolId: number,
    rowCount?: number
    feedType?: string,
    feedName?: string,
    feeding6?: string,
    editing6: string,
    feeding10?: string,
    editing10: string,
    feeding14?: string,
    editing14: string,
    feeding18?: string,
    editing18: string,
    feeding22?: string,
    editing22: string,
}

type ExportButtonProps = {
    times: {
        id: number;
        time: string;
    }[],
    lines: {
        name: string;
        id: number;
        pools: {
            name: string;
            id: number;
            locations: {
                name: string;
                id: number;
            }[];
        }[];
    }[],
    data: feedingInfo[]
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
            alignment: { horizontal: 'center', vertical: 'middle' } 
        };

    //     const summaryStyle = {
    //         font: { bold: true, size: 10 },
    //         fill: { 
    //             type: 'pattern', 
    //             pattern: 'solid', 
    //             fgColor: { argb: summaryColor } 
    //         },
    //         alignment: { horizontal: 'center', vertical: 'middle' } 
    //     };

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


    let headerValues: CellValue[] = ["№ басейну", "Вид корму", "Назва корму"]; // Масив для зберігання значень заголовка

    props.times.forEach(time => {
        headerValues.push(time.time);  // Додаємо час до масиву значень заголовка
        headerValues.push('Коригування');  // Додаємо текст "Коригування" до масиву значень заголовка
    });

    console.log(props.data[0].date)

    const dateRow = worksheet.addRow([props.data[0].date]);

    dateRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.style.font = headerStyle.font;
        cell.style.fill = headerStyle.fill as ExcelJS.Fill;
        cell.style.border = headerStyle.border as ExcelJS.Borders;
        cell.style.alignment = headerStyle.alignment as ExcelJS.Alignment;
    });

    worksheet.mergeCells(dateRow.number, 1, dateRow.number, 13);

    let headerRow = worksheet.addRow(headerValues);
    
        headerRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.style.font = headerStyle.font;
            cell.style.fill = headerStyle.fill as ExcelJS.Fill;
            cell.style.border = headerStyle.border as ExcelJS.Borders;
            cell.style.alignment = headerStyle.alignment as ExcelJS.Alignment;
        });

    //     let currentRowNumber = 2; 

    //     const batchQuantities: { [batchName: string]: number } = {};

        props.lines.forEach((line) => {
            const lineRow = worksheet.addRow([line.name]);

            worksheet.mergeCells(lineRow.number, 1, lineRow.number, 13);

            lineRow.eachCell({ includeEmpty: true }, (cell) => {
                cell.style.font = { bold: true, size: 10 };
                cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sectionColor } } as ExcelJS.Fill; 
                cell.style.border = cellStyle.border as ExcelJS.Borders;
                cell.style.alignment = cellStyle.alignment as ExcelJS.Alignment; 
            });

        

            line.pools.forEach((pool) => {
                // const poolRow = worksheet.addRow([pool.name]); 
                

                const poolItems = props.data.filter(poolItem => poolItem.poolId === pool.id);
                const poolItem = poolItems[0]
                
                const firstRowValues  = [
                    pool.name,
                    poolItem?.feedType,
                    poolItem?.feedName,
                    poolItem?.feeding6,
                    poolItem?.editing6 ?? '',
                    poolItem?.feeding10,
                    poolItem?.editing10 ?? '',
                    poolItem?.feeding14,
                    poolItem?.editing14 ?? '',
                    poolItem?.feeding18,
                    poolItem?.editing18 ?? '',
                    poolItem?.feeding22,
                    poolItem?.editing22 ?? '',
                ];

                const firstRow = worksheet.addRow(firstRowValues );

                firstRow.eachCell({ includeEmpty: true }, (cell) => {
                    cell.style.font = { bold: true, size: 10 };
                    cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellColor } } as ExcelJS.Fill; 
                    cell.style.border = cellStyle.border as ExcelJS.Borders;
                    cell.style.alignment = cellStyle.alignment as ExcelJS.Alignment; 
                });

                if (poolItem?.rowCount == 2){
                    const poolItem = poolItems[1]

                    const secondRowValues   = [
                        '',
                        poolItem?.feedType,
                        poolItem?.feedName,
                        poolItem?.feeding6,
                        poolItem?.editing6 ?? '',
                        poolItem?.feeding10,
                        poolItem?.editing10 ?? '',
                        poolItem?.feeding14,
                        poolItem?.editing14 ?? '',
                        poolItem?.feeding18,
                        poolItem?.editing18 ?? '',
                        poolItem?.feeding22,
                        poolItem?.editing22 ?? '',
                    ];

                    const secondRow = worksheet.addRow(secondRowValues );

                    secondRow.eachCell({ includeEmpty: true }, (cell) => {
                        cell.style.font = { bold: true, size: 10 };
                        cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellColor } } as ExcelJS.Fill; 
                        cell.style.border = cellStyle.border as ExcelJS.Borders;
                        cell.style.alignment = cellStyle.alignment as ExcelJS.Alignment; 
                    });

                    worksheet.mergeCells(firstRow.number, 1, secondRow.number, 1);
                }

                // console.log(rowValues)
                


            })
})
    //             const totalQuantity = line.pools.reduce((sum, pool) => sum + (pool.quantity || 0), 0);

    

    //                 row.eachCell({ includeEmpty: true }, (cell) => {
    //                     cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellColor } } as ExcelJS.Fill; 
    //                     cell.style.border = cellStyle.border as ExcelJS.Borders;
    //                     cell.style.alignment = cellStyle.alignment as ExcelJS.Alignment; 
    //                 });

    //                 if (pool.batchName) {
    //                     if (!batchQuantities[pool.batchName]) {
    //                         batchQuantities[pool.batchName] = 0;
    //                     }
    //                     batchQuantities[pool.batchName] += pool.quantity || 0;
    //                 }
    //             });

    //             const summaryRow = worksheet.addRow(['', 'Заг. к-ть по лінії', '', totalQuantity, '','','']);
    //             worksheet.mergeCells(summaryRow.number, 2, summaryRow.number, 3); 
    //             summaryRow.eachCell({ includeEmpty: true }, (cell) => {
    //                 cell.style.font = summaryStyle.font;
    //                 cell.style.fill = summaryStyle.fill as ExcelJS.Fill;
                    
    //                 cell.style.alignment = summaryStyle.alignment as ExcelJS.Alignment; 
    //             });

    //             currentRowNumber += line.pools.length + 1; 
    //         });

    //         currentRowNumber++;
    //     });

    //     worksheet.addRow([]); 
    //     const overallSummaryRow = worksheet.addRow(['', 'Заг. к-ть по партіям', '', '', '', '', '']);
    //     worksheet.mergeCells(overallSummaryRow.number, 2, overallSummaryRow.number, 7); 
    //     overallSummaryRow.eachCell({ includeEmpty: true }, (cell) => {
    //         cell.style.font = summaryStyle.font;
    //         cell.style.fill = summaryStyle.fill as ExcelJS.Fill;
    //         cell.style.alignment = summaryStyle.alignment as ExcelJS.Alignment; 
    //     });
        
    //     worksheet.mergeCells(2, 1, 119, 1);

    //     Object.entries(batchQuantities).forEach(([batchName, totalQuantity]) => {
    //         worksheet.addRow(['', '', batchName, totalQuantity]);
    //     });

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
        a.download = `day-feeding.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className=''>
            <Button onClick={handleExport}>Export to Excel</Button>
        </div>
        
    )
    
};
