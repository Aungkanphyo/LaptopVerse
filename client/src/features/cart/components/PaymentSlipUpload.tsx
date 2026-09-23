import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadCloud, X } from "lucide-react";

interface PaymentSlipUploadProps {
  slipFile: File | null;
  slipPreview: string | null;
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export const PaymentSlipUpload = ({
  slipFile,
  slipPreview,
  onFileSelect,
  onRemoveFile,
}: PaymentSlipUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // File Validation Logic
  const validateAndProcessFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only PNG, JPG, or WEBP files are accepted.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be under 5MB");
      return false;
    }

    onFileSelect(file);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
    e.target.value = "";
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleClear = () => {
    onRemoveFile();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Keyboard accessibility (Pressing Enter or Space functions the same as clicking the Upload button)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
          UPLOAD PAYMENT SLIP / SCREENSHOT
        </span>
        <span className="text-[11px] text-slate-500">
          PNG, JPG, WEBP (Max 5MB)
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={ALLOWED_TYPES.join(", ")}
        className="hidden"
      />

      {slipPreview ? (
        <div className="relative rounded-2xl border border-slate-800 bg-[#070913] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={slipPreview}
              alt="Slip preview"
              className="size-14 object-cover rounded-lg border border-slate-700"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate max-w-xs">
                {slipFile?.name ?? "Uploaded Image"}
              </p>
              <p className="text-[10px] text-emerald-400 font-medium">
                Ready to submit
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="text-slate-400 hover:text-rose-400"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-2xl border border-dashed p-8 text-center cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
            isDragging
              ? "border-emerald-500 bg-emerald-950/20"
              : "border-slate-800 bg-[#070913] hover:border-slate-700"
          }`}
        >
          <div className="inline-flex size-12 items-center justify-center rounded-full bg-slate-800/50 text-slate-400 mb-3">
            <UploadCloud className="size-6" />
          </div>
          <p className="text-xs md:text-sm font-semibold text-slate-200">
            Click to upload screenshot{" "}
            <span className="text-slate-400 font-normal">
              or drag & drop
            </span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Attach your transfer confirmation receipt here
          </p>
        </div>
      )}
    </div>
  );
};