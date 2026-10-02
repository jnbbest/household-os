import React from 'react';
import { Home, Users, DollarSign, FileText, CalendarCheck, Settings, CheckCircle2, CloudOff } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  householdName: string;
  isSynced: boolean;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  householdName,
  isSynced,
  onOpenSettings
}) => {
  const tabs = [
    { id: 'ownership', label: 'Ownership', icon: Users, num: '01' },
    { id: 'money', label: 'Money Pool', icon: DollarSign, num: '02' },
    { id: 'documents', label: 'Documents', icon: FileText, num: '03' },
    { id: 'reset', label: 'Sunday Reset', icon: CalendarCheck, num: '04' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-plate/95 backdrop-blur border-b border-rule shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-terra flex items-center justify-center text-white shadow-inner">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-terra uppercase block font-semibold">
                HOUSEHOLD OS
              </span>
              <h1 className="text-lg font-display font-semibold text-ink leading-tight">
                {householdName || 'Our Household'}
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-paper/80 p-1 rounded-lg border border-rule">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-plate text-terra font-semibold shadow-sm border border-rule-2'
                      : 'text-muted hover:text-ink hover:bg-plate/50'
                  }`}
                >
                  <span className="font-mono text-[10px] text-faint">{tab.num}</span>
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Sync Badge & Settings */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSettings}
              title={isSynced ? "Connected to Google Sheets" : "Running in Local Storage"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-colors ${
                isSynced 
                  ? 'bg-sage/10 text-sage border-sage/30' 
                  : 'bg-brass/10 text-brass border-brass/30'
              }`}
            >
              {isSynced ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sheets Synced</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Local Storage</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 text-muted hover:text-ink hover:bg-paper rounded-lg border border-rule transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden border-t border-grid py-2 gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded text-[11px] font-medium transition-colors ${
                  isActive ? 'bg-paper text-terra font-semibold' : 'text-muted'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
