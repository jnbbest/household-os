import React, { useState } from 'react';
import { ExpenseItem, MoneyPoolState } from '../types/household';
import { Plus, Trash2, Copy, Check, Calculator, PieChart, ShieldAlert } from 'lucide-react';

interface MoneyPoolProps {
  moneyState: MoneyPoolState;
  onUpdateMoney: (updated: MoneyPoolState) => void;
  currencySymbol: string;
}

export const MoneyPool: React.FC<MoneyPoolProps> = ({
  moneyState,
  onUpdateMoney,
  currencySymbol
}) => {
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState<number | ''>('');
  const [newItemBucket, setNewItemBucket] = useState<'Fixed' | 'Variable'>('Fixed');
  const [newItemNotes, setNewItemNotes] = useState('');

  // Calculations
  const fixedTotal = moneyState.items
    .filter((i) => i.bucket === 'Fixed')
    .reduce((sum, i) => sum + i.amount, 0);

  const variableTotal = moneyState.items
    .filter((i) => i.bucket === 'Variable')
    .reduce((sum, i) => sum + i.amount, 0);

  const subtotal = fixedTotal + variableTotal;
  const bufferAmount = Math.round(subtotal * moneyState.bufferRate);
  const totalMonthlyPool = subtotal + bufferAmount;

  // Split Calculations
  let partnerAShare = Math.round(totalMonthlyPool / 2);
  let partnerBShare = Math.round(totalMonthlyPool / 2);

  if (moneyState.splitModel === 'income_weighted') {
    const totalIncome = (moneyState.partnerAIncome || 0) + (moneyState.partnerBIncome || 0);
    if (totalIncome > 0) {
      const ratioA = moneyState.partnerAIncome / totalIncome;
      partnerAShare = Math.round(totalMonthlyPool * ratioA);
      partnerBShare = totalMonthlyPool - partnerAShare;
    }
  }

  const handleToggleSplit = (model: 'equal_50_50' | 'income_weighted') => {
    onUpdateMoney({ ...moneyState, splitModel: model });
  };

  const handleIncomeChange = (partner: 'A' | 'B', val: number) => {
    if (partner === 'A') {
      onUpdateMoney({ ...moneyState, partnerAIncome: val });
    } else {
      onUpdateMoney({ ...moneyState, partnerBIncome: val });
    }
  };

  const handleDeleteItem = (id: string) => {
    onUpdateMoney({
      ...moneyState,
      items: moneyState.items.filter((i) => i.id !== id)
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemAmount) return;

    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      itemName: newItemName.trim(),
      amount: Number(newItemAmount),
      bucket: newItemBucket,
      notes: newItemNotes.trim()
    };

    onUpdateMoney({
      ...moneyState,
      items: [...moneyState.items, newItem]
    });

    setNewItemName('');
    setNewItemAmount('');
    setNewItemNotes('');
    setShowAddModal(false);
  };

  const handleCopyWhatsApp = () => {
    const text = 
`🏠 *HOUSEHOLD OS · MONTHLY POOL SETTLEMENT*
Month: 1st of the Month Transfer

📦 *Total Monthly Pool:* ${currencySymbol}${totalMonthlyPool.toLocaleString('en-IN')}
• Fixed Operations: ${currencySymbol}${fixedTotal.toLocaleString('en-IN')}
• Variable Living: ${currencySymbol}${variableTotal.toLocaleString('en-IN')}
• 15% Shock Buffer: ${currencySymbol}${bufferAmount.toLocaleString('en-IN')}

🤝 *Agreed Split (${moneyState.splitModel === 'equal_50_50' ? '50/50 Equal' : 'Income-Weighted Pro-Rata'}):*
• ${moneyState.partnerAName}: *${currencySymbol}${partnerAShare.toLocaleString('en-IN')}*
• ${moneyState.partnerBName}: *${currencySymbol}${partnerBShare.toLocaleString('en-IN')}*

⚡ Please transfer single consolidated amount via UPI today to avoid mid-month friction!`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-plate border border-ink p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-terra uppercase font-semibold">
              BLOCK 2 · MONEY IN ONE PLACE
            </span>
            <h2 className="text-2xl font-display font-semibold text-ink mt-1">
              The 3-Bucket Pool & Consolidated Split
            </h2>
            <p className="text-sm text-body mt-1 max-w-2xl">
              Replace 40 Splitwise transactions with <b>one joint pool calculation</b> and <b>one single transfer</b> on the 1st of the month.
            </p>
          </div>

          <button
            onClick={handleCopyWhatsApp}
            className="flex items-center gap-2 bg-sage text-white px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider hover:bg-sage/90 transition-colors shadow-sm self-start md:self-auto"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy WhatsApp Plan'}</span>
          </button>
        </div>
      </div>

      {/* 3-Bucket Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Bucket 1 */}
        <div className="bg-plate border border-rule p-4 rounded-lg shadow-sm">
          <div className="text-[10px] font-mono text-terra uppercase tracking-wider font-semibold">
            BUCKET 1 · FIXED
          </div>
          <div className="text-2xl font-display font-semibold text-ink mt-2 tabular">
            {currencySymbol}{fixedTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-muted mt-1">
            Rent, domestic staff, wifi, electricity.
          </div>
        </div>

        {/* Bucket 2 */}
        <div className="bg-plate border border-rule p-4 rounded-lg shadow-sm">
          <div className="text-[10px] font-mono text-sage uppercase tracking-wider font-semibold">
            BUCKET 2 · VARIABLE
          </div>
          <div className="text-2xl font-display font-semibold text-ink mt-2 tabular">
            {currencySymbol}{variableTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-muted mt-1">
            Groceries, vegetables, daily supplies.
          </div>
        </div>

        {/* Bucket 3 Buffer */}
        <div className="bg-plate border border-rule p-4 rounded-lg shadow-sm bg-plate-2">
          <div className="text-[10px] font-mono text-brass uppercase tracking-wider font-semibold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>BUCKET 3 · 15% BUFFER</span>
          </div>
          <div className="text-2xl font-display font-semibold text-ink mt-2 tabular">
            {currencySymbol}{bufferAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-muted mt-1">
            Emergency repairs & staff bonus reserve.
          </div>
        </div>

        {/* Total Monthly Pool */}
        <div className="bg-ink text-paper p-4 rounded-lg shadow-md flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-terra-light uppercase tracking-wider font-semibold">
              TOTAL MONTHLY POOL
            </div>
            <div className="text-3xl font-display font-bold text-white mt-1 tabular">
              {currencySymbol}{totalMonthlyPool.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-[11px] font-mono text-faint mt-2">
            Includes operational shock absorber
          </div>
        </div>

      </div>

      {/* Split Methodology & Contributions */}
      <div className="bg-plate border border-rule p-6 rounded-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-grid pb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-terra" />
            <h3 className="text-base font-display font-semibold text-ink">
              Contribution Split Architecture
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-paper p-1 rounded-lg border border-rule">
            <button
              onClick={() => handleToggleSplit('equal_50_50')}
              className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors ${
                moneyState.splitModel === 'equal_50_50'
                  ? 'bg-plate text-terra font-semibold shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              50 / 50 Equal
            </button>
            <button
              onClick={() => handleToggleSplit('income_weighted')}
              className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors ${
                moneyState.splitModel === 'income_weighted'
                  ? 'bg-plate text-terra font-semibold shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Income-Weighted Pro-Rata
            </button>
          </div>
        </div>

        {/* Pro-rata Income Inputs if active */}
        {moneyState.splitModel === 'income_weighted' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-paper p-4 rounded-lg border border-rule animate-fadeIn">
            <div>
              <label className="block text-xs font-mono text-muted mb-1">
                {moneyState.partnerAName} Net Monthly Income ({currencySymbol})
              </label>
              <input
                type="number"
                value={moneyState.partnerAIncome || ''}
                onChange={(e) => handleIncomeChange('A', Number(e.target.value))}
                placeholder="e.g. 150000"
                className="w-full p-2 bg-plate border border-rule rounded text-ink text-sm font-mono focus:outline-none focus:border-terra"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-1">
                {moneyState.partnerBName} Net Monthly Income ({currencySymbol})
              </label>
              <input
                type="number"
                value={moneyState.partnerBIncome || ''}
                onChange={(e) => handleIncomeChange('B', Number(e.target.value))}
                placeholder="e.g. 100000"
                className="w-full p-2 bg-plate border border-rule rounded text-ink text-sm font-mono focus:outline-none focus:border-terra"
              />
            </div>
          </div>
        )}

        {/* Calculated Monthly Transfers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-paper rounded-lg border border-rule flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-muted block uppercase">Transfer Amount · 1st of Month</span>
              <span className="text-lg font-display font-semibold text-ink">{moneyState.partnerAName}</span>
            </div>
            <div className="text-2xl font-mono font-semibold text-terra tabular">
              {currencySymbol}{partnerAShare.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 bg-paper rounded-lg border border-rule flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-muted block uppercase">Transfer Amount · 1st of Month</span>
              <span className="text-lg font-display font-semibold text-ink">{moneyState.partnerBName}</span>
            </div>
            <div className="text-2xl font-mono font-semibold text-sage tabular">
              {currencySymbol}{partnerBShare.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Expense Item Ledger */}
      <div className="bg-plate border border-rule rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-grid pb-3">
          <h3 className="text-base font-display font-semibold text-ink">
            Household Expense Catalog ({moneyState.items.length} items)
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 text-xs font-mono uppercase bg-paper border border-rule px-3 py-1.5 rounded hover:bg-plate text-ink transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-terra" />
            <span>Add Expense</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-grid font-mono text-muted uppercase text-[10px]">
                <th className="py-2 px-3">Item / Service</th>
                <th className="py-2 px-3">Bucket</th>
                <th className="py-2 px-3">Notes</th>
                <th className="py-2 px-3 text-right">Monthly Amount</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grid">
              {moneyState.items.map((item) => (
                <tr key={item.id} className="hover:bg-paper/50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-ink">{item.itemName}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                      item.bucket === 'Fixed' ? 'bg-terra/10 text-terra' : 'bg-sage/10 text-sage'
                    }`}>
                      {item.bucket}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-muted">{item.notes || '—'}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-ink tabular">
                    {currencySymbol}{item.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-faint hover:text-terra transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4">
          <div className="bg-plate border border-ink p-6 rounded-lg max-w-md w-full shadow-xl animate-fadeIn">
            <h3 className="text-lg font-display font-semibold text-ink mb-1">Add Expense Item</h3>
            <p className="text-xs text-muted mb-4 font-mono">Include all non-negotiable household costs.</p>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-[10px] text-muted uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Society Water Charges / Cook Bonus"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full p-2 bg-paper border border-rule rounded text-ink focus:outline-none focus:border-terra"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] text-muted uppercase mb-1">Monthly Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2 bg-paper border border-rule rounded text-ink font-mono focus:outline-none focus:border-terra"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-muted uppercase mb-1">Bucket</label>
                  <select
                    value={newItemBucket}
                    onChange={(e) => setNewItemBucket(e.target.value as 'Fixed' | 'Variable')}
                    className="w-full p-2 bg-paper border border-rule rounded text-ink focus:outline-none focus:border-terra"
                  >
                    <option value="Fixed">Fixed Operational</option>
                    <option value="Variable">Variable Living</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-muted uppercase mb-1">Due Date / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Due on 5th via UPI"
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="w-full p-2 bg-paper border border-rule rounded text-ink focus:outline-none focus:border-terra"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-grid">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-rule rounded text-muted hover:text-ink font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-terra text-white rounded font-mono text-xs hover:bg-terra-light font-semibold"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
