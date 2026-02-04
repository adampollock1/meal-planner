import { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface CSVDropzoneProps {
  onFileSelect: (content: string) => void;
}

export function CSVDropzone({ onFileSelect }: CSVDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileSelect(content);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200
          ${isDragging 
            ? 'border-orange-400 bg-orange-50' 
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          }
        `}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
            ${isDragging ? 'bg-orange-100' : 'bg-slate-100'}
          `}>
            {isDragging ? (
              <FileText className="w-8 h-8 text-orange-500" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-slate-700">
              {isDragging ? 'Drop your file here' : 'Drag and drop your CSV file'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              or click to browse from your computer
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileText className="w-4 h-4" />
            <span>CSV files only, max 5MB</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
