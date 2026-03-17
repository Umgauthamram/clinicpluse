import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request) {
    try {
        const data = await request.json();

        // Path to the clinic_insight.json in the public folder
        const filePath = path.join(process.cwd(), 'public', 'clinic_insight.json');

        // Write the new data to the file
        await writeFile(filePath, JSON.stringify(data, null, 2));

        return NextResponse.json({ success: true, message: 'Data updated successfully' });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update data' },
            { status: 500 }
        );
    }
}
