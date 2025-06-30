import * as XLSX from "xlsx";

export interface TeacherExcelRow {
  name: string;
  email: string;
  password: string;
  gender: string;
  phoneNumber: string;
  experience: number;
  centerName: string;
  departmentName: string;
  batchName: string;
  courseName: string;
}

export function parseTeacherExcel(buffer: Buffer): TeacherExcelRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });

  const teachers: TeacherExcelRow[] = jsonData.map((row) => ({
    name: String(row.name || "").trim(),
    email: String(row.email || "").trim(),
    password: String(row.password || "").trim(),
    gender: String(row.gender || "").trim(),
    phoneNumber: String(row.phoneNumber || "").trim(),
    experience: Number(row.experience || 0),
    centerName: String(row.centerName || row.center || "").trim(),
    departmentName: String(row.departmentName || row.department || "").trim().toUpperCase(),
    batchName: String(row.batchName || row.batch || "").trim(),
    courseName: String(row.courseName || row.course || "").trim(),
  }));

  return teachers;
}
