import { db } from "@/db";
import ExcelJS from "exceljs";
// import path from 'path';
import fs from "fs/promises";

//fill the datatables
export async function fillDatatables() {
  const filePath = "./public/datatables.xlsx";
  try {
    const fileBuffer = await fs.readFile(filePath);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    await tableDueToFishWeight(workbook, "lt25");
    await tableDueToFishWeight(workbook, "gt25");
  } catch (error) {
    console.error("Error reading or importing Excel file:", error);
    return [];
  }
}

export async function tableDueToFishWeight(
  workbook: ExcelJS.Workbook,
  fishType: string
) {
  if (fishType === "lt25") {
    //less than 25
    const worksheetName = "Datatabel1";
    let worksheet = workbook.getWorksheet(worksheetName);

    if (!worksheet) {
      throw new Error(
        `Worksheet '${worksheetName}' not found in the Excel file.`
      );
    }

    let isFirstRow = true; // Флаг для першого рядка

    await db.datatable_below25.deleteMany();

    worksheet.eachRow(async (row) => {
      if (isFirstRow) {
        isFirstRow = false; // Пропускаємо перший рядок
        return;
      }

      await db.datatable_below25.create({
        data: {
          day: Number(row.getCell(5).text.trim()),
          feedingLevel: Number(row.getCell(3).text.trim()),
          fc: Number(row.getCell(4).text.trim()),
          weight: Number(row.getCell(2).text.trim()),
          voerhoeveelheid: Number(row.getCell(6).text.trim()),
        },
      });
    });
  } else if (fishType === "gt25") {
    //greater than 25
    const worksheetName = "Datatabel2";
    let worksheet = workbook.getWorksheet(worksheetName);

    if (!worksheet) {
      throw new Error(
        `Worksheet '${worksheetName}' not found in the Excel file.`
      );
    }

    let isFirstRow = true; // Флаг для першого рядка

    await db.datatable_over25.deleteMany();

    worksheet.eachRow(async (row) => {
      if (isFirstRow) {
        isFirstRow = false; // Пропускаємо перший рядок
        return;
      }

      await db.datatable_over25.create({
        data: {
          day: Number(row.getCell(1).text.trim()),
          av_weight: Number(row.getCell(2).text.trim()),
          weight: Number(row.getCell(3).text.trim()),
          uitval: Number(row.getCell(4).text.trim()),
          voederconversie: Number(row.getCell(7).text.trim()),
          voederniveau: Number(row.getCell(5).text.trim()),
        },
      });
    });
  }
}

export async function caviarRegistering(
  locationId: number,
  executedBy: number,
  purchId: number,
  comments?: string
): Promise<bigint | null> {
  //console.log("we are in caviarRegistering");
  let batchId: bigint | null = null;

  try {
    const date = await db.purchtable.findFirst({
      where: { id: purchId },
      select: { date_time: true },
    });
    if (date) {
      const { date_time } = date;
      const doc_type_id = 4; // реєстрація ікри
      const doc = await db.documents.create({
        data: {
          location_id: locationId,
          doc_type_id: doc_type_id,
          date_time: date_time,
          executed_by: executedBy,
          comments: comments,
        },
      });

      const insertedId = doc.id;

      const purchaseLines = await db.purchaselines.findMany({
        where: {
          purchase_id: purchId,
          quantity: {
            gt: 0,
          },
        },
      });

      purchaseLines.forEach(async (purchaseLine) => {
        const itemId = purchaseLine.item_id;

        await db.purchtable.update({
          where: { id: purchId },
          data: { doc_id: insertedId },
        });

        const vendorId = await db.purchtable.findFirst({
          where: { doc_id: insertedId },
          select: { vendor_id: true },
        });

        const vendorDocNumber = await db.purchtable.findFirst({
          where: { doc_id: insertedId },
          select: { vendor_doc_number: true },
        });

        //console.log("insertedId: ", insertedId);

        const formattedDate = date_time.toISOString().split("T")[0];

        //console.log("vendorIdValue", vendorId);
        //console.log("vendorDocNumberValue", vendorDocNumber);

        const batch = await db.itembatches.create({
          data: {
            name: `CA-${formattedDate}-${vendorId?.vendor_id}-${vendorDocNumber?.vendor_doc_number}-${itemId}`,
            item_id: itemId,
            created: new Date(),
            created_by: executedBy,
          },
        });

        const batchId = batch.id;

        const unitId = await db.items.findFirst({
          where: { id: itemId },
          select: { default_unit_id: true },
        });

        let transaction = null;

        if (unitId && unitId.default_unit_id !== null) {
          // Additional validation to ensure quantity is positive
          if (purchaseLine.quantity <= 0) {
            console.warn(
              `Skipping transaction creation for batch ${batchId} with invalid quantity: ${purchaseLine.quantity}`
            );
            continue;
          }

          transaction = await db.itemtransactions.create({
            data: {
              doc_id: insertedId,
              location_id: locationId,
              batch_id: batchId,
              quantity: purchaseLine.quantity,
              unit_id: unitId.default_unit_id,
            },
          });

          const tranId = transaction.id;

          await db.purchaselines.update({
            where: {
              id: purchaseLine.id,
            },
            data: {
              item_transaction_id: tranId,
            },
          });
        }
      });
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
  } finally {
    await db.$disconnect();
    return batchId;
  }
}
