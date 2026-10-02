import React, { useState, useRef, useEffect } from 'react';
import { EmergencyInfo } from '../types/household';
import { X, Download, ShieldAlert, Check } from 'lucide-react';

interface IceCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  info: EmergencyInfo;
  onUpdateInfo: (updated: EmergencyInfo) => void;
}

export const IceCardModal: React.FC<IceCardModalProps> = ({
  isOpen,
  onClose,
  info,
  onUpdateInfo
}) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redraw canvas whenever info changes
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas Dimensions: 1080 x 1920 (Standard Smartphone Wallpaper)
    canvas.width = 1080;
    canvas.height = 1920;

    // Background
    ctx.fillStyle = '#14110e';
    ctx.fillRect(0, 0, 1080, 1920);

    // Accent header border
    ctx.fillStyle = '#bd4e29';
    ctx.fillRect(60, 140, 960, 10);

    // Header Title
    ctx.font = 'bold 52px Fraunces, Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('IN CASE OF EMERGENCY (ICE)', 60, 240);

    ctx.font = '28px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#bd4e29';
    ctx.fillText('CRITICAL MEDICAL & CONTACT CARD · HOUSEHOLD OS', 60, 290);

    // Divider line
    ctx.strokeStyle = '#3d352c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 330);
    ctx.lineTo(1020, 330);
    ctx.stroke();

    let y = 410;

    // Helper to draw a section
    const drawSection = (title: string, lines: { label: string; val: string; highlight?: boolean }[]) => {
      ctx.font = 'bold 30px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#a07a26';
      ctx.fillText(title.toUpperCase(), 60, y);
      y += 45;

      lines.forEach((l) => {
        ctx.font = '28px "IBM Plex Sans", sans-serif';
        ctx.fillStyle = '#9c9284';
        ctx.fillText(l.label + ':', 60, y);

        ctx.font = l.highlight ? 'bold 36px "IBM Plex Mono", monospace' : 'bold 32px "IBM Plex Sans", sans-serif';
        ctx.fillStyle = l.highlight ? '#ffffff' : '#e6e0d3';
        ctx.fillText(l.val, 420, y);
        y += 55;
      });

      y += 35;
    };

    // 1. Blood Groups
    drawSection('1. Blood Groups', info.bloodGroups.map(bg => ({
      label: bg.name,
      val: bg.group,
      highlight: true
    })));

    // 2. Health Insurance & TPA
    drawSection('2. Health Insurance & Cashless TPA', [
      { label: 'Policy Number', val: info.healthInsurancePolicyNo || '—' },
      { label: '24x7 TPA Helpline', val: info.tpaHelpline || '—', highlight: true },
      { label: 'Preferred Hospital', val: info.preferredHospital || '—' }
    ]);

    // 3. Emergency Contacts
    drawSection('3. Emergency Contacts (Call First)', [
      { label: 'Primary Contact', val: `${info.primaryContactName} (${info.primaryContactPhone})`, highlight: true },
      { label: 'Secondary Contact', val: `${info.secondaryContactName} (${info.secondaryContactPhone})` },
      { label: 'Family Doctor', val: `${info.familyDoctorName} (${info.familyDoctorPhone})` }
    ]);

    // Footer emergency notice
    ctx.fillStyle = '#231e18';
    ctx.fillRect(60, 1680, 960, 150);

    ctx.font = '24px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#a59a87';
    ctx.fillText('NOTICE TO FIRST RESPONDERS & PARAMEDICS:', 90, 1735);
    ctx.fillText('Please dial the primary emergency contact or hospital immediately.', 90, 1780);

  }, [isOpen, info]);

  if (!isOpen) return null;

  const handleDownloadWallpaper = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'emergency-ice-lockscreen.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-plate border border-ink p-6 rounded-lg max-w-3xl w-full shadow-2xl animate-fadeIn my-8">
        
        <div className="flex items-center justify-between pb-3 border-b border-grid">
          <div className="flex items-center gap-2 text-terra">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-lg font-display font-semibold text-ink">
              Emergency ICE Card (In Case of Emergency)
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-body mt-2">
          Save this high-contrast emergency card as your phone lock screen wallpaper. Anyone can view critical medical and contact information without unlocking your device.
        </p>

        {/* Live Wallpaper Preview Canvas */}
        <div className="mt-4 flex flex-col md:flex-row items-center gap-6">
          <div className="w-48 h-80 rounded-2xl overflow-hidden border-2 border-ink shadow-lg bg-black shrink-0 relative">
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-0 right-0 text-center text-[9px] font-mono text-faint">
              Lock Screen Wallpaper Preview
            </div>
          </div>

          {/* Quick Edit Fields */}
          <div className="flex-1 space-y-3 text-xs w-full">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-muted uppercase">Primary Contact Phone</label>
                <input
                  type="text"
                  value={info.primaryContactPhone}
                  onChange={(e) => onUpdateInfo({ ...info, primaryContactPhone: e.target.value })}
                  className="w-full p-1.5 bg-paper border border-rule rounded text-ink font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-muted uppercase">Secondary Contact Phone</label>
                <input
                  type="text"
                  value={info.secondaryContactPhone}
                  onChange={(e) => onUpdateInfo({ ...info, secondaryContactPhone: e.target.value })}
                  className="w-full p-1.5 bg-paper border border-rule rounded text-ink font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-muted uppercase">Preferred Hospital & ER Phone</label>
              <input
                type="text"
                value={info.preferredHospital}
                onChange={(e) => onUpdateInfo({ ...info, preferredHospital: e.target.value })}
                className="w-full p-1.5 bg-paper border border-rule rounded text-ink text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-muted uppercase">Health Insurance Policy #</label>
                <input
                  type="text"
                  value={info.healthInsurancePolicyNo}
                  onChange={(e) => onUpdateInfo({ ...info, healthInsurancePolicyNo: e.target.value })}
                  className="w-full p-1.5 bg-paper border border-rule rounded text-ink font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-muted uppercase">Cashless TPA Helpline</label>
                <input
                  type="text"
                  value={info.tpaHelpline}
                  onChange={(e) => onUpdateInfo({ ...info, tpaHelpline: e.target.value })}
                  className="w-full p-1.5 bg-paper border border-rule rounded text-ink font-mono text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleDownloadWallpaper}
              className="w-full flex items-center justify-center gap-2 bg-terra text-white py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold hover:bg-terra-light transition-colors shadow"
            >
              {copied ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{copied ? 'Wallpaper Downloaded!' : 'Download Lock Screen Wallpaper (.PNG)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
