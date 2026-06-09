import { Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

import {
  formatPdfMoney,
  formatPdfPercent,
  formatPdfQuantity,
} from "@/lib/pdf/format";
import { pdfStyles } from "@/lib/pdf/styles";
import type { PdfInvoiceLine } from "@/lib/pdf/types";

interface PdfLinesTableProps {
  lines: PdfInvoiceLine[];
}

type ColAlign = "left" | "center" | "right";

interface TableColumn {
  key: string;
  label: string;
  colStyle: Style;
  align: ColAlign;
  bold?: boolean;
}

const TABLE_COLUMNS: TableColumn[] = [
  { key: "desc", label: "Désignation", colStyle: pdfStyles.colDesc, align: "left" },
  { key: "qty", label: "Qté", colStyle: pdfStyles.colQty, align: "center" },
  { key: "pu", label: "P.U. HT", colStyle: pdfStyles.colPu, align: "right" },
  { key: "vat", label: "TVA", colStyle: pdfStyles.colVat, align: "right" },
  { key: "ht", label: "Total HT", colStyle: pdfStyles.colHt, align: "right", bold: true },
  { key: "ttc", label: "Total TTC", colStyle: pdfStyles.colTtc, align: "right", bold: true },
];

function headerTextAlignStyle(align: ColAlign): Style {
  if (align === "center") return pdfStyles.colHeaderCenter;
  if (align === "right") return pdfStyles.colHeaderRight;
  return pdfStyles.colCellLeft;
}

function bodyTextAlignStyle(align: ColAlign, bold = false): Style {
  if (align === "center") return pdfStyles.colCellCenter;
  if (align === "right") return bold ? pdfStyles.colCellRightBold : pdfStyles.colCellRight;
  return pdfStyles.colDescText;
}

function renderLineValue(line: PdfInvoiceLine, col: TableColumn): string {
  switch (col.key) {
    case "desc":
      return line.description;
    case "qty":
      return formatPdfQuantity(line.quantity);
    case "pu":
      return formatPdfMoney(line.unitPriceHt);
    case "vat":
      return formatPdfPercent(line.vatRate);
    case "ht":
      return formatPdfMoney(line.lineTotalHt);
    case "ttc":
      return formatPdfMoney(line.lineTotalTtc);
    default:
      return "";
  }
}

export function PdfLinesTable({ lines }: PdfLinesTableProps) {
  return (
    <View style={pdfStyles.table}>
      <View style={pdfStyles.tableHeader} wrap={false}>
        {TABLE_COLUMNS.map((col) => (
          <View key={col.key} style={col.colStyle}>
            <Text
              style={[pdfStyles.tableHeaderCell, headerTextAlignStyle(col.align)]}
            >
              {col.label}
            </Text>
          </View>
        ))}
      </View>
      {lines.map((line, index) => {
        const isLast = index === lines.length - 1;
        return (
          <View
            key={`line-${index}`}
            wrap={false}
            style={[pdfStyles.tableRow, isLast ? pdfStyles.tableRowLast : {}]}
          >
            {TABLE_COLUMNS.map((col) => (
              <View key={col.key} style={col.colStyle}>
                <Text style={bodyTextAlignStyle(col.align, col.bold)}>
                  {renderLineValue(line, col)}
                </Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}
