import ExcelJS from "exceljs";

import type { ExportSummary } from "@/lib/exports/types";

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF2563EB" },
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
};

export async function buildExcelWorkbook(params: {
  sheetName: string;
  summarySheetName?: string;
  headers: string[];
  rows: string[][];
  summary?: ExportSummary;
  title?: string;
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Factoni";
  workbook.created = new Date();

  if (params.summary) {
    const summarySheet = workbook.addWorksheet(
      params.summarySheetName ?? "Résumé",
    );
    summarySheet.columns = [
      { width: 28 },
      { width: 22 },
    ];

    const title = params.title ?? "Export comptable";
    summarySheet.addRow([title]);
    summarySheet.getCell("A1").font = { bold: true, size: 14 };
    summarySheet.addRow(["Généré le", new Date().toLocaleString("fr-FR")]);
    summarySheet.addRow([]);
    summarySheet.addRow(["Factures", params.summary.invoiceCount]);
    summarySheet.addRow(["CA TTC", params.summary.totalTtc]);
    summarySheet.addRow(["Total HT", params.summary.totalHt]);
    summarySheet.addRow(["TVA collectée", params.summary.totalVat]);
    summarySheet.addRow(["Factures payées", params.summary.paidCount]);
    summarySheet.addRow(["Impayées", params.summary.unpaidCount]);

    for (let i = 4; i <= 9; i++) {
      const amountCell = summarySheet.getCell(`B${i}`);
      if (i >= 5 && i <= 7 && typeof amountCell.value === "number") {
        amountCell.numFmt = '#,##0.00 "€"';
      }
    }
  }

  const sheet = workbook.addWorksheet(params.sheetName);
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const headerRow = sheet.addRow(params.headers);
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  headerRow.height = 22;

  for (const row of params.rows) {
    const dataRow = sheet.addRow(row);
    row.forEach((value, colIndex) => {
      const header = params.headers[colIndex]?.toLowerCase() ?? "";
      const cell = dataRow.getCell(colIndex + 1);
      if (
        header.includes("ht") ||
        header.includes("ttc") ||
        header.includes("tva") ||
        header === "remise"
      ) {
        const num = Number(String(value).replace(",", ".").replace(/[^\d.-]/g, ""));
        if (Number.isFinite(num) && value !== "") {
          cell.value = num;
          cell.numFmt = '#,##0.00 "€"';
        }
      }
      if (header.includes("date")) {
        cell.alignment = { horizontal: "center" };
      }
    });
  }

  sheet.columns.forEach((column) => {
    let max = 12;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const len = String(cell.value ?? "").length;
      if (len > max) max = Math.min(len + 2, 40);
    });
    column.width = max;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function buildSimpleExcel(params: {
  sheetName: string;
  headers: string[];
  rows: string[][];
}): Promise<Buffer> {
  return buildExcelWorkbook({
    sheetName: params.sheetName,
    headers: params.headers,
    rows: params.rows,
  });
}
