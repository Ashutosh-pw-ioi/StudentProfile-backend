import * as XLSX from "xlsx";

export interface ExcelRow {
  enrollmentNumber: string;
  courseCode: string;
  date: Date;
  testName: string;
  scoreType: string;
  totalMarks: number;
  obtainedMarks: number;
}

export function parseMarksExcel(buffer: Buffer): ExcelRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json<any>(sheet, { defval: null });

  const parsedData: ExcelRow[] = jsonData.map((row) => ({
    enrollmentNumber: String(row.enrollmentNumber).trim(),
    courseCode: String(row.courseCode).trim(),
    date: parseDate(row.date),
    testName: String(row.testName || "").trim(),
    scoreType: String(row.scoreType || "")
      .toUpperCase(),
    totalMarks: Number(row.totalMarks) || 0,
    obtainedMarks: Number(row.obtainedMarks) || 0,
  }));

  return parsedData;
}

function parseDate(excelDate: any): Date {
  if (excelDate instanceof Date) {
    return excelDate;
  }
  if (typeof excelDate === "number") {
    // Excel date serial to JS Date
    return XLSX.SSF.parse_date_code(excelDate) 
      ? new Date(Date.UTC(1899, 11, 30 + excelDate))
      : new Date();
  }
  const parsed = new Date(excelDate);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}
