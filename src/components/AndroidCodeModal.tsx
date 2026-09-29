import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  FolderTree, 
  ExternalLink,
  Sparkles,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../services/androidProjectFiles';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add all files into the zip
      ANDROID_PROJECT_FILES.forEach(f => {
        zip.file(f.path, f.content);
      });

      // Generate zip blob
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'RestroWaiter-Android-Project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error creating zip bundle');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[88vh] shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Android Studio Kotlin Project Generator</h2>
              <p className="text-xs text-slate-400 font-mono">RestroWaiter APK • Jetpack • minSdk 24 • targetSdk 34</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Download className={`w-3.5 h-3.5 ${isZipping ? 'animate-bounce' : ''}`} />
              {isZipping ? 'Creating ZIP...' : 'Download Complete Android Project (.ZIP)'}
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Two-Pane Code Browser */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          
          {/* File Tree Sidebar */}
          <div className="w-64 sm:w-72 bg-slate-950/70 border-r border-slate-800 flex flex-col min-h-0 overflow-y-auto p-3 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5" />
              Project File Hierarchy
            </div>

            {ANDROID_PROJECT_FILES.map(file => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2 rounded-xl text-xs font-mono transition-all truncate block cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/40' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                  title={file.path}
                >
                  <span className="block truncate">{file.path.split('/').pop()}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{file.path}</span>
                </button>
              );
            })}
          </div>

          {/* Main Code View */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900 overflow-hidden">
            
            {/* File Info Bar */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="truncate pr-2">
                <span className="font-mono font-bold text-amber-400 block truncate">{selectedFile.path}</span>
                <span className="text-[11px] text-slate-400">{selectedFile.description}</span>
              </div>

              <button
                onClick={handleCopyCurrent}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 text-xs transition-colors shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied File!' : 'Copy Code'}
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed bg-[#0b0f19] text-slate-200 select-text">
              <pre className="whitespace-pre-wrap font-mono">
                {selectedFile.content}
              </pre>
            </div>

            {/* Bottom Instructions */}
            <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between px-4">
              <span>Ready for Android Studio: Build with <code>./gradlew assembleDebug</code></span>
              <span className="text-amber-400">Includes Room, OkHttp, WorkManager, ESC-POS thermal lib</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
