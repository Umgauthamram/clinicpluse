import { writeFile, readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

const VALID_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function validateClinicData(data) {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return { valid: false, error: 'Data must be a JSON object with symptom keys.' };
    }

    const symptoms = Object.keys(data);
    if (symptoms.length === 0) {
        return { valid: false, error: 'Data must contain at least one symptom.' };
    }

    for (const symptom of symptoms) {
        const monthData = data[symptom];
        if (typeof monthData !== 'object' || monthData === null || Array.isArray(monthData)) {
            return { valid: false, error: `"${symptom}" must map to an object of monthly counts.` };
        }

        for (const [month, count] of Object.entries(monthData)) {
            if (!VALID_MONTHS.includes(month)) {
                return { valid: false, error: `Invalid month "${month}" found in "${symptom}". Use full month names (e.g., "January").` };
            }
            if (typeof count !== 'number' || count < 0 || !Number.isFinite(count)) {
                return { valid: false, error: `Invalid count "${count}" for "${symptom}" in "${month}". Must be a non-negative number.` };
            }
        }
    }

    return { valid: true };
}

export async function POST(request) {
    try {
        const data = await request.json();

        // Validate schema before overwriting
        const validation = validateClinicData(data);
        if (!validation.valid) {
            return NextResponse.json(
                { success: false, message: validation.error },
                { status: 400 }
            );
        }

        // Path to the clinic_insight.json in the public folder
        const filePath = path.join(process.cwd(), 'public', 'clinic_insight.json');

        // Create a backup of the existing data before overwriting
        try {
            const existing = await readFile(filePath, 'utf-8');
            const backupPath = path.join(process.cwd(), 'public', 'clinic_insight_backup.json');
            await writeFile(backupPath, existing);
        } catch (backupErr) {
            // If no existing file, skip backup silently
        }

        // Write the validated data to the file
        await writeFile(filePath, JSON.stringify(data, null, 2));

        const symptomCount = Object.keys(data).length;
        const monthCount = new Set(Object.values(data).flatMap(m => Object.keys(m))).size;

        return NextResponse.json({ 
            success: true, 
            message: `Data updated successfully. ${symptomCount} symptoms across ${monthCount} months.` 
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update data. Please check your file format.' },
            { status: 500 }
        );
    }
}
