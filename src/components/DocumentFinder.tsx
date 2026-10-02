import React, { useState } from 'react';
import { DocumentPointer, DocCategory } from '../types/household';
import { Search, Plus, AlertCircle, ShieldAlert, Folder, ExternalLink, Calendar } from 'lucide-react';

interface DocumentFinderProps {
  documents: DocumentPointer[];
  onUpdateDocuments: (updated: DocumentPointer[]) => void;
  onOpenIceModal: () => void;
}

export const DocumentFinder: React.FC<DocumentFinderProps> = ({
  documents,
  onUpdateDocuments,
  onOpenIceModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Doc Form
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<DocCategory>('identity');
  const [newDocLocation, setNewDocLocation] = useState('');
  const [newDocExpiry, setNewDocExpiry] = useState('');
  const [newDocDigilocker, setNewDocDigilocker] = useState(true);
  const [newDocICE, setNewDocICE] = useState(false);

  const categories = [
    { id: 'all', label: 'All Documents' },
    { id: 'medical', label: '🔴 Medical & Health' },
    { id: 'identity', label: '🔵 Identity & Govt' },
    { id: 'property', label: '🟢 Property & Deeds' },
    { id: 'vehicle', label: '🟡 Vehicles & Auto' }
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesCat = activeCategory === 'all' || doc.category === activeCategory;
    const matchesSearch = doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.physicalLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getSleeveBadge = (cat: DocCategory) => {
    switch (cat) {
      case 'medical':
        return { label: '🔴 Red Sleeve', bg: 'bg-terra/10 text-terra border-terra/30' };
      case 'identity':
        return { label: '🔵 Blue Sleeve', bg: 'bg-blue/10 text-blue border-blue/30' };
      case 'property':
        return { label: '🟢 Green Sleeve', bg: 'bg-sage/10 text-sage border-sage/30' };
      case 'vehicle':
        return { label: '🟡 Yellow Sleeve', bg: 'bg-brass/10 text-brass border-brass/30' };
      default:
        return { label: '⚪ Folder', bg: 'bg-paper text-muted border-rule' };
    }
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !newDocLocation.trim()) return;

    const newDoc: DocumentPointer = {
      id: `doc-${Date.now()}`,
      documentName: newDocName.trim(),
      category: newDocCategory,
      physicalLocation: newDocLocation.trim(),
      digilockerSync: newDocDigilocker,
      expiryDate: newDocExpiry ? newDocExpiry : undefined,
      isEmergencyICE: newDocICE
    };

    onUpdateDocuments([newDoc, ...documents]);
    setNewDocName('');
    setNewDocLocation('');
    setNewDocExpiry('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-plate border border-ink p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-terra uppercase font-semibold">
              BLOCK 3 · THE 10-SECOND DOCUMENTS INDEX
            </span>
            <h2 className="text-2xl font-display font-semibold text-ink mt-1">
              Zero-Knowledge Physical Pointer Model
            </h2>
            <p className="text-sm text-body mt-1 max-w-2xl">
              Never upload sensitive unencrypted passports to the cloud. Index <b>where the physical paper lives</b> in your 4-sleeve binder.
            </p>
          </div>

          <button
            onClick={onOpenIceModal}
            className="flex items-center gap-2 bg-terra text-white px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider hover:bg-terra-light transition-colors shadow-sm self-start md:self-auto font-semibold"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Generate Emergency ICE Card</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-faint absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Find document in 10 seconds (e.g. Passport, RC, Rent agreement)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-plate border border-rule rounded-lg text-ink placeholder:text-faint focus:outline-none focus:border-terra shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-paper border border-rule px-3.5 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-ink hover:bg-plate transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-terra" />
            <span>Index New Paper</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveDomain(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-ink text-paper font-semibold'
                : 'bg-plate border border-rule text-muted hover:text-ink hover:bg-paper'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const sleeve = getSleeveBadge(doc.category);
          return (
            <div
              key={doc.id}
              className="bg-plate border border-rule p-4 rounded-lg shadow-sm hover:border-ink transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-ink leading-snug">
                    {doc.documentName}
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border whitespace-nowrap ${sleeve.bg}`}>
                    {sleeve.label}
                  </span>
                </div>

                <div className="mt-2.5 p-2 bg-paper rounded border border-rule/80 text-xs flex items-center gap-2 text-ink">
                  <Folder className="w-3.5 h-3.5 text-terra shrink-0" />
                  <span className="font-mono text-[11px] truncate">{doc.physicalLocation}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-grid text-muted">
                <div className="flex items-center gap-2 text-[11px]">
                  {doc.digilockerSync ? (
                    <span className="text-sage flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block"></span>
                      DigiLocker Synced
                    </span>
                  ) : (
                    <span className="text-faint">Physical Only</span>
                  )}
                </div>

                {doc.expiryDate && (
                  <div className="flex items-center gap-1 font-mono text-[11px] text-brass">
                    <Calendar className="w-3 h-3" />
                    <span>Exp: {doc.expiryDate}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12 bg-plate rounded-lg border border-rule text-muted text-sm font-mono">
          No documents found matching "{searchQuery}".
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4">
          <div className="bg-plate border border-ink p-6 rounded-lg max-w-md w-full shadow-xl animate-fadeIn">
            <h3 className="text-lg font-display font-semibold text-ink mb-1">Index Physical Document</h3>
            <p className="text-xs text-muted mb-4 font-mono">Store coordinates so anyone finds it in 10 seconds.</p>

            <form onSubmit={handleAddDocument} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-[10px] text-muted uppercase mb-1">Document Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vehicle Pollution Check (PUC) / Property Deed"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full p-2 bg-paper border border-rule rounded text-ink focus:outline-none focus:border-terra"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] text-muted uppercase mb-1">Category & Sleeve</label>
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value as DocCategory)}
                    className="w-full p-2 bg-paper border border-rule rounded text-ink focus:outline-none focus:border-terra"
                  >
                    <option value="medical">🔴 Medical / Health</option>
                    <option value="identity">🔵 Identity / Legal</option>
                    <option value="property">🟢 Property / Deeds</option>
                    <option value="vehicle">🟡 Vehicles & Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-muted uppercase mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={newDocExpiry}
                    onChange={(e) => setNewDocExpiry(e.target.value)}
                    className="w-full p-2 bg-paper border border-rule rounded text-ink font-mono focus:outline-none focus:border-terra"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-muted uppercase mb-1">Physical Location Coordinates</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom Cupboard -> Blue Binder -> Sleeve 4"
                  value={newDocLocation}
                  onChange={(e) => setNewDocLocation(e.target.value)}
                  className="w-full p-2 bg-paper border border-rule rounded text-ink focus:outline-none focus:border-terra"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDocDigilocker}
                    onChange={(e) => setNewDocDigilocker(e.target.checked)}
                    className="accent-terra"
                  />
                  <span className="font-mono text-[11px] text-ink">Synced in DigiLocker</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDocICE}
                    onChange={(e) => setNewDocICE(e.target.checked)}
                    className="accent-terra"
                  />
                  <span className="font-mono text-[11px] text-terra font-semibold">Flag as Emergency ICE</span>
                </label>
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
                  Save Coordinates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
