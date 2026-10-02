import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OwnershipMatrix } from './components/OwnershipMatrix';
import { MoneyPool } from './components/MoneyPool';
import { DocumentFinder } from './components/DocumentFinder';
import { IceCardModal } from './components/IceCardModal';
import { SundayReset } from './components/SundayReset';
import { SettingsModal } from './components/SettingsModal';
import { GharButler } from './components/GharButler';
import { AlertTriangle } from 'lucide-react';

import {
  DEFAULT_TASKS,
  DEFAULT_EXPENSES,
  DEFAULT_DOCUMENTS,
  DEFAULT_EMERGENCY
} from './lib/defaultCatalog';

import {
  TaskOwnership,
  MoneyPoolState,
  ExpenseItem,
  DocumentPointer,
  EmergencyInfo,
  SundayResetLog,
  HouseholdSettings
} from './types/household';

import {
  loadFromLocal,
  saveToLocal,
  syncTabToSheet,
  getGoogleSheetUrl,
  KEYS
} from './lib/sheetsClient';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('ownership');
  const [isIceModalOpen, setIsIceModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Core State
  const [tasks, setTasks] = useState<TaskOwnership[]>(() =>
    loadFromLocal(KEYS.TASKS, DEFAULT_TASKS)
  );

  const [moneyState, setMoneyState] = useState<MoneyPoolState>(() =>
    loadFromLocal(KEYS.MONEY, {
      items: DEFAULT_EXPENSES,
      bufferRate: 0.15,
      splitModel: 'equal_50_50',
      partnerAName: 'Partner A',
      partnerBName: 'Partner B',
      partnerAIncome: 150000,
      partnerBIncome: 100000
    })
  );

  const [documents, setDocuments] = useState<DocumentPointer[]>(() =>
    loadFromLocal(KEYS.DOCS, DEFAULT_DOCUMENTS)
  );

  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo>(() =>
    loadFromLocal(KEYS.ICE, DEFAULT_EMERGENCY)
  );

  const [resetLogs, setResetLogs] = useState<SundayResetLog[]>(() =>
    loadFromLocal(KEYS.RESET, [])
  );

  const [settings, setSettings] = useState<HouseholdSettings>(() =>
    loadFromLocal(KEYS.SETTINGS, {
      householdName: 'Our Household',
      currencySymbol: '₹',
      googleSheetUrl: ''
    })
  );

  const isSynced = !!getGoogleSheetUrl();

  // Save to LocalStorage and trigger background sync
  const handleUpdateTasks = (updated: TaskOwnership[]) => {
    setTasks(updated);
    saveToLocal(KEYS.TASKS, updated);
    syncTabToSheet('Ownership', updated);
  };

  const handleUpdateMoney = (updated: MoneyPoolState) => {
    setMoneyState(updated);
    saveToLocal(KEYS.MONEY, updated);
    syncTabToSheet('Money_Pool', updated.items);
  };

  const handleAddExpense = (expense: ExpenseItem) => {
    const updated: MoneyPoolState = {
      ...moneyState,
      items: [expense, ...moneyState.items]
    };
    handleUpdateMoney(updated);
  };

  const handleUpdateDocuments = (updated: DocumentPointer[]) => {
    setDocuments(updated);
    saveToLocal(KEYS.DOCS, updated);
    syncTabToSheet('Doc_Index', updated);
  };

  const handleUpdateEmergencyInfo = (updated: EmergencyInfo) => {
    setEmergencyInfo(updated);
    saveToLocal(KEYS.ICE, updated);
  };

  const handleAddResetLog = (log: SundayResetLog) => {
    const updated = [log, ...resetLogs];
    setResetLogs(updated);
    saveToLocal(KEYS.RESET, updated);
    syncTabToSheet('Sunday_Reset', updated);
  };

  const handleUpdateSettings = (updated: HouseholdSettings) => {
    setSettings(updated);
    saveToLocal(KEYS.SETTINGS, updated);
  };

  // Data Export & Import
  const handleExportData = () => {
    const fullBackup = {
      settings,
      tasks,
      moneyState,
      documents,
      emergencyInfo,
      resetLogs,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `household-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tasks) handleUpdateTasks(parsed.tasks);
        if (parsed.moneyState) handleUpdateMoney(parsed.moneyState);
        if (parsed.documents) handleUpdateDocuments(parsed.documents);
        if (parsed.emergencyInfo) handleUpdateEmergencyInfo(parsed.emergencyInfo);
        if (parsed.resetLogs) setResetLogs(parsed.resetLogs);
        if (parsed.settings) handleUpdateSettings(parsed.settings);
        alert('Data successfully imported and synchronized!');
        setIsSettingsOpen(false);
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all chores, expenses, and documents to GrowthX default catalog?')) {
      handleUpdateTasks(DEFAULT_TASKS);
      handleUpdateMoney({
        items: DEFAULT_EXPENSES,
        bufferRate: 0.15,
        splitModel: 'equal_50_50',
        partnerAName: 'Partner A',
        partnerBName: 'Partner B',
        partnerAIncome: 150000,
        partnerBIncome: 100000
      });
      handleUpdateDocuments(DEFAULT_DOCUMENTS);
      handleUpdateEmergencyInfo(DEFAULT_EMERGENCY);
      setIsSettingsOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        householdName={settings.householdName}
        isSynced={isSynced}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Google Sheet Connection Warning Banner */}
      {!isSynced && (
        <div className="bg-terra/10 border-b border-terra/30 py-2.5 px-4 text-xs font-mono text-terra">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-terra" />
              <span>
                <b>Google Sheet Not Connected:</b> Data is currently saving only in local memory on this device. Set <code className="bg-paper px-1 py-0.5 rounded border border-terra/30 text-ink">VITE_GOOGLE_SHEET_URL</code> in Vercel to sync across all household devices.
              </span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="underline font-semibold hover:text-ink shrink-0 ml-6 sm:ml-0"
            >
              How to Connect &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'ownership' && (
          <OwnershipMatrix
            tasks={tasks}
            onUpdateTasks={handleUpdateTasks}
          />
        )}

        {activeTab === 'money' && (
          <MoneyPool
            moneyState={moneyState}
            onUpdateMoney={handleUpdateMoney}
            currencySymbol={settings.currencySymbol}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentFinder
            documents={documents}
            onUpdateDocuments={handleUpdateDocuments}
            onOpenIceModal={() => setIsIceModalOpen(true)}
          />
        )}

        {activeTab === 'reset' && (
          <SundayReset
            logs={resetLogs}
            onAddLog={handleAddResetLog}
            tasks={tasks}
            moneyState={moneyState}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-rule bg-plate/60 py-6 mt-12 text-center text-xs font-mono text-muted">
        <div className="max-w-7xl mx-auto px-4">
          <span>HOUSEHOLD OS · ZERO DEVOPS · ZERO FRICTION</span>
          <span className="block text-[10px] text-faint mt-1">
            Sharing the load starts with sharing the system. Built for GrowthX Live Sprint.
          </span>
        </div>
      </footer>

      {/* Modals */}
      <IceCardModal
        isOpen={isIceModalOpen}
        onClose={() => setIsIceModalOpen(false)}
        info={emergencyInfo}
        onUpdateInfo={handleUpdateEmergencyInfo}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetDefaults={handleResetDefaults}
      />

      {/* Autonomous Ghar Butler (Hermes 3) */}
      <GharButler
        tasks={tasks}
        moneyState={moneyState}
        emergencyInfo={emergencyInfo}
        onAddExpense={handleAddExpense}
        onUpdateTasks={handleUpdateTasks}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
    </div>
  );
};
