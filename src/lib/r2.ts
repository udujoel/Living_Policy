import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const S3_ENDPOINT = process.env.CLOUDFLARE_S3_API;
const ACCESS_KEY = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const SECRET_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME || 'living-policy';

// Initialize S3 Client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY || '',
    secretAccessKey: SECRET_KEY || '',
  },
});

export const getPresignedUploadUrl = async (key: string, contentType: string) => {
  if (!S3_ENDPOINT || !ACCESS_KEY || !SECRET_KEY) return null;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    // Expires in 1 hour
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return null;
  }
};

export const downloadFromR2 = async (key: string): Promise<Buffer | null> => {
   try {
     const command = new GetObjectCommand({
       Bucket: BUCKET_NAME,
       Key: key
     });
     const response = await s3Client.send(command);
     if (!response.Body) return null;
     
     // Helper to convert stream to buffer
     const streamToBuffer = (stream: any) =>
       new Promise<Buffer>((resolve, reject) => {
         const chunks: any[] = [];
         stream.on("data", (chunk: any) => chunks.push(chunk));
         stream.on("error", reject);
         stream.on("end", () => resolve(Buffer.concat(chunks)));
       });

     return await streamToBuffer(response.Body);
   } catch (error) {
     console.error("Error downloading from R2:", error);
     return null;
   }
};

export const uploadToR2 = async (file: File, path: string): Promise<string | null> => {
  if (!S3_ENDPOINT || !ACCESS_KEY || !SECRET_KEY) {
    console.error("Missing Cloudflare R2 configuration");
    return null;
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
      Body: buffer,
      ContentType: file.type,
    }));

    // Construct public URL (assuming public access or worker proxy)
    // If using a custom domain or worker:
    const publicUrl = `${process.env.CLOUDFLARE_PUBLIC_URL || S3_ENDPOINT}/${BUCKET_NAME}/${path}`;
    return publicUrl;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    return null;
  }
};
