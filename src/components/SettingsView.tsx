
import React, { useState, useRef } from 'react';
import { ArrowLeft, Settings, Download, Upload, Trash2, ShieldAlert, FileJson, CheckCircle2, AlertCircle } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [showClearModal, setShowClearModal] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STORAGE_KEYS = {
    checklist: 'minecraft_checklist_v1',
    gear: 'mc_gear_progress_v1',
    notes: 'minecraft_notes_v2'
  };

  const handleExport = () => {
    const data = {
      checklist: JSON.parse(localStorage.getItem(STORAGE_KEYS.checklist) || '{}'),
      gear: JSON.parse(localStorage.getItem(STORAGE_KEYS.gear) || '{}'),
      notes: JSON.parse(localStorage.getItem(STORAGE_KEYS.notes) || '[]'),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `minecraft_utils_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Basic validation
        if (!json.checklist && !json.gear && !json.notes) {
          throw new Error("Invalid backup file format.");
        }

        if (json.checklist) localStorage.setItem(STORAGE_KEYS.checklist, JSON.stringify(json.checklist));
        if (json.gear) localStorage.setItem(STORAGE_KEYS.gear, JSON.stringify(json.gear));
        if (json.notes) localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(json.notes));

        setImportStatus({ type: 'success', message: 'Data restored successfully! Refreshing...' });
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        setImportStatus({ type: 'error', message: 'Failed to import: ' + (err as Error).message });
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg mb-8">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button 
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Menu
          </button>
          
          <div className="flex items-center gap-3">
             <div className="bg-zinc-800 p-2 rounded-lg border border-zinc-700">
               <Settings className="text-zinc-300" size={24} />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-white">Settings</h1>
               <p className="text-xs text-zinc-400">Data portability and app management</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 space-y-8">
        {/* Backup Section */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert size={20} className="text-emerald-400" /> Data Portability
            </h2>
            <p className="text-sm text-zinc-400 mt-1">Export your checklists and notes to a file, or restore them from a previous backup.</p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Card */}
            <button 
              onClick={handleExport}
              className="flex flex-col items-center justify-center p-8 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
            >
              <div className="p-4 bg-emerald-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Download size={32} className="text-emerald-400" />
              </div>
              <h3 className="font-bold text-white">Export Backup</h3>
              <p className="text-xs text-zinc-500 text-center mt-2">Download a .json file containing all your locally saved progress.</p>
            </button>

            {/* Import Card */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group cursor-pointer"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".json" 
                className="hidden" 
              />
              <div className="p-4 bg-blue-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Upload size={32} className="text-blue-400" />
              </div>
              <h3 className="font-bold text-white">Import Backup</h3>
              <p className="text-xs text-zinc-500 text-center mt-2">Upload a previously exported .json file to restore your data.</p>
            </div>
          </div>

          {importStatus && (
            <div className={`mx-6 mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${
              importStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {importStatus.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-medium">{importStatus.message}</span>
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="bg-zinc-900 border border-red-900/30 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 size={20} className="text-red-500" /> Danger Zone
            </h2>
            <p className="text-sm text-zinc-400 mt-1">Actions that cannot be undone.</p>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-zinc-200 text-sm">Wipe Local Storage</h3>
                <p className="text-xs text-zinc-500">Delete all enchantments, loadouts, and notes from this browser.</p>
              </div>
              <button 
                onClick={() => setShowClearModal(true)}
                className="px-6 py-2 bg-red-950/30 hover:bg-red-600 border border-red-900/50 text-red-400 hover:text-white rounded-lg transition-all font-bold text-xs uppercase tracking-widest"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </section>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-xs text-zinc-500 italic">
          <FileJson size={16} className="shrink-0 text-zinc-600" />
          <p>Backups are stored entirely in your browser's local storage and are not sent to any server. Exporting allows you to manually move your data between devices.</p>
        </div>
      </main>

      <ConfirmationModal 
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearAll}
        title="Wipe All Data?"
        message="This will permanently delete all your checklists, gear progress, and notes. This action is irreversible unless you have a backup file."
        confirmText="Yes, Wipe Everything"
      />
    </div>
  );
};
