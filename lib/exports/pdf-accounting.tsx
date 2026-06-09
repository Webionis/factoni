import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import type { ExportSummary } from "@/lib/exports/types";
import { formatCurrency } from "@/lib/invoices/calculate";
import { siteConfig } from "@/lib/site";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 16,
  },
  brand: {
    fontSize: 16,
    fontWeight: 700,
    color: "#2563eb",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: "#64748b",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    padding: 10,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 700,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontWeight: 700,
    fontSize: 7,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontSize: 7,
  },
  tableRowAlt: {
    backgroundColor: "#fafbff",
  },
  colNum: { width: "14%" },
  colDate: { width: "10%" },
  colClient: { width: "22%" },
  colHt: { width: "12%", textAlign: "right" },
  colVat: { width: "10%", textAlign: "right" },
  colTtc: { width: "12%", textAlign: "right" },
  colStatus: { width: "12%" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 7,
    color: "#94a3b8",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
});

export interface AccountingPdfRow {
  number: string;
  issueDate: string;
  client: string;
  totalHt: string;
  totalVat: string;
  totalTtc: string;
  status: string;
}

export interface AccountingPdfData {
  companyName: string;
  periodLabel: string;
  generatedAt: string;
  summary: ExportSummary;
  rows: AccountingPdfRow[];
}

function AccountingPdfDocument({ data }: { data: AccountingPdfData }) {
  return (
    <Document title={`Export comptable — ${data.periodLabel}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>{siteConfig.name}</Text>
          <Text style={styles.title}>Rapport comptable — Factures</Text>
          <Text style={styles.subtitle}>{data.companyName}</Text>
          <Text style={styles.subtitle}>Période : {data.periodLabel}</Text>
          <Text style={styles.subtitle}>
            Généré le {data.generatedAt}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Factures</Text>
            <Text style={styles.summaryValue}>{data.summary.invoiceCount}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>CA TTC</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(data.summary.totalTtc)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>TVA collectée</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(data.summary.totalVat)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Payées / Impayées</Text>
            <Text style={styles.summaryValue}>
              {data.summary.paidCount} / {data.summary.unpaidCount}
            </Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.colNum}>N° facture</Text>
          <Text style={styles.colDate}>Émission</Text>
          <Text style={styles.colClient}>Client</Text>
          <Text style={styles.colHt}>HT</Text>
          <Text style={styles.colVat}>TVA</Text>
          <Text style={styles.colTtc}>TTC</Text>
          <Text style={styles.colStatus}>Statut</Text>
        </View>

        {data.rows.map((row, index) => (
          <View
            key={`${row.number}-${index}`}
            style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
            wrap={false}
          >
            <Text style={styles.colNum}>{row.number}</Text>
            <Text style={styles.colDate}>{row.issueDate}</Text>
            <Text style={styles.colClient}>{row.client}</Text>
            <Text style={styles.colHt}>{row.totalHt}</Text>
            <Text style={styles.colVat}>{row.totalVat}</Text>
            <Text style={styles.colTtc}>{row.totalTtc}</Text>
            <Text style={styles.colStatus}>{row.status}</Text>
          </View>
        ))}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Document généré par ${siteConfig.name} — Page ${pageNumber}/${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

export async function renderAccountingPdf(
  data: AccountingPdfData,
): Promise<Buffer> {
  const buffer = await renderToBuffer(<AccountingPdfDocument data={data} />);
  return Buffer.from(buffer);
}
