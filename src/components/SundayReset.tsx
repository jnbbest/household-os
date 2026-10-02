import React, { useState } from 'react';
import { SundayResetLog, TaskOwnership, MoneyPoolState } from '../types/household';
import { getGoogleCalendarUrl, downloadIcsFile } from '../lib/calendarHelper';
import { Calendar, Sparkles, Copy, Check, Clock, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SundayResetProps {
  logs: SundayResetLog[];
  onAddLog: (log: SundayResetLog) => void;
  tasks: TaskOwnership[];
  moneyState: MoneyPoolState;
}

export const SundayReset: React.FC<SundayResetProps> = ({
  logs,
  onAddLog,
  tasks,
  moneyState
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Current session checks
  const [choresReviewed, setChoresReviewed] = useState(false);
  const [staffLedgerCleared, setStaffLedgerCleared] = useState(false);
  const [billsVerified, setBillsVerified] = useState(false);
  const [menuGenerated, setMenuGenerated] = useState(false);
  const [resetNotes, setResetNotes] = useState('');

  const nextSundayDate = new Date();
  nextSundayDate.setDate(nextSundayDate.getDate() + ((7 - nextSundayDate.getDay()) % 7 || 7));
  const dateStr = nextSundayDate.toISOString().split('T')[0];

  const handleFinishReset = () => {
    const newLog: SundayResetLog = {
      id: `reset-${Date.now()}`,
      weekStarting: dateStr,
      choresReviewed,
      staffLedgerCleared,
      billsAutodebitVerified: billsVerified,
      weeklyAIMenuGenerated: menuGenerated,
      notes: resetNotes.trim()
    };

    onAddLog(newLog);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#56704d', '#bd4e29', '#a07a26']
    });

    setCurrentStep(1);
    setChoresReviewed(false);
    setStaffLedgerCleared(false);
    setBillsVerified(false);
    setMenuGenerated(false);
    setResetNotes('');
  };

  const masterAIPrompt = 
`You are the Chief Operations Officer of our household. Review our current household setup and generate our upcoming week's operational briefing.

Household Context:
- Partners: ${moneyState.partnerAName} & ${moneyState.partnerBName}
- Total Pending Chores: ${tasks.filter(t => t.status === 'pending').length}
- Diet preferences: Balanced, home-cooked Indian meals, low oil
- Schedule: Monday to Saturday cook briefing needed

Please output:
1. 7-Day Dinner & Lunch Menu (simple, seasonal, minimal repetition).
2. Consolidated Grocery & Vegetable Shopping List organized by category (Produce, Dairy, Pantry Staples) for quick-commerce ordering.
3. Cook Briefing Script (2-3 bullet points ready to copy-paste to WhatsApp for the cook Monday morning).
4. 3 Critical Operational Alarms for this week.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(masterAIPrompt).then(() => {
      setCopiedPrompt(true);
      setMenuGenerated(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-plate border border-ink p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-terra uppercase font-semibold">
              BLOCK 4 · THE 15-MINUTE SUNDAY RESET
            </span>
            <h2 className="text-2xl font-display font-semibold text-ink mt-1">
              Weekly Household Alignment & Cadence
            </h2>
            <p className="text-sm text-body mt-1 max-w-2xl">
              15 minutes every Sunday at 9:00 AM over morning coffee replaces constant daily friction with a calm, synchronized household.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-paper border border-rule px-3.5 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-ink hover:bg-plate transition-colors"
            >
              <Calendar className="w-4 h-4 text-terra" />
              <span>Sync Google Calendar</span>
            </a>
            <button
              onClick={downloadIcsFile}
              className="px-3 py-2 border border-rule rounded-lg text-xs font-mono text-muted hover:text-ink bg-paper"
              title="Download Apple / Outlook .ics File"
            >
              .ICS
            </button>
          </div>
        </div>
      </div>

      {/* Stepper Guide */}
      <div className="bg-plate border border-rule p-6 rounded-lg space-y-6">
        <div className="flex items-center justify-between border-b border-grid pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-terra" />
            <h3 className="text-base font-display font-semibold text-ink">
              15-Minute Reset Stepper (Target: Sunday 09:00 AM)
            </h3>
          </div>
          <span className="text-xs font-mono text-muted">
            Step {currentStep} of 4
          </span>
        </div>

        {/* Step 1: Chores */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-terra font-semibold">
                MINUTES 00–04 · SCHEDULE & CHORES ALIGNMENT
              </span>
              <h4 className="text-lg font-display font-semibold text-ink mt-0.5">
                Review Upcoming Week's Calendar & Travel
              </h4>
              <p className="text-xs text-body mt-1">
                Is anyone traveling for work or facing crunch hours? Reassign tasks from Primary to Backup owners now so nobody drops the ball.
              </p>
            </div>

            <label className="flex items-center gap-3 p-3 bg-paper rounded border border-rule cursor-pointer">
              <input
                type="checkbox"
                checked={choresReviewed}
                onChange={(e) => setChoresReviewed(e.target.checked)}
                className="w-4 h-4 accent-terra"
              />
              <span className="text-xs text-ink font-medium">
                We reviewed our week's travel schedule and confirmed chore ownership.
              </span>
            </label>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-terra text-white px-4 py-2 rounded text-xs font-mono uppercase tracking-wider font-semibold hover:bg-terra-light"
              >
                Next: Staff Ledger &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Staff */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-sage font-semibold">
                MINUTES 05–08 · DOMESTIC STAFF CHECK
              </span>
              <h4 className="text-lg font-display font-semibold text-ink mt-0.5">
                Staff Attendance, Leave & Advances
              </h4>
              <p className="text-xs text-body mt-1">
                Confirm cook and maid leaves taken this week. Check if any festival advances were requested to keep salaries accurate.
              </p>
            </div>

            <label className="flex items-center gap-3 p-3 bg-paper rounded border border-rule cursor-pointer">
              <input
                type="checkbox"
                checked={staffLedgerCleared}
                onChange={(e) => setStaffLedgerCleared(e.target.checked)}
                className="w-4 h-4 accent-terra"
              />
              <span className="text-xs text-ink font-medium">
                Maid and cook attendance verified; salary ledger is up to date.
              </span>
            </label>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="border border-rule px-4 py-2 rounded text-xs font-mono text-muted"
              >
                &larr; Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-terra text-white px-4 py-2 rounded text-xs font-mono uppercase tracking-wider font-semibold hover:bg-terra-light"
              >
                Next: Autopay Audit &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Autopay */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-brass font-semibold">
                MINUTES 09–12 · AUTOPAY & BILLS
              </span>
              <h4 className="text-lg font-display font-semibold text-ink mt-0.5">
                Verify Autopay & Insurance Renewals
              </h4>
              <p className="text-xs text-body mt-1">
                Confirm electricity, wifi, and society maintenance transactions went through. Zero late fees guaranteed.
              </p>
            </div>

            <label className="flex items-center gap-3 p-3 bg-paper rounded border border-rule cursor-pointer">
              <input
                type="checkbox"
                checked={billsVerified}
                onChange={(e) => setBillsVerified(e.target.checked)}
                className="w-4 h-4 accent-terra"
              />
              <span className="text-xs text-ink font-medium">
                All monthly recurring bills confirmed paid or scheduled on autopay.
              </span>
            </label>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="border border-rule px-4 py-2 rounded text-xs font-mono text-muted"
              >
                &larr; Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="bg-terra text-white px-4 py-2 rounded text-xs font-mono uppercase tracking-wider font-semibold hover:bg-terra-light"
              >
                Next: Weekly AI Briefing &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 4: AI Prompt */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-terra font-semibold">
                MINUTES 13–15 · THE MASTER WEEKLY AI PROMPT
              </span>
              <h4 className="text-lg font-display font-semibold text-ink mt-0.5">
                Generate Meals, Groceries & Cook Briefing
              </h4>
              <p className="text-xs text-body mt-1">
                Click copy below and paste into ChatGPT or WhatsApp AI to get your week's dinner menu and Blinkit/Zepto shopping list in 10 seconds.
              </p>
            </div>

            <div className="p-3 bg-ink text-paper rounded border border-ink text-xs font-mono space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                <span className="text-faint text-[10px]">PRE-POPULATED HOUSEHOLD CONTEXT</span>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 bg-terra text-white px-3 py-1 rounded text-[10px] font-mono uppercase tracking-wider hover:bg-terra-light"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy Prompt'}</span>
                </button>
              </div>
              <pre className="text-[11px] whitespace-pre-wrap font-sans text-gray-300">
                {masterAIPrompt}
              </pre>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-muted uppercase mb-1">Weekly Alignment Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Guests visiting on Friday evening; order extra produce."
                value={resetNotes}
                onChange={(e) => setResetNotes(e.target.value)}
                className="w-full p-2 bg-paper border border-rule rounded text-ink text-xs focus:outline-none focus:border-terra"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(3)}
                className="border border-rule px-4 py-2 rounded text-xs font-mono text-muted"
              >
                &larr; Back
              </button>
              <button
                onClick={handleFinishReset}
                className="bg-sage text-white px-5 py-2.5 rounded text-xs font-mono uppercase tracking-wider font-semibold hover:bg-sage/90 shadow"
              >
                Complete Sunday Reset 🎉
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Past Reset History */}
      {logs.length > 0 && (
        <div className="bg-plate border border-rule p-6 rounded-lg space-y-3">
          <h3 className="text-base font-display font-semibold text-ink border-b border-grid pb-2">
            Reset History & Consistency Log
          </h3>
          <div className="divide-y divide-grid text-xs">
            {logs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage" />
                  <span className="font-mono text-ink font-semibold">Week of {log.weekStarting}</span>
                  {log.notes && <span className="text-muted italic truncate max-w-xs">&bull; {log.notes}</span>}
                </div>
                <span className="text-[10px] font-mono bg-sage/10 text-sage px-2 py-0.5 rounded border border-sage/20 uppercase">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
