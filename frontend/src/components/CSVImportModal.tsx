import React, { useState, useRef } from 'react';
import { Upload, X, AlertTriangle, CheckCircle, FileText, Download } from 'lucide-react';
import { api } from '../services/api';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await api.importCSV(file);
      setResult(res);
      if (res.success) {
        onSuccess();
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'File upload failed',
        errors: [{ row: 0, error: err.message }],
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      "transaction_reference,account_id,amount,currency,merchant_name,merchant_category,transaction_type,channel,country_code,is_international,timestamp\n" +
      "TXN-SAMPLE-001,ACC-1001,84.50,USD,Whole Foods Market,Groceries,POS,IN_STORE,US,False,2026-10-20 14:30:00\n" +
      "TXN-SAMPLE-002,ACC-1002,1850.00,USD,Apple Store Fifth Ave,Electronics,ONLINE,WEB,US,False,2026-10-20 16:45:00\n" +
      "TXN-SAMPLE-003,ACC-1003,3420.00,EUR,Binance US Exchange,Crypto/Gaming,WIRE_TRANSFER,API,GB,True,2026-10-21 02:15:00\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finguard_sample_transactions_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-hidden relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Import Transaction Batch (CSV)</h3>
              <p className="text-xs text-slate-400">Ingest, validate, and score financial ledger transactions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Drag & drop box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              file
                ? 'border-teal-500/50 bg-teal-500/5'
                : 'border-slate-700 hover:border-slate-500 bg-navy-950/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <FileText className={`w-8 h-8 mx-auto mb-2 ${file ? 'text-teal-400' : 'text-slate-500'}`} />
            {file ? (
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Drop CSV file here, or <span className="text-teal-400 hover:underline">browse</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Required columns: transaction_reference, account_id, amount, merchant_name, merchant_category
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Encoding: UTF-8 / ASCII CSV</span>
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Download Sample CSV
            </button>
          </div>

          {/* Results Feedback */}
          {result && (
            <div
              className={`p-4 rounded-xl border text-xs ${
                result.success
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div className="space-y-1.5 flex-1">
                  <p className="font-semibold">{result.message}</p>
                  {result.imported_count !== undefined && (
                    <div className="grid grid-cols-3 gap-2 py-1 text-[11px] font-mono">
                      <div>Imported: <span className="text-emerald-400 font-bold">{result.imported_count}</span></div>
                      <div>Flagged: <span className="text-rose-400 font-bold">{result.flagged_count || 0}</span></div>
                      <div>Rejected: <span className="text-amber-400 font-bold">{result.rejected_count || 0}</span></div>
                    </div>
                  )}

                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-2 max-h-36 overflow-y-auto space-y-1 bg-navy-950/80 p-2.5 rounded-lg border border-rose-500/20">
                      <p className="font-semibold text-rose-400 text-[11px] uppercase tracking-wider">
                        Validation Exceptions ({result.errors.length}):
                      </p>
                      {result.errors.map((err: any, i: number) => (
                        <div key={i} className="text-[11px] text-slate-300 font-mono">
                          Row {err.row}: {err.error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-5 py-2 text-xs font-medium bg-teal-500 hover:bg-teal-400 text-navy-950 font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {isUploading ? 'Validating & Ingesting...' : 'Upload & Validate'}
          </button>
        </div>
      </div>
    </div>
  );
};
