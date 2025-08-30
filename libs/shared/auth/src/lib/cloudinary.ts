import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: 'tentalents',
  api_key: '287733285458618',  // <-- must be a string!
  api_secret: 'oaQz328adY9rP5rkgIcE-5QSE_0',
  secure: true,
});

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string = 'general',
  filename?: string,
  mimeType?: string  // <-- Add mimeType parameter here
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Default resource type is 'auto'
    const uploadOptions: any = {
      folder,
      public_id: filename,
      resource_type: 'auto',
    };

    // For PDFs (or other non-image files), use resource_type 'raw'
    if (mimeType === 'application/pdf') {
      uploadOptions.resource_type = 'raw';
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        if (!result?.secure_url) {
          console.error('No secure_url returned from Cloudinary:', result);
          return reject(new Error('Upload failed, no URL returned'));
        }
        console.log('✅ Uploaded to Cloudinary:', result.secure_url);
        resolve(result.secure_url);
      }
    );

    const readable = new Readable();
    readable._read = () => {};
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(stream);
  });
};
