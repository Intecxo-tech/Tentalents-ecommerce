import { minioClient } from './minio-client';

/**
 * Options for uploading a file to MinIO
 */
export interface UploadFileOptions {
  content: Buffer;       // File content
  objectName: string;    // Full object key in bucket, e.g., 'invoices/invoice-123.pdf'
  bucketName: string;    // Bucket name
  contentType: string;   // MIME type, e.g., 'application/pdf'
}

/**
 * Uploads a file to MinIO with correct metadata and returns the public URL.
 */
export async function uploadFileToMinIO({
  content,
  objectName,
  bucketName,
  contentType,
}: UploadFileOptions): Promise<string> {
  // Ensure bucket exists
  const exists = await minioClient.bucketExists(bucketName);
  if (!exists) {
    await minioClient.makeBucket(bucketName, 'us-east-1');
  }

  // Upload the file
  await minioClient.putObject(bucketName, objectName, content, content.length, {
    'Content-Type': contentType,
  });

  // Return the public URL
  return `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${objectName}`;
}
