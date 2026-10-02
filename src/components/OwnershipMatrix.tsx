import React, { useState } from 'react';
import { TaskOwnership, Domain } from '../types/household';
import { Check, ChevronDown, ChevronUp, Plus, Filter, ShieldCheck, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OwnershipMatrixProps {
  tasks: TaskOwnership[];
  onUpdateTasks: (updated: TaskOwnership[]) => void;
}

export const OwnershipMatrix: React.FC<OwnershipMatrixProps> = ({ tasks, onUpdateTasks }) => {
  const [activeDomain, setActiveDomain] = useState<string>('all');
  const [expandedDoD, setExpandedDoD] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDomain, setNewTaskDomain] = useState<Domain>('kitchen');
  const [newTaskFrequency, setNewTaskFrequency] = useState<TaskOwnership['frequency']>('weekly');
  const [newTaskPrimary, setNewTaskPrimary] = useState('Partner A');
  const [newTaskBackup, setNewTaskBackup] = useState('Partner B');
  const [newTaskDoD, setNewTaskDoD] = useState('');

  const domains: { id: string; label: string }[] = [
    { id: 'all', label: 'All Tasks' },
    { id: 'kitchen', label: 'Kitchen & Food' },
    { id: 'staff', label: 'Domestic Staff' },
    { id: 'admin', label: 'Bills & Admin' },
    { id: 'repairs', label: 'Home Repairs' },
    { id: 'laundry', label: 'Laundry & Wardrobe' },
    { id: 'family', label: 'Family & Health' }
  ];

  const filteredTasks = tasks.filter((t) => {
    const matchesDomain = activeDomain === 'all' || t.domain === activeDomain;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.primaryOwner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.backupOwner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPct = Math.round((completedCount / (tasks.length || 1)) * 100);

  const toggleStatus = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const nextStatus: 'pending' | 'completed' = t.status === 'completed' ? 'pending' : 'completed';
        if (nextStatus === 'completed') {
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#56704d', '#bd4e29', '#a07a26']
          });
        }
        return {
          ...t,
          status: nextStatus,
          lastCompletedDate: nextStatus === 'completed' ? new Date().toISOString().split('T')[0] : t.lastCompletedDate
        };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  const toggleDoD = (id: string) => {
    setExpandedDoD((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskOwnership = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      domain: newTaskDomain,
      frequency: newTaskFrequency,
      primaryOwner: newTaskPrimary.trim() || 'Partner A',
      backupOwner: newTaskBackup.trim() || 'Partner B',
      definitionOfDone: newTaskDoD.trim() || 'Completed as agreed.',
      status: 'pending'
    };

    onUpdateTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDoD('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Block Header */}
      <div className="bg-plate border border-ink p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-terra uppercase font-semibold">
              BLOCK 1 · THE OWNERSHIP MAP
            </span>
            <h2 className="text-2xl font-display font-semibold text-ink mt-1">
              Recurring Chores & CPE Accountability
            </h2>
            <p className="text-sm text-body mt-1 max-w-2xl">
              Every task has exactly <b>one Primary Owner</b> (responsible for Conceiving, Planning, and Executing) 
              and <b>one Backup</b> who steps in without a debate when needed.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-paper px-4 py-3 rounded-lg border border-rule self-start md:self-auto">
            <div>
              <div className="text-xs font-mono text-muted uppercase">Cycle Progress</div>
              <div className="text-xl font-display font-semibold text-ink">
                {completedCount} <span className="text-xs font-mono text-faint">/ {tasks.length} Done</span>
              </div>
            </div>
            <div className="w-16 h-2 bg-rule rounded-full overflow-hidden">
              <div 
                className="h-full bg-sage transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-faint ml-1 hidden sm:block" />
          {domains.map((dom) => (
            <button
              key={dom.id}
              onClick={() => setActiveDomain(dom.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeDomain === dom.id
                  ? 'bg-ink text-paper font-semibold'
                  : 'bg-plate border border-rule text-muted hover:text-ink hover:bg-paper'
              }`}
            >
              {dom.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search chore or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 text-xs bg-plate border border-rule rounded-md text-ink placeholder:text-faint focus:outline-none focus:border-terra w-full sm:w-48"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 bg-terra text-white px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider hover:bg-terra-light transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Chore</span>
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const isDone = task.status === 'completed';
          const isExpanded = !!expandedDoD[task.id];

          return (
            <div
              key={task.id}
              className={`p-4 rounded-lg border transition-all ${
                isDone
                  ? 'bg-plate/40 border-rule opacity-75'
                  : 'bg-plate border-rule hover:border-ink shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStatus(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-sage border-sage text-white'
                        : 'border-rule-2 hover:border-terra bg-paper'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div>
                    <h3 className={`text-sm font-medium ${isDone ? 'line-through text-muted' : 'text-ink'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-paper border border-rule text-muted uppercase">
                        {task.domain}
                      </span>
                      <span className="text-[10px] font-mono text-faint uppercase">
                        &bull; {task.frequency}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleDoD(task.id)}
                  className="p-1 text-faint hover:text-ink transition-colors"
                  title="Definition of Done"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Ownership Badges */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-grid text-xs">
                <div className="flex items-center gap-1.5 text-ink font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-terra" />
                  <span className="text-muted text-[11px]">Primary:</span>
                  <span className="font-mono text-[11px] bg-paper px-1.5 py-0.5 rounded border border-rule">
                    {task.primaryOwner}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-sage" />
                  <span className="text-[11px]">Backup:</span>
                  <span className="font-mono text-[11px] bg-paper px-1.5 py-0.5 rounded border border-rule">
                    {task.backupOwner}
                  </span>
                </div>
              </div>

              {/* Definition of Done Drawer */}
              {isExpanded && (
                <div className="mt-3 p-2.5 bg-plate-2 rounded border border-rule text-xs text-body space-y-1">
                  <div className="font-mono text-[9.5px] uppercase tracking-wider text-terra font-semibold">
                    Definition of Done (DoD):
                  </div>
                  <p className="italic">{task.definitionOfDone || 'No criteria specified.'}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 bg-plate rounded-lg border border-rule text-muted text-sm font-mono">
          No chores found matching current filters.
        </div>
      )}

      {/* Add Custom Chore Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4">
          <div className="bg-plate border border-ink p-6 rounded-lg max-w-lg w-full shadow-xl animate-fadeIn">
            <h3 className="text-lg font-display font-semibold text-ink mb-1">Add Household Chore</h3>
            <p className="text-xs text-muted mb-4 font-mono">Assign single primary accountability & explicit DoD.</p>
            
            <form onSubmit={handleAddTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-[10px] text-muted uppercase mb-1">Chore Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clean kitchen chimney & exhaust fan"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full p-2 bg-paper border border-rule rounded text-ink focus:outline-none focus:border-terra"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] text-muted uppercase mb-1">Domain</label>
                  <select
                    value={newTaskDomain}
                    onChange={(e) => setNewTaskDomain(e.target.value as Domain)}
                    className="w-full p-2 bg-paper border border-rule rounded text-ink focus:outline-none focus:border-terra"
                  >
                    <option value="kitchen">Kitchen</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="repairs">Repairs</option>
                    <option value="laundry">Laundry</option>
                    <option value="family">Family</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-muted uppercase mb-1">Frequency</label>
                  <select
                    value={newTaskFrequency}
                    onChange={(e) => setNewTaskFrequency(e.target.value as TaskOwnership['frequency'])}
                    className="w-full p-2 bg-paper border border-rule rounded text-ink focus:outline-none focus:border-terra"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] text-muted uppercase mb-1">Primary Owner</label>
                  <input
                    type="text"
                    value={newTaskPrimary}
                    onChange={(e) => setNewTaskPrimary(e.target.value)}
                    className="w-full p-2 bg-paper border border-rule rounded text-ink focus:outline-none focus:border-terra"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-muted uppercase mb-1">Backup Owner</label>
                  <input
                    type="text"
                    value={newTaskBackup}
                    onChange={(e) => setNewTaskBackup(e.target.value)}
                    className="w-full p-2 bg-paper border border-rule rounded text-ink focus:outline-none focus:border-terra"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-muted uppercase mb-1">Definition of Done (DoD)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Filters soaked in hot water, degreased, and tested."
                  value={newTaskDoD}
                  onChange={(e) => setNewTaskDoD(e.target.value)}
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
                  Save Chore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
