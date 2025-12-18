'use client';

import { useState, useEffect } from 'react';

interface CustomEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CustomEditor({ value, onChange }: CustomEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const [EditorComponent, setEditorComponent] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Import the wrapper component only on client side
    import('./CKEditorWrapper').then((mod) => {
      setEditorComponent(() => mod.default);
    }).catch((err) => {
      console.error('Failed to load editor:', err);
    });
  }, []);

  if (!isClient || !EditorComponent) {
    return (
      <div className="border rounded-md bg-white p-4 min-h-[200px] flex items-center justify-center">
        <p className="text-gray-500">Loading editor...</p>
      </div>
    );
  }

  return <EditorComponent value={value} onChange={onChange} />;
}
