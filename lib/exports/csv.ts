/**
 * Génération CSV légère (sans dépendance externe).
 * Séparateur : point-virgule (Excel FR).
 */

const SEP = ";";

export function escapeCsvField(value: string): string {
  const normalized = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (
    normalized.includes(SEP) ||
    normalized.includes('"') ||
    normalized.includes("\n")
  ) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

export function buildCsvRow(cells: string[]): string {
  return cells.map((cell) => escapeCsvField(cell)).join(SEP);
}

/** BOM UTF-8 pour Excel (accents français). */
export function csvFileContent(rows: string[]): string {
  const body = rows.join("\r\n");
  return `\uFEFF${body}`;
}
