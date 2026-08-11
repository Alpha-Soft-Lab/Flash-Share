import { File, X } from "lucide-react";

const FilePreview = ({ files, onRemove }) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-3">
      {files.map((file, index) => (
        <div
          key={`${file.name}-${file.size}-${index}`}
          className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <File size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {file.name}
            </p>

            <p className="mt-1 text-xs text-white/30">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-white/30 transition hover:text-white"
            aria-label={`Remove ${file.name}`}
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FilePreview;