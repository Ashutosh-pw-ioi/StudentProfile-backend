import multer from 'multer';

const storage = multer.memoryStorage();
export const uploadExcel = multer({ storage });