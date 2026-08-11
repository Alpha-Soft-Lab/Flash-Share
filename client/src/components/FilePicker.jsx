import { Upload } from "lucide-react";
import { useRef } from "react";

const FilePicker = ({ onFilesSelected }) => {
  const inputRef = useRef(null);

  const handleChange = (event) => {
    const selectedFiles = Array.from(event.target.files);

    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }

    event.target.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={handleChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 transition hover:border-white/30 hover:bg-white/[0.06]"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
          <Upload size={24} />
        </div>

        <h3 className="mt-6 text-lg font-semibold">
          Select files
        </h3>

        <p className="mt-2 text-sm text-white/40">
          Choose one or more files to share
        </p>
      </button>
    </div>
  );
};

export default FilePicker;