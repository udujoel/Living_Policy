import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

const S3_ENDPOINT = process.env.CLOUDFLARE_S3_API;
const ACCESS_KEY = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const SECRET_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME || 'living-policy';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY || '',
    secretAccessKey: SECRET_KEY || '',
  },
});

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log("Attempting to set CORS for bucket:", BUCKET_NAME);
    const command = new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["PUT", "POST", "GET", "HEAD", "DELETE"],
            AllowedOrigins: ["*"], // For development/production ease. In strict prod, use specific domains.
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600
          }
        ]
      }
    });

    const response = await s3Client.send(command);
    console.log("CORS Set Response:", response);
    
    return NextResponse.json({ 
        success: true, 
        message: "CORS configured successfully for R2 Bucket", 
        bucket: BUCKET_NAME 
    });
  } catch (error: any) {
    console.error("CORS Configuration Failed:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
