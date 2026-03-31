import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, ArrowRight } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto py-12 px-4 sm:px-6">
      
      {/* Title Area */}
      <div className="mb-12 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-6 shadow-sm">
          <span>Developed by Dulanaka Siriwardana</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-indigo-400 mb-6 tracking-tight leading-tight drop-shadow-sm">
          E-Commerce Analytics <br className="hidden sm:block" /> Dashboard
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl font-light max-w-2xl mx-auto leading-relaxed">
          Upload your <code className="bg-slate-800/80 text-indigo-300 px-2.5 py-1 rounded-md border border-slate-700/50 font-mono text-sm shadow-inner mx-1">Transaction Data</code> to unlock predictive insights and drive strategic growth.
        </p>
      </div>

      {/* Dropzone Area */}
      <div 
        className={`w-full group relative rounded-[2rem] p-1 transition-all duration-500 ${
          dragActive ? 'scale-[1.02]' : 'hover:scale-[1.01]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Animated Gradient Border */}
        <div className={`absolute inset-0 rounded-[2rem] opacity-50 blur-md transition-all duration-500 ${
          dragActive 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 opacity-100' 
            : 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 group-hover:opacity-100'
        }`}></div>
        
        {/* Inner Glass Container */}
        <div className={`relative glass-panel rounded-[1.875rem] p-10 sm:p-16 flex flex-col items-center justify-center cursor-pointer transition-colors duration-500 z-10 ${
          dragActive ? 'bg-indigo-950/40 border-indigo-500/50' : 'hover:bg-slate-900/50'
        }`}>
          
          <div className="relative mb-8">
            <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${
              dragActive ? 'bg-indigo-500/40 scale-150' : 'bg-indigo-500/10 group-hover:scale-125'
            }`}></div>
            <div className={`relative p-5 rounded-2xl border transition-all duration-500 ${
              dragActive 
                ? 'bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.3)]' 
                : 'bg-slate-800/80 border-slate-700 shadow-xl group-hover:border-indigo-500/30 group-hover:bg-slate-800'
            }`}>
              <UploadCloud className={`w-14 h-14 transition-colors duration-500 ${
                dragActive ? 'text-indigo-300' : 'text-slate-400 group-hover:text-indigo-400'
              }`} />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-slate-100 mb-3 tracking-wide">
            {dragActive ? 'Drop dataset here' : 'Drag & drop dataset'}
          </h3>
          <p className="text-slate-400 mb-8 text-center max-w-sm flex items-center justify-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            Supports standard CSV format up to 50MB
          </p>
          
          <label className="relative cursor-pointer group/btn">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-70 group-hover/btn:opacity-100 transition duration-300"></div>
            <div className="relative flex items-center gap-3 bg-slate-950 text-white px-8 py-3.5 rounded-full font-semibold border border-white/10 transition-transform duration-300 group-hover/btn:-translate-y-0.5 shadow-xl">
              <span>Browse Files</span>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover/btn:translate-x-1 transition-transform" />
              <input 
                type="file" 
                className="hidden" 
                accept=".csv" 
                onChange={handleChange} 
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
