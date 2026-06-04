const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Initialize S3/R2 client
let s2Client = null;

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL; // e.g. https://pub-xxxx.r2.dev or custom domain

const isR2Configured = !!(accountId && accessKeyId && secretAccessKey && bucketName);

if (isR2Configured) {
  s2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
  console.log('Cloudflare R2 Client initialized successfully.');
} else {
  console.log('Cloudflare R2 credentials missing. Falling back to local filesystem storage for uploads.');
}

/**
 * Uploads a file buffer to Cloudflare R2 or falls back to local disk
 * @param {Object} file - The file object from multer (req.file)
 * @returns {Promise<string>} The public URL of the uploaded file
 */
const uploadFile = async (file) => {
  if (!file) return null;

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  let finalBuffer = file.buffer;
  let finalMimeType = file.mimetype;
  let finalExtension = path.extname(file.originalname).toLowerCase();

  // If file is an image, compress it using sharp
  if (file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
    try {
      finalBuffer = await sharp(file.buffer)
        .webp({ quality: 80 })
        .toBuffer();
      finalMimeType = 'image/webp';
      finalExtension = '.webp';
    } catch (err) {
      console.error('Sharp compression failed, using original buffer:', err);
    }
  }

  const fileKey = `${file.fieldname}-${uniqueSuffix}${finalExtension}`;

  if (isR2Configured && s2Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: finalBuffer,
        ContentType: finalMimeType,
      });

      await s2Client.send(command);

      // Return the public access URL
      const baseUrl = publicUrl ? publicUrl.replace(/\/$/, '') : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;
      return `${baseUrl}/${fileKey}`;
    } catch (err) {
      console.error('Failed to upload to Cloudflare R2, attempting local fallback:', err);
    }
  }

  // Fallback: Write buffer to local uploads folder
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const localPath = path.join(uploadDir, fileKey);
  fs.writeFileSync(localPath, finalBuffer);
  return `/uploads/${fileKey}`;
};

module.exports = {
  uploadFile,
  isR2Configured
};
