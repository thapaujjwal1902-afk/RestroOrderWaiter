import React, { useState } from 'react';
import { 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  FileText, 
  Copy, 
  ExternalLink,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { PrintJob, PrinterConfig } from '../types';

interface TabPrintsProps {
  printJobs: PrintJob[];
  printers: PrinterConfig[];
  onRetryJob: (jobId: string) => void;
  onSetPrinterStatus: (printerId: string, status: 'OK' | 'PAPER_OUT' | 'COVER_OPEN' | 'OFFLINE') => void;
}

export const TabPrints: React.FC<TabPrintsProps> = ({
  printJobs,
  printers,
  onRetryJob,
  onSetPrinterStatus
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(printJobs[0]?.id || '');
  const [copied, setCopied] = useState(false);

  const selectedJob = printJobs.find(j => j.id === selectedJobId) || printJobs[0];

  const handleCopySlip = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (job: PrintJob) => {
    switch (job.status) {
      case 'PRINTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> PRINTED ✓
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> PENDING
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> FAILED ({job.failureReason})
          </span>
        );
      case 'RETRYING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
            RETRYING ⟳
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Sub-Header: Station Health Strip (F9.5) */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Printer className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">ESC/POS Thermal Printing Queue</span>
          <span className="text-slate-400 font-mono">(WorkManager + savePrintCount)</span>
        </div>

        {/* Printer Station Status Dots */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {printers.map(p => {
            const isOk = p.status === 'OK';
            return (
              <div 
                key={p.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[11px]"
              >
                <span className={`w-2 h-2 rounded-full ${isOk ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'}`} />
                <span className="text-slate-300 font-medium truncate max-w-[100px]">{p.name}</span>
                <button
                  onClick={() => onSetPrinterStatus(p.id, isOk ? 'PAPER_OUT' : 'OK')}
                  className={`text-[9px] px-1 rounded uppercase font-mono font-bold cursor-pointer ${
                    isOk ? 'bg-slate-700 text-slate-400 hover:text-rose-300' : 'bg-rose-500 text-white'
                  }`}
                  title="Toggle hardware fault simulator (Paper Out / Cover Open)"
                >
                  {p.status}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Pane Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        
        {/* Left Pane: Print Jobs Log Table */}
        <div className="w-full md:w-[380px] lg:w-[420px] border-r border-slate-800 flex flex-col min-h-0 bg-slate-900/50 overflow-hidden">
          <div className="p-3 overflow-y-auto space-y-2 flex-1">
            {printJobs.map(job => {
              const isSelected = selectedJob?.id === job.id;
              const isFailed = job.status === 'FAILED';

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/30' 
                      : isFailed 
                        ? 'bg-rose-500/10 border-rose-500/40 hover:bg-slate-800' 
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{job.slipNumber}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {job.role}
                      </span>
                    </div>
                    {getStatusBadge(job)}
                  </div>

                  <p className="text-xs text-slate-300 mb-1">
                    {job.tableName} • {job.stationName}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {job.time}
                    </span>
                    <span>By: {job.printedBy.split(' ')[0]}</span>
                  </div>

                  {/* Failed Quick Retry */}
                  {isFailed && (
                    <div className="mt-2 pt-2 border-t border-rose-500/20 flex items-center justify-between">
                      <span className="text-[11px] text-rose-400 font-medium">Fault: {job.failureReason}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetryJob(job.id);
                        }}
                        className="px-2 py-0.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Retry Now
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Monospace Thermal Receipt Visualizer */}
        <div className="flex-1 bg-slate-950 flex flex-col min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 items-center justify-start">
          {selectedJob ? (
            <div className="max-w-md w-full space-y-4">
              
              {/* Slip Toolbar */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-white block">{selectedJob.slipNumber}</span>
                  <span className="text-slate-400 text-[11px]">Station: {selectedJob.stationName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopySlip(selectedJob.content)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>

                  <button
                    onClick={() => onRetryJob(selectedJob.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reprint (F8.7)
                  </button>
                </div>
              </div>

              {/* Realistic ESC/POS Thermal Paper Preview */}
              <div className="relative bg-[#fffef0] text-slate-900 p-6 rounded-t-lg shadow-2xl font-mono text-xs leading-relaxed select-text border border-amber-200">
                {/* Paper header watermark */}
                <div className="text-[10px] text-slate-400 uppercase tracking-widest text-center border-b border-dashed border-slate-300 pb-2 mb-3">
                  ** 80mm / 42-col Thermal Slip Print Preview **
                </div>

                {/* Preformatted receipt body */}
                <pre className="whitespace-pre-wrap font-mono text-[11px] sm:text-xs">
                  {selectedJob.content}
                </pre>

                {/* Audit DB Stamp */}
                <div className="text-[10px] text-slate-500 text-center border-t border-dashed border-slate-300 pt-3 mt-3">
                  DB Log: savePrintCount(SMID: {selectedJob.smid}, Status: {selectedJob.status})
                </div>

                {/* Jagged Sawtooth Paper Tear Effect at bottom */}
                <div 
                  className="absolute -bottom-3 left-0 right-0 h-3 bg-repeat-x bg-[length:12px_12px]"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #fffef0 25%, transparent 25%), linear-gradient(225deg, #fffef0 25%, transparent 25%)'
                  }}
                />
              </div>

              {/* Fallback Note (F8.5) */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-center">
                <span>If raw TCP/USB thermal printer is unreachable, fallback to Android system PrintManager generates instant PDF slip preview.</span>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              Select a print job to preview authentic thermal slip output.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
