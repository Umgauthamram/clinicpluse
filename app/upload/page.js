"use client";
import React, { useState } from 'react';

export default function UploadPage() {
    const [uploaded, setUploaded] = useState(false);
    const [fileName, setFileName] = useState('');
    const [preview, setPreview] = useState(null);
    const [pendingData, setPendingData] = useState(null);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['application/json', 'text/csv'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.json') && !file.name.endsWith('.csv')) {
            setError('Please upload a JSON file.');
            return;
        }

        setError('');
        setUploaded(false);
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                if (file.name.endsWith('.json')) {
                    const parsedData = JSON.parse(event.target.result);
                    setPreview(JSON.stringify(parsedData, null, 2).slice(0, 500));
                    setPendingData(parsedData);
                } else {
                    setError('Currently only JSON files are supported for system updates.');
                }
            } catch (err) {
                setError('Failed to parse file. Please check the format.');
            }
        };
        reader.readAsText(file);
    };

    const uploadToSystem = async () => {
        if (!pendingData) return;
        setIsUploading(true);
        setError('');

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pendingData),
            });

            if (response.ok) {
                setUploaded(true);
                setPendingData(null);
            } else {
                setError('Failed to update the database on the server.');
            }
        } catch (err) {
            setError('An error occurred during upload.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const input = document.getElementById('file-input');
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            handleFileUpload({ target: { files: [file] } });
        }
    };

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-[1000px] mx-auto">
            <div>
                <h1 className="text-3xl font-black tracking-tight" style={{ color: '#1a1a2e' }}>
                    Data <span style={{ color: '#2E7D32' }}>Upload</span>
                </h1>
                <p className="text-sm mt-1" style={{ color: '#6b7c8a' }}>Select a file, verify the preview, and upload to the clinic system</p>
            </div>

            {/* Upload Zone */}
            {!pendingData && !uploaded && (
                <div
                    className="bg-white rounded-3xl p-16 shadow-lg border-2 border-dashed border-gray-300 text-center hover:border-green-400 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => document.getElementById('file-input').click()}
                >
                    <input
                        id="file-input"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6" style={{ background: '#E8F5E9' }}>
                    </div>
                    <h3 className="text-lg font-black mb-2" style={{ color: '#1a1a2e' }}>Drop your file here</h3>
                    <p className="text-sm" style={{ color: '#6b7c8a' }}>or click to browse — Supports <strong>.json</strong></p>
                    <p className="text-[10px] mt-4 uppercase tracking-widest font-bold" style={{ color: '#9e9e9e' }}>Max file size: 5MB</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="px-5 py-4 rounded-2xl border text-sm font-medium" style={{ background: '#FFEBEE', borderColor: '#FFCDD2', color: '#C62828' }}>
                    {error}
                </div>
            )}

            {/* Pending State (After selection, before upload) */}
            {pendingData && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-lg font-black" style={{ color: '#1a1a2e' }}>File Ready: {fileName}</h3>
                                <p className="text-sm" style={{ color: '#6b7c8a' }}>Please verify the data below before merging into the system.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPendingData(null)}
                                    className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={uploadToSystem}
                                    disabled={isUploading}
                                    className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-green-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                    style={{ background: '#2E7D32' }}
                                >
                                    {isUploading ? 'Uploading...' : 'Confirm & Upload to System'}
                                </button>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-[10px] font-black uppercase tracking-wider mb-4" style={{ color: '#9e9e9e' }}>Data Preview (Partial)</h3>
                            <pre className="text-xs p-6 rounded-2xl overflow-x-auto font-mono" style={{ background: '#F1F8F4', color: '#1a1a2e' }}>
                                {preview}
                                {preview.length >= 500 && '\n...'}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* Success State */}
            {uploaded && !pendingData && (
                <div className="space-y-6 animate-fade-in">
                    <div className="px-10 py-12 rounded-[40px] text-center shadow-xl border border-gray-100 bg-white">
                        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl mb-6 shadow-inner animate-bounce" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
                            ✓
                        </div>
                        <h2 className="text-2xl font-black mb-2" style={{ color: '#1a1a2e' }}>System Updated Successfully</h2>
                        <p className="text-sm mb-8" style={{ color: '#6b7c8a' }}>The dashboard is now live with the latest clinical insights from <strong>{fileName}</strong>.</p>
                        <button
                            onClick={() => setUploaded(false)}
                            className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            Upload Another File
                        </button>
                    </div>
                </div>
            )}

            {/* Expected Format */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: '#1a1a2e' }}>Expected JSON Format</h3>
                <pre className="text-xs p-5 rounded-2xl overflow-x-auto font-mono" style={{ background: '#F1F8F4', color: '#2E7D32' }}>
                    {`{
  "Symptom Name": {
    "January": <count>,
    "February": <count>,
    "March": <count>
  },
  ...
}`}
                </pre>
                <p className="text-[10px] mt-4 italic" style={{ color: '#9e9e9e' }}>
                    Each symptom should be a key with monthly counts as nested values.
                </p>
            </div>
        </div>
    );
}
