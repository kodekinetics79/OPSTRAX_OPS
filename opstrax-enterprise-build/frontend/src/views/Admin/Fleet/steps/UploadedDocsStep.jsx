import React from "react";
import { useFormContext } from "react-hook-form";

const UploadedDocsStep = () => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const files = watch("files") || [];

  const handleFilesChange = (event) => {
    const selected = Array.from(event.target.files || []);
    setValue("files", selected, { shouldValidate: true });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <label className="block text-xs font-bold text-soft-gray/70 uppercase tracking-wide mb-2">
          Upload Documents
        </label>
        <div className="relative group">
          <input
            type="file"
            multiple
            onChange={handleFilesChange}
            className="block w-full text-sm text-soft-gray
              file:mr-4 file:py-2.5 file:px-6
              file:rounded-xl file:border-0
              file:text-xs file:font-bold file:uppercase file:tracking-wide
              file:bg-primary file:text-black
              hover:file:bg-primary/90 file:transition-colors
              cursor-pointer bg-card-dark border border-white/10 rounded-xl 
              focus:outline-none focus:border-primary/50 transition-all duration-200
              hover:border-white/20 py-2 px-2"
            accept="image/*,application/pdf"
          />
        </div>
        {errors.files?.message && (
          <p className="mt-2 text-[10px] font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-rose-400"></span>
            {errors.files.message}
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="border border-white/10 rounded-xl p-4 bg-card-dark shadow-lg">
          <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Selected Files ({files.length})
          </h4>
          <ul className="text-sm text-gray-300 space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {files.map((file, idx) => (
              <li 
                key={idx} 
                className="flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary text-xs font-bold border border-white/10">
                  FILE
                </div>
                <span className="truncate flex-1 font-medium">{file.name}</span>
                <span className="text-xs text-soft-gray/50">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadedDocsStep;
