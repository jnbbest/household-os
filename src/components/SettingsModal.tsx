import React, { useState } from 'react';
import { HouseholdSettings } from '../types/household';
import { testConnection } from '../lib/sheetsClient';
import { X, Check, Globe, Download, Upload, AlertTriangle, Key } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: HouseholdSettings;
  onUpdateSettings: (updated: HouseholdSettings) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetDefaults
}) => {
  const [sheetUrl, setSheetUrl] = useState(settings.googleSheetUrl || '');
  const [householdName, setHouseholdName] = useState(settings.householdName || 'Our Household');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || '₹');
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      householdName: householdName.trim() || 'Our Household',
      currencySymbol,
      googleSheetUrl: sheetUrl.trim()
    });
    onClose();
  };

  const handleTestPing = async () => {
    if (!sheetUrl.trim()) return;
    setTestingPing(true);
    setPingResult(null);
    const ok = await testConnection(sheetUrl.trim());
    setTestingPing(false);
    setPingResult(ok);
  };

  return (
    <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-plate border border-ink p-6 rounded-lg max-w-lg w-full shadow-2xl animate-fadeIn my-8">
        
        <div className="flex items-center justify-between pb-3 border-b border-grid">
          <h3 className="text-lg font-display font-semibold text-ink">
            Household OS Settings
          </h3>
          <button onClick={onClose} className="p-1 text-muted hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs mt-4">
          
          {/* Household Name & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] font-mono text-muted uppercase mb-1">Household Name</label>
              <input
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                className="w-full p-2 bg-paper border border-rule rounded text-ink focus:outline-none focus:border-terra"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-muted uppercase mb-1">Currency</label>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full p-2 bg-paper border border-rule rounded text-ink font-mono focus:outline-none focus:border-terra"
              >
                <option value="₹">₹ (INR)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
              </select>
            </div>
          </div>

          {/* Google Sheet Webhook URL */}
          <div className="pt-2 border-t border-grid space-y-2">
            <label className="block text-[10px] font-mono text-terra uppercase font-semibold">
              Google Apps Script Webhook URL
            </label>
            <p className="text-[11px] text-body">
              Can be set in Vercel Environment Variables (<code>VITE_GOOGLE_SHEET_URL</code>) or entered below as a local override:
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={sheetUrl}
                onChange={(e) => {
                  setSheetUrl(e.target.value);
                  setPingResult(null);
                }}
                className="flex-1 p-2 bg-paper border border-rule rounded text-ink font-mono text-[11px] focus:outline-none focus:border-terra truncate"
              />
              <button
                type="button"
                onClick={handleTestPing}
                disabled={testingPing || !sheetUrl.trim()}
                className="px-3 py-2 bg-paper border border-rule rounded text-xs font-mono uppercase text-muted hover:text-ink disabled:opacity-50"
              >
                {testingPing ? 'Pinging...' : 'Test Ping'}
              </button>
            </div>

            {pingResult === true && (
              <div className="text-[11px] font-mono text-sage flex items-center gap-1.5 pt-1">
                <Check className="w-3.5 h-3.5" />
                <span>Connection Verified! Ready for live sheet synchronization.</span>
              </div>
            )}
            {pingResult === false && (
              <div className="text-[11px] font-mono text-terra flex items-center gap-1.5 pt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Connection Failed. Make sure Web App is deployed with Access: "Anyone".</span>
              </div>
            )}
          </div>

          {/* Backup & Data Recovery */}
          <div className="pt-3 border-t border-grid space-y-2">
            <span className="block text-[10px] font-mono text-muted uppercase">Backup & Data Recovery</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExportData}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-paper border border-rule rounded text-xs font-mono text-ink hover:bg-plate"
              >
                <Download className="w-3.5 h-3.5 text-terra" />
                <span>Export JSON</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-paper border border-rule rounded text-xs font-mono text-ink hover:bg-plate cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-sage" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportData}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={onResetDefaults}
                className="ml-auto text-[11px] font-mono text-faint hover:text-terra underline"
              >
                Reset Catalog
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-grid">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-rule rounded text-muted hover:text-ink font-mono text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-terra text-white rounded font-mono text-xs hover:bg-terra-light font-semibold"
            >
              Save Settings
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
