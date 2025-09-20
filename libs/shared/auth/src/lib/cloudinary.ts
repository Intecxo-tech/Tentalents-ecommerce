import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: 'tentalents',
  api_key: '287733285458618',
  api_secret: 'oaQz328adY9rP5rkgIcE-5QSE_0',
  secure: true,
});

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string = 'general',
  filename?: string,
  mimeType?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      public_id: filename,
      resource_type: mimeType === 'application/pdf' ? 'raw' : 'auto', // raw for PDFs
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      if (!result?.secure_url) return reject(new Error('Upload failed, no URL returned'));

      // ✅ For PDFs, append `attachment=true` to force download
      const finalUrl =
        mimeType === 'application/pdf'
          ? `${result.secure_url}?attachment=true`
          : result.secure_url;

      resolve(finalUrl);
    });

    const readable = new Readable();
    readable._read = () => {};
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(stream);
  });
};
