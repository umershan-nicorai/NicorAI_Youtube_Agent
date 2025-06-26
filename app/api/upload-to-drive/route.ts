import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Path to your service account key
const KEYFILEPATH = path.join(process.cwd(), 'credentials/drive-service-account.json');
// Your target Google Drive folder ID
const FOLDER_ID = '1scF5TXgyDDC3KZnsA0h3rF8jdusArfTd';

// Helper to authenticate Google Drive
function getDriveService() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Google Drive
    const drive = getDriveService();
    const res = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [FOLDER_ID],
      },
      media: {
        mimeType: file.type,
        body: buffer,
      },
      fields: 'id,webViewLink,webContentLink',
    });

    // Make the file public (optional)
    await drive.permissions.create({
      fileId: res.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Return the shareable link
    return NextResponse.json({
      fileId: res.data.id,
      webViewLink: res.data.webViewLink,
      webContentLink: res.data.webContentLink,
    });
  } catch (error: any) {
    console.error('Drive upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}