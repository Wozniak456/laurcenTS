"use client";

import React from "react";
import ExcelJS, { CellValue } from "exceljs";
import { Button } from "@nextui-org/react";

type FetchingInfo = {
  locationName: string;
  locationId: number;
  commercialFishingAmount: number;
  commercialFishingWeight: number;
  sortedAmount: number;
  sortedWeight: number;
  growOutAmount: number;
  growOutWeight: number;
  moreThan500Amount: number;
  moreThan500Weight: number;
  lessThan500Amount: number;
  lessThan500Weight: number;
  weekNum: number;
  weekPeriod?: string;
};

type ExportButtonProps = {
  summary: FetchingInfo[];
};

const sectionColor = "c7c7c7";
const lineColor = "e0e0e0";
const cellColor = "ffffff";
const summaryColor = "d9e1f2";

export default function ExportButton({ summary }: ExportButtonProps) {
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 10 },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "ffffff" },
      },
      border: {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      alignment: { horizontal: "center", vertical: "middle" },
    };

    const cellStyle: Partial<ExcelJS.Style> = {
      font: { size: 8 },
      border: {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      alignment: { horizontal: "center", vertical: "middle" },
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
      "сер. вага",
    ];

    // Add week number and period
    const weekRow = worksheet.addRow([`Тиждень ${summary[0].weekNum}`]);
    weekRow.font = { bold: true, size: 12 };
    worksheet.mergeCells(weekRow.number, 1, weekRow.number, 16);
    weekRow.alignment = { horizontal: "center" as const };

    if (summary[0].weekPeriod) {
      const periodRow = worksheet.addRow([`Період: ${summary[0].weekPeriod}`]);
      periodRow.font = { size: 10, color: { argb: "666666" } };
      worksheet.mergeCells(periodRow.number, 1, periodRow.number, 16);
      periodRow.alignment = { horizontal: "center" as const };
    }

    // Add empty row for spacing
    worksheet.addRow([]);

    // Add header row
    const headerRow = worksheet.addRow(headerValues);
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.style = headerStyle;
    });

    // Add data rows
    summary.forEach((info) => {
      const rowValues = [
        info.locationName,
        info.commercialFishingAmount,
        info.commercialFishingWeight,
        info.commercialFishingAmount !== 0
          ? (
              info.commercialFishingWeight / info.commercialFishingAmount
            ).toFixed(1)
          : "0",
        info.sortedAmount,
        info.sortedWeight,
        info.sortedAmount !== 0
          ? (info.sortedWeight / info.sortedAmount).toFixed(1)
          : "0",
        info.growOutAmount,
        info.growOutWeight,
        info.growOutAmount !== 0
          ? (info.growOutWeight / info.growOutAmount).toFixed(1)
          : "0",
        info.moreThan500Amount,
        info.moreThan500Weight,
        info.moreThan500Amount !== 0
          ? (info.moreThan500Weight / info.moreThan500Amount).toFixed(1)
          : "0",
        info.lessThan500Amount,
        info.lessThan500Weight,
        info.lessThan500Amount !== 0
          ? (info.lessThan500Weight / info.lessThan500Amount).toFixed(1)
          : "0",
      ];

      const row = worksheet.addRow(rowValues);
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.style = cellStyle;
        // Add blue background to specific columns
        if ([2, 3, 4, 8, 9, 10, 14, 15, 16].includes(colNumber)) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "f0f8ff" },
          };
        }
      });
    });

    // Adjust column widths
    worksheet.columns.forEach((column) => {
      column.width = 12;
    });

    worksheet.pageSetup = {
      orientation: "landscape",
      paperSize: 9,
      fitToPage: true,
    };

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Вилов_тиждень_${summary[0].weekNum}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button color="primary" variant="ghost" onPress={handleExport}>
      Експорт в Excel
    </Button>
  );
}
