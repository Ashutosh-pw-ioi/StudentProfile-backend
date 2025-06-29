import * as XLSX from "xlsx";

export interface StudentExcelRow {
  name: string;
  email: string;
  password: string;
  gender: string;
  phoneNumber: string;
  enrollmentNumber: string;
  center: string;
  department: string;
  batch: string;
}

export function parseStudentExcel(buffer: Buffer): StudentExcelRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });

  const students: StudentExcelRow[] = jsonData.map((row) => ({
    name: String(row.name).trim(),
    email: String(row.email).trim(),
    password: String(row.password).trim(),
    gender: String(row.gender).trim(),
    phoneNumber: String(row.phoneNumber).trim(),
    enrollmentNumber: String(row.enrollmentNumber).trim(),
    center: String(row.center).trim(),
    department: String(row.department).trim().toUpperCase(),
    batch: String(row.batch).trim(),
  }));

  return students;
}
