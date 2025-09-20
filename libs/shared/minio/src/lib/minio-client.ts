import { Client } from 'minio';

export const minioClient = new Client({
  endPoint: "minio-sfzd.onrender.com",  // Your Render MinIO endpoint
  port: 443,                            // Always 443 since Render uses HTTPS
  useSSL: true,                         // Render is HTTPS only
  accessKey: "minio",                   // Your MinIO access key
  secretKey: "minio123",                // Your MinIO secret key
});

export default minioClient;
