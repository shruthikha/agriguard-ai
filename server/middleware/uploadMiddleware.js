const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'scans');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'scan-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype.toLowerCase();

  if (allowed.test(ext) && (mime.includes('image') || allowed.test(mime))) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Please upload a JPG, JPEG, PNG, or WEBP image.'));
  }
};

const maxMb = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '15', 10);

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxMb * 1024 * 1024
  }
});

module.exports = upload;
