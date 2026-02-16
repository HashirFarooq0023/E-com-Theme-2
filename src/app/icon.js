import { ImageResponse } from 'next/og';
import { getSiteSettings } from "@/lib/settings";
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs'; // Changed from 'edge' to 'nodejs' to support mysql2
export const contentType = 'image/png';

export default async function Icon() {
    const settings = await getSiteSettings();
    let logoUrl = settings?.logo_url;
    let imageSrc = logoUrl;

    // Handle local uploads: Convert to Buffer/Base64 if it's a relative path
    if (logoUrl && logoUrl.startsWith('/')) {
        try {
            const filePath = path.join(process.cwd(), 'public', logoUrl);
            if (fs.existsSync(filePath)) {
                const fileBuffer = fs.readFileSync(filePath);
                imageSrc = fileBuffer.buffer;
            }
        } catch (e) {
            console.error("Icon generation error (file):", e);
        }
    }
    // Handle Base64 Data URIs: Convert to Banner/ArrayBuffer for Satori
    else if (logoUrl && logoUrl.startsWith('data:')) {
        try {
            const base64Data = logoUrl.split(',')[1];
            if (base64Data) {
                const buffer = Buffer.from(base64Data, 'base64');
                imageSrc = buffer.buffer;
            }
        } catch (e) {
            console.error("Icon generation error (base64):", e);
        }
    }

    // If no logo, return fallback text or shape
    if (!imageSrc) {
        return new ImageResponse(
            (
                <div
                    style={{
                        fontSize: 24,
                        background: 'black',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#c4a775',
                        borderRadius: '50%',
                    }}
                >
                    TL
                </div>
            ),
            { width: 32, height: 32 }
        );
    }

    // If logo exists, render it circular
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    overflow: 'hidden',
                }}
            >
                <img
                    src={imageSrc}
                    alt="Icon"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </div>
        ),
        { width: 32, height: 32 }
    );
}
