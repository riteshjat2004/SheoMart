const normalizeStoreCode = (storeId: string): string => {
  const cleaned = storeId
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  return cleaned || "DEFAULT";
};

export const padInvoiceSequence = (sequence: number): string => {
  return String(Math.max(sequence, 1)).padStart(6, "0");
};

export const buildInvoiceNumberPrefix = (storeCode: string, date: Date): string => {
  const safeDate = new Date(date);

  if (Number.isNaN(safeDate.getTime())) {
    throw new Error("Invalid date passed to invoice number utility");
  }

  const yyyy = safeDate.getFullYear();
  const mm = String(safeDate.getMonth() + 1).padStart(2, "0");
  const dd = String(safeDate.getDate()).padStart(2, "0");
  const normalizedStoreCode = normalizeStoreCode(storeCode);

  return `SHM-${normalizedStoreCode}-${yyyy}${mm}${dd}`;
};

export const generateInvoiceNumber = (storeCode: string, date: Date, sequence: number): string => {
  return `${buildInvoiceNumberPrefix(storeCode, date)}-${padInvoiceSequence(sequence)}`;
};
