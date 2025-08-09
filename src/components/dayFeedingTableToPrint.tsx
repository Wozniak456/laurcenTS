"use client";

import React from "react";
import ExcelJS, { CellValue } from "exceljs";
import { Button } from "@nextui-org/react";

// export type DataItem = {
//     poolName: string;
//     batchName?: string;
//     quantity?: number;
//     planWeight?: number;
//     factWeight?: number;
//     feed?: string;
//     // updated?: string;
// };

interface FeedingInfo {
  date: string;
  locId: number;
  rowCount?: number;
  feedings?: Feeding[];
}

interface Feeding {
  feedType: string;
  feedName?: string;
  feedings?: { [time: string]: { feeding?: string; editing?: string } };
}

type ExportButtonProps = {
  times: {
    id: number;
    time: string;
  }[];
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
  }[];
  data: FeedingInfo[];
  percentFeedingMap?: Record<number, number>;
};

const sectionColor = "c7c7c7";
const lineColor = "e0e0e0";
const cellColor = "ffffff";
const summaryColor = "d9e1f2";

// Helper function to calculate feeding quantity with percentage adjustment
const calculateAdjustedQuantity = (
  baseQuantity: string | undefined,
  percentFeeding: number
): string => {
  if (!baseQuantity || baseQuantity === "") return "";
  const base = parseFloat(baseQuantity);
  if (isNaN(base)) return "";
  return (base * (1 + percentFeeding / 100)).toFixed(2);
};

export default function ExportButton(props: ExportButtonProps) {
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    const headerStyle = {
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

    const cellStyle = {
      font: { size: 8 },
      border: {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      },
      alignment: { horizontal: "center", vertical: "middle" },
    };

    let headerValues: CellValue[] = ["№ басейну", "Вид корму", "Назва корму"]; // Масив для зберігання значень заголовка

    props.times.forEach((time) => {
      headerValues.push(time.time); // Додаємо час до масиву значень заголовка
      headerValues.push("Коригування"); // Додаємо текст "Коригування" до масиву значень заголовка
    });

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

    props.lines.forEach((line) => {
      const lineRow = worksheet.addRow([line.name]);

      worksheet.mergeCells(lineRow.number, 1, lineRow.number, 13);

      lineRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.style.font = { bold: true, size: 10 };
        cell.style.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: sectionColor },
        } as ExcelJS.Fill;
        cell.style.border = cellStyle.border as ExcelJS.Borders;
        cell.style.alignment = cellStyle.alignment as ExcelJS.Alignment;
      });

      line.pools.forEach((pool) => {
        pool.locations.forEach((loc) => {
          // Find the first data item for this location
          const poolItem = props.data.find(
            (poolItem) => poolItem.locId === loc.id
          );

          let startRow: number | null = null; // Початковий рядок для об'єднання
          let count: number = 0;

          if (poolItem && poolItem.feedings) {
            count = poolItem.feedings.length;
            poolItem.feedings.forEach((feeding) => {
              // Get the percentage feeding adjustment for this location
              const percentFeeding = props.percentFeedingMap?.[loc.id] ?? 0;

              const rowValues = [
                pool.name,
                feeding?.feedType,
                feeding?.feedName,
                calculateAdjustedQuantity(
                  feeding?.feedings?.["6"]?.feeding,
                  percentFeeding
                ),
                feeding?.feedings?.["6"]?.editing ?? "",
                calculateAdjustedQuantity(
                  feeding?.feedings?.["10"]?.feeding,
                  percentFeeding
                ),
                feeding?.feedings?.["10"]?.editing ?? "",
                calculateAdjustedQuantity(
                  feeding?.feedings?.["14"]?.feeding,
                  percentFeeding
                ),
                feeding?.feedings?.["14"]?.editing ?? "",
                calculateAdjustedQuantity(
                  feeding?.feedings?.["18"]?.feeding,
                  percentFeeding
                ),
                feeding?.feedings?.["18"]?.editing ?? "",
                calculateAdjustedQuantity(
                  feeding?.feedings?.["22"]?.feeding,
                  percentFeeding
                ),
                feeding?.feedings?.["22"]?.editing ?? "",
              ];

              const newRow = worksheet.addRow(rowValues);

              // Застосовуємо стиль до кожної комірки
              newRow.eachCell({ includeEmpty: true }, (cell) => {
                cell.style.font = { bold: true, size: 10 };
                cell.style.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: cellColor },
                } as ExcelJS.Fill;
                cell.style.border = cellStyle.border as ExcelJS.Borders;
                cell.style.alignment = cellStyle.alignment as ExcelJS.Alignment;
              });

              // Якщо це перший запис для басейна, запам'ятовуємо початковий рядок
              if (startRow === null) {
                startRow = newRow.number; // Номер рядка в таблиці
              }
            });
          }

          // Якщо є більше ніж один запис, виконуємо об'єднання комірок
          if (startRow !== null && count > 1) {
            const endRow = worksheet.lastRow?.number || startRow; // Останній рядок для об'єднання
            worksheet.mergeCells(`A${startRow}:A${endRow}`);
          }

          startRow = null;
          count = 0;
        });
      });
    });

    worksheet.pageSetup = {
      paperSize: 9,
      orientation: "portrait",
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
      { width: 12 },
    ];

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 2,
      },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `day-feeding.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="">
      <Button onClick={handleExport}>Export to Excel</Button>
    </div>
  );
}
