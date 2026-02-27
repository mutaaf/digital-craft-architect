import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageDropZoneProps {
  onImage: (base64DataUrl: string) => void;
  disabled?: boolean;
}

const ImageDropZone = ({ onImage, disabled }: ImageDropZoneProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        onImage(result);
      };
      reader.readAsDataURL(file);
    },
    [onImage],
  );

  // Document-level clipboard paste
  useEffect(() => {
    if (disabled) return;
    const handlePaste = (e: ClipboardEvent) => {
      for (const item of e.clipboardData?.items || []) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) handleFile(file);
          return;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [disabled, handleFile]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile, disabled],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const clear = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (preview) {
    return (
      <div className="relative rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
        <img
          src={preview}
          alt="Property screenshot"
          className="w-full max-h-64 object-contain rounded-lg"
        />
        {!disabled && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900"
            onClick={clear}
          >
            <X size={16} />
          </Button>
        )}
        <p className="text-xs text-center text-gray-500 mt-2 flex items-center justify-center gap-1">
          <ImageIcon size={12} /> Screenshot uploaded
        </p>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`relative rounded-xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-colors ${
        dragOver
          ? 'border-primary bg-primary/10'
          : 'border-gray-300 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-900/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <Upload size={32} className="mx-auto mb-3 text-gray-400" />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        <strong>Paste (&#8984;V)</strong>, drop, or click to upload
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Zillow, Realtor.com, wholesaler deal sheets, etc.
      </p>
    </div>
  );
};

export default ImageDropZone;
