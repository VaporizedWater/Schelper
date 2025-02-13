"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ImportSheet = () => {
    console.log("THIS WORKS");
    const [file, setFile] = useState<File | null>(null);

    const router = useRouter();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!file) return;

        // Add your file processing logic here
        console.log('File selected:', file.name);

        router.back();
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Import Sheet</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className='max-h-fit'>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!file}
                    className="px-4 py-2 bg-blue-500 text-white rounded
                        hover:bg-blue-600 disabled:bg-gray-300"
                >
                    Import
                </button>
            </form>
        </div>
    );
};

export default ImportSheet;