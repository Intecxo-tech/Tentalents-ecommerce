import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'tentalents',
  api_key: '287733285458618',       // must be a string
  api_secret: 'oaQz328adY9rP5rkgIcE-5QSE_0',
  secure: true,
});

/**
 * Upload a file (PDF or other) to Cloudinary
 * @param fileBuffer - Buffer of the file to upload
 * @param folder - Cloudinary folder (default: 'invoices')
 * @param filename - Optional public_id (filename without extension)
 * @returns secure_url of uploaded file
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string = 'invoices',
  filename?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,        // Do NOT include .pdf; Cloudinary handles extension
        resource_type: 'raw',       // Important for PDFs and other non-image files
        overwrite: true,            // Optional: overwrite if file exists
      },
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

    // Convert Buffer to Readable stream and pipe to Cloudinary
    const readable = new Readable();
    readable._read = () => {};
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(stream);
  });
};




// import { v2 as cloudinary } from 'cloudinary';
// import { Readable } from 'stream';



// cloudinary.config({
//   cloud_name: 'tentalents',
//   api_key: '287733285458618',  // <-- must be a string!
//   api_secret: 'oaQz328adY9rP5rkgIcE-5QSE_0',
//   secure: true,
// });


// export const uploadToCloudinary = async (
//   fileBuffer: Buffer,
//   folder: string = 'general',
//   filename?: string
// ): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder,
//         public_id: filename,
//         resource_type: 'auto',
//       },
//       (error, result) => {
//         if (error) {
//           console.error('Cloudinary upload error:', error);
//           return reject(error);
//         }
//         if (!result?.secure_url) {
//           console.error('No secure_url returned from Cloudinary:', result);
//           return reject(new Error('Upload failed, no URL returned'));
//         }
//         console.log('✅ Uploaded to Cloudinary:', result.secure_url);
//         resolve(result.secure_url);
//       }
//     );

//     const readable = new Readable();
//     readable._read = () => {};
//     readable.push(fileBuffer);
//     readable.push(null);
//     readable.pipe(stream);
//   });
// };
