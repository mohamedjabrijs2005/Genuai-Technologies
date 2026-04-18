import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer: Buffer, filename: string, mimetype: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'genuai-resumes',
        public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

router.post('/resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json({ url: fileUrl, fileName: req.file.originalname });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
