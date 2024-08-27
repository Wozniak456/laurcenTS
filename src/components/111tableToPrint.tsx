'use client'

import React from 'react';
import ExcelJS from 'exceljs';
import { Button } from '@nextui-org/react';

export type DataItem = {
    poolName: string;
    batchName?: string;
    quantity?: number;
    planWeight?: number;
    factWeight?: number;
    feed?: string;
    // updated?: string;
};

type ExportButtonProps = {
    date: string;
    sections: { sectionName: string; lines: { lineName: string; pools: DataItem[] }[] }[];
};

const sectionColor = 'c7c7c7';
const lineColor = 'e0e0e0';
const cellColor = 'f0f0f0';
const summaryColor = 'd9e1f2'; // Adjusted color for better visibility

const ExportButton: React.FC<ExportButtonProps> = ({ date, sections }) => {
    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // Define styles
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
            alignment: { horizontal: 'center', vertical: 'middle' } // Center alignment
        };

        const summaryStyle = {
            font: { bold: true, size: 10 },
            fill: { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: summaryColor } 
            },
            // border: { 
            //     top: { style: 'thin', color: { argb: '000000' } },
            //     left: { style: 'thin', color: { argb: '000000' } },
            //     bottom: { style: 'thin', color: { argb: '000000' } },
            //     right: { style: 'thin', color: { argb: '000000' } }
            // },
            alignment: { horizontal: 'center', vertical: 'middle' } // Center alignment
        };

        const cellStyle = {
            font: { size: 8 },
            border: { 
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            },
            alignment: { horizontal: 'center', vertical: 'middle' } // Center alignment
        };

        // Add headers
        const headerRow = worksheet.addRow([
            "Дата", "Басейн", "Партія", "К-ть", "Вага План", "Вага Факт", "Корм"
        ]);
        headerRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.style.font = headerStyle.font;
            cell.style.fill = headerStyle.fill as ExcelJS.Fill;
            cell.style.border = headerStyle.border as ExcelJS.Borders;
            cell.style.alignment = headerStyle.alignment as ExcelJS.Alignment; // Set alignment
        });

        let currentRowNumber = 2; // Start from the second row, where the data starts

        // Object to accumulate quantities by batchName
        const batchQuantities: { [batchName: string]: number } = {};

        // Add data for each section
        sections.forEach((section) => {
            // Add section name and merge cells across all columns
            const sectionRow = worksheet.addRow([date, section.sectionName]);
            worksheet.mergeCells(sectionRow.number, 2, sectionRow.number, 7); // Merge cells from 2nd to 7th column
            sectionRow.eachCell({ includeEmpty: true }, (cell) => {
                cell.style.font = { bold: true, size: 10 };
                cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sectionColor } } as ExcelJS.Fill; // Light gray background
                cell.style.border = cellStyle.border as ExcelJS.Borders;
                cell.style.alignment = cellStyle.alignment as ExcelJS.Alignment; // Set alignment
            });

            section.lines.forEach((line) => {
                // Add line name and merge cells across all columns
                const lineRow = worksheet.addRow(['', line.lineName]);
                worksheet.mergeCells(lineRow.number, 2, lineRow.number, 7); // Merge cells from 2nd to 7th column
                lineRow.eachCell({ includeEmpty: true }, (cell) => {
                    cell.style.font = { bold: true, size: 10 };
                    cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lineColor } } as ExcelJS.Fill; // Slightly darker gray background
                    cell.style.border = cellStyle.border as ExcelJS.Borders;
                    cell.style.alignment = cellStyle.alignment as ExcelJS.Alignment; // Set alignment
                });

                const totalQuantity = line.pools.reduce((sum, pool) => sum + (pool.quantity || 0), 0);

                line.pools.forEach((pool) => {
                    const row = worksheet.addRow([
                        date,
                        pool.poolName,
                        pool.batchName,
                        pool.quantity,
                        pool.planWeight,
                        pool.factWeight,
                        pool.feed,
                        // pool.updated
                    ]);

                    row.eachCell({ includeEmpty: true }, (cell) => {
                        cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellColor } } as ExcelJS.Fill; // Slightly darker gray background
                        cell.style.border = cellStyle.border as ExcelJS.Borders;
                        cell.style.alignment = cellStyle.alignment as ExcelJS.Alignment; // Set alignment
                    });

                    // Accumulate quantities by batchName
                    if (pool.batchName) {
                        if (!batchQuantities[pool.batchName]) {
                            batchQuantities[pool.batchName] = 0;
                        }
                        batchQuantities[pool.batchName] += pool.quantity || 0;
                    }
                });

                // Add summary row with total quantity for the line
                const summaryRow = worksheet.addRow(['', 'Заг. к-ть по лінії', '', totalQuantity, '','','']);
                worksheet.mergeCells(summaryRow.number, 2, summaryRow.number, 3); // Merge cells from 2nd to 3rd column
                summaryRow.eachCell({ includeEmpty: true }, (cell) => {
                    cell.style.font = summaryStyle.font;
                    cell.style.fill = summaryStyle.fill as ExcelJS.Fill;
                    // cell.style.border = summaryStyle.border as ExcelJS.Borders;
                    cell.style.alignment = summaryStyle.alignment as ExcelJS.Alignment; // Set alignment
                });

                currentRowNumber += line.pools.length + 1; // Update currentRowNumber based on rows added
            });

            currentRowNumber++; // Update currentRowNumber after each section
        });

        // Add overall summary for all batches
        worksheet.addRow([]); // Empty row before summary
        const overallSummaryRow = worksheet.addRow(['', 'Заг. к-ть по партіям', '', '', '', '', '']);
        worksheet.mergeCells(overallSummaryRow.number, 2, overallSummaryRow.number, 7); // Merge cells from 2nd to 7th column
        overallSummaryRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.style.font = summaryStyle.font;
            cell.style.fill = summaryStyle.fill as ExcelJS.Fill;
            // cell.style.border = summaryStyle.border as ExcelJS.Borders;
            cell.style.alignment = summaryStyle.alignment as ExcelJS.Alignment; // Set alignment
        });
        
        worksheet.mergeCells(2, 1, 119, 1);

        Object.entries(batchQuantities).forEach(([batchName, totalQuantity]) => {
            worksheet.addRow(['', '', batchName, totalQuantity]);
        });

        // Page Setup for A4 and Fit to Two Pages
        worksheet.pageSetup = {
            paperSize: 9, // A4 paper size
            orientation: 'portrait', // Adjust orientation if needed (portrait or landscape)
            fitToPage: true,
            fitToWidth: 1, // Fit to one column width
            fitToHeight: 2, // Fit to two page heights
        };

        
        // Set column widths
        worksheet.columns = [
            { width: 10 }, // Adjust width for the new "Дата" column
            { width: 8 }, 
            { width: 12 }, 
            { width: 8 }, 
            { width: 10 }, 
            { width: 10 }, 
            { width: 6 }
        ];

        // Freeze the top row
        worksheet.views = [{ 
            state: 'frozen', 
            ySplit: 1 // Freeze the row with the headers
        }];

        // Write the workbook to a file and prompt the download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${date}_111.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className=''>
            <Button onClick={handleExport}>Export to Excel</Button>
        </div>
        
    )
    
};

export default ExportButton;
