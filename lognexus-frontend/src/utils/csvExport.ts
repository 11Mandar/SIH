// CSV Export utility for Chetas data tables
export function exportToCsv<T extends Record<string, any>>(
  filenamePrefix: string,
  rows: T[],
  columns?: { key: keyof T | string; header: string; format?: (row: T) => string }[],
  onSuccess?: (message: string) => void
) {
  if (!rows || rows.length === 0) {
    if (onSuccess) onSuccess("No rows to export.");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const filename = `chetas_${filenamePrefix}_${today}.csv`;

  let csvContent = "";

  if (columns && columns.length > 0) {
    // Header row
    const headers = columns.map((col) => `"${escapeCsv(col.header)}"`);
    csvContent += headers.join(",") + "\r\n";

    // Data rows
    for (const row of rows) {
      const line = columns.map((col) => {
        let val: any;
        if (col.format) {
          val = col.format(row);
        } else {
          val = (row as any)[col.key];
        }
        return `"${escapeCsv(val)}"`;
      });
      csvContent += line.join(",") + "\r\n";
    }
  } else {
    // Infer columns from first row object
    const keys = Object.keys(rows[0]);
    csvContent += keys.map((k) => `"${escapeCsv(k)}"`).join(",") + "\r\n";

    for (const row of rows) {
      const line = keys.map((k) => {
        const val = row[k];
        return `"${escapeCsv(val)}"`;
      });
      csvContent += line.join(",") + "\r\n";
    }
  }

  // Trigger browser download via Blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  const message = `Exported ${rows.length} row${rows.length === 1 ? "" : "s"} to ${filename}`;
  if (onSuccess) {
    onSuccess(message);
  }
}

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") {
    return JSON.stringify(val).replace(/"/g, '""');
  }
  return String(val).replace(/"/g, '""');
}
