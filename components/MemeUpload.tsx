'use client';

import { useState } from 'react';

interface MemeUploadProps {
  onImageSelected: (imageDataUrl: string) => void;
}

export default function MemeUpload({ onImageSelected }: MemeUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreview(dataUrl);
      onImageSelected(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Image</h2>
      
      <div className="mb-6">
        <label className="cursor-pointer inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:shadow-lg transition-shadow">
          Choose Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {preview && (
        <div className="mt-6">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-auto rounded-lg shadow-md"
            style={{ maxHeight: '500px' }}
          />
        </div>
      )}
    </div>
  );
}
