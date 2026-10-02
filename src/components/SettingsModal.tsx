import React, { useState } from 'react';
import { HouseholdSettings } from '../types/household';
import { testConnection, getGoogleSheetUrl } from '../lib/sheetsClient';
import { getAISettings, saveAISettings } from '../lib/hermesClient';
import { AISettings, AIProvider } from '../types/agent';
import { X, Check, Globe, Download, Upload, AlertTriangle, Key, Sparkles, Bot, ExternalLink } from 'lucide-react';

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
  const [householdName, setHouseholdName] = useState(settings.householdName || 'Our Household');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || '₹');
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<boolean | null>(null);

  // AI & Hermes State
  const [aiSettings, setAiState] = useState<AISettings>(() => getAISettings());
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);

  const activeSheetUrl = getGoogleSheetUrl();
  const isConfigured = !!activeSheetUrl;

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      householdName: householdName.trim() || 'Our Household',
      currencySymbol
    });
    saveAISettings(aiSettings);
    onClose();
  };

  const handleTestPing = async () => {
    if (!activeSheetUrl) return;
    setTestingPing(true);
    setPingResult(null);
    const ok = await testConnection(activeSheetUrl);
    setTestingPing(false);
    setPingResult(ok);
  };

  const handleTestAi = async () => {
    if (!aiSettings.apiKey) {
      setAiTestResult('Please enter an API key first.');
      return;
    }
    setIsTestingAi(true);
    setAiTestResult(null);
    try {
      const endpoint = aiSettings.provider === 'openrouter'
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.groq.com/openai/v1/chat/completions';
      const model = aiSettings.provider === 'openrouter'
        ? (aiSettings.model || 'nousresearch/hermes-3-llama-3.1-405b:free')
        : 'llama-3.3-70b-versatile';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiSettings.apiKey}`,
          ...(aiSettings.provider === 'openrouter' ? {
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Household OS Test'
          } : {})
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Respond with: "Hermes 3 Online"' }],
          max_tokens: 15
        })
      });

      if (res.ok) {
        setAiTestResult('✅ Hermes 3 connection verified successfully!');
      } else {
        const err = await res.text();
        setAiTestResult(`❌ Connection failed (${res.status}): ${err.slice(0, 100)}`);
      }
    } catch (e: any) {
      setAiTestResult(`❌ Error: ${e.message}`);
    } finally {
      setIsTestingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-plate border border-ink p-6 rounded-lg max-w-lg w-full shadow-2xl animate-fadeIn my-8">
        
        <div className="flex items-center justify-between pb-3 border-b border-grid">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-display font-semibold text-ink">
              Household OS Settings
            </h3>
          </div>
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

          {/* AI Brain & Hermes 3 Settings */}
          <div className="pt-3 border-t border-grid space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="block text-[10px] font-mono text-terra uppercase font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-terra" />
                AI Brain · Hermes 3 Configuration
              </span>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-muted hover:text-terra flex items-center gap-1 underline"
              >
                Get OpenRouter Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-muted mb-1">AI Provider</label>
                <select
                  value={aiSettings.provider}
                  onChange={(e) => setAiState({ ...aiSettings, provider: e.target.value as AIProvider })}
                  className="w-full p-2 bg-paper border border-rule rounded text-ink font-mono"
                >
                  <option value="openrouter">OpenRouter (Hermes 3)</option>
                  <option value="groq">Groq (Llama 3.3 Fast)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-muted mb-1">Model Name</label>
                <input
                  type="text"
                  value={aiSettings.model}
                  onChange={(e) => setAiState({ ...aiSettings, model: e.target.value })}
                  placeholder="nousresearch/hermes-3-llama-3.1-405b:free"
                  className="w-full p-2 bg-paper border border-rule rounded text-ink font-mono text-[10px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-muted mb-1">API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={aiSettings.apiKey}
                  onChange={(e) => setAiState({ ...aiSettings, apiKey: e.target.value })}
                  placeholder="sk-or-v1-..."
                  className="flex-1 p-2 bg-paper border border-rule rounded text-ink font-mono text-xs focus:outline-none focus:border-terra"
                />
                <button
                  type="button"
                  onClick={handleTestAi}
                  disabled={isTestingAi}
                  className="px-3 py-1 bg-plate border border-rule-2 rounded text-[10px] font-mono uppercase text-ink hover:border-terra disabled:opacity-50"
                >
                  {isTestingAi ? 'Testing...' : 'Test'}
                </button>
              </div>
            </div>

            {aiTestResult && (
              <div className="text-[10px] font-mono p-1.5 rounded bg-plate border border-rule">
                {aiTestResult}
              </div>
            )}

            {/* Option A Documentation Callout */}
            <div className="p-2.5 bg-plate border border-rule-2 rounded space-y-1 text-[11px] text-body">
              <div className="font-semibold text-ink flex items-center gap-1 text-[11px]">
                <Key className="w-3 h-3 text-terra" />
                Option A: Uncapped Hermes 3 (\$1–\$5 Deposit)
              </div>
              <p className="text-[10px] text-muted leading-relaxed">
                The free model (<code className="text-terra">hermes-3-llama-3.1-405b:free</code>) has a 50 req/day limit and peak-hour queue delays. Depositing <b>\$1 to \$5 on OpenRouter</b> unlocks instant, uncapped priority routing (millions of tokens for pennies).
              </p>
              <div className="text-[9px] text-faint font-mono pt-1">
                *Note: OpenRouter rates, model availability, and free tier limits as of 1st Oct 2026.
              </div>
            </div>
          </div>

          {/* Google Sheet Connection Status */}
          <div className="pt-3 border-t border-grid space-y-2">
            <span className="block text-[10px] font-mono text-muted uppercase font-semibold">
              Google Sheet Cloud Sync Status
            </span>

            {isConfigured ? (
              <div className="p-3 bg-sage/10 border border-sage/30 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sage font-mono text-xs font-semibold">
                    <Check className="w-4 h-4" />
                    <span>Connected via Vercel (VITE_GOOGLE_SHEET_URL)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestPing}
                    disabled={testingPing}
                    className="px-2.5 py-1 bg-plate border border-sage/40 rounded text-[10px] font-mono uppercase text-sage hover:bg-sage/20 disabled:opacity-50"
                  >
                    {testingPing ? 'Pinging...' : 'Test Ping'}
                  </button>
                </div>
                <div className="text-[10px] font-mono text-faint truncate">
                  Endpoint: {activeSheetUrl.slice(0, 38)}...{activeSheetUrl.slice(-10)}
                </div>
                {pingResult === true && (
                  <div className="text-[10px] font-mono text-sage pt-1 border-t border-sage/20">
                    &bull; Live ping verified. All changes sync in background.
                  </div>
                )}
                {pingResult === false && (
                  <div className="text-[10px] font-mono text-terra pt-1 border-t border-terra/20">
                    &bull; Warning: Ping failed. Check Google Apps Script deployment access.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 bg-terra/10 border border-terra/30 rounded space-y-2">
                <div className="flex items-center gap-2 text-terra font-mono text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Google Sheet Not Connected</span>
                </div>
                <p className="text-[11px] text-body leading-relaxed">
                  Your household data is currently saving <b>only on this device</b>. Set <code className="text-terra">VITE_GOOGLE_SHEET_URL</code> in Vercel to sync across all family phones and laptops.
                </p>
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
