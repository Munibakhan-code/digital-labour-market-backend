import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { v4 as uuid } from 'uuid';

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDir(env.uploadDir);
    cb(null, env.uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  },
});

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: env.maxFileSize },
  fileFilter: (_req: Request, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(ApiError.badRequest('Invalid file type. Only images allowed.'));
    }
    cb(null, true);
  },
});