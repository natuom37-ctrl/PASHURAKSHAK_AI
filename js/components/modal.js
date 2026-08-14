/**
 * PashuRakshak AI - Detail Modal Component
 * Renders complete screening inspection record with high-res preview and export
 */

export const DetailModal = {
  open(record) {
    const modal = document.getElementById('inspectionModal');
    const content = document.getElementById('inspectionModalContent');
    if (!modal || !content || !record) return;

    const isHealthy = record.badgeClass === 'ok' || (record.prediction && record.prediction.toLowerCase().includes('healthy'));
    const badgeBg = isHealthy ? '#d7eee4' : '#fae9c1';
    const badgeColor = isHealthy ? '#175e47' : '#78540e';

    const symptomsList = (record.symptoms && record.symptoms.length > 0)
      ? record.symptoms.map(s => `<span class="symptom-tag">${s}</span>`).join(' ')
      : '<span style="color:#71807a; font-size:13px;">No physical symptoms selected</span>';

    const probBars = record.probabilities ? Object.entries(record.probabilities).map(([key, val]) => {
      const pName = key === 'healthy' ? 'Healthy' : key.includes('foot') ? 'Foot & Mouth Disease' : 'Lumpy Skin Disease';
      const pColor = key === 'healthy' ? '#187052' : key.includes('foot') ? '#d9534f' : '#e09f3e';
      const numVal = typeof val === 'number' ? (val > 1 ? val : val * 100).toFixed(1) : '0.0';
      return `
        <div style="margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:3px; color:#4a5954;">
            <span>${pName}</span>
            <strong>${numVal}%</strong>
          </div>
          <div style="background:#e4ece8; height:7px; border-radius:4px; overflow:hidden;">
            <div style="background:${pColor}; width:${Math.min(numVal, 100)}%; height:100%;"></div>
          </div>
        </div>
      `;
    }).join('') : '';

    const imgDisplay = record.imageUrl 
      ? `<img src="${record.imageUrl}" alt="${record.animalName}" style="width:100%; height:260px; object-fit:contain; background:#eef4f1; border-radius:14px; margin-bottom:18px;">`
      : `<div style="height:140px; background:#eef4f1; border-radius:14px; display:grid; place-items:center; color:#62756e; margin-bottom:18px; font-size:13px;">No image attached</div>`;

    content.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
        <div>
          <span style="font-size:11px; font-weight:800; color:#187052; text-transform:uppercase; letter-spacing:0.8px;">SCREENING RECORD #${record.id}</span>
          <h2 style="margin:4px 0 0; font-size:22px; color:#102c23;">${record.animalName || 'Livestock'}</h2>
          <span style="color:#687570; font-size:13px;">${record.animalType || 'Cattle'} • Logged ${record.dateFormatted || 'Recently'}</span>
        </div>
        <span style="background:${badgeBg}; color:${badgeColor}; font-size:13px; font-weight:800; padding:6px 14px; border-radius:20px;">
          ${record.statusText || 'Normal'} (${record.confidence}% Confidence)
        </span>
      </div>

      ${imgDisplay}

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px;">
        <div style="background:#f4fbf8; border:1px solid #d4e6df; border-radius:12px; padding:14px;">
          <strong style="display:block; font-size:12px; color:#187052; margin-bottom:4px;">AI DIAGNOSIS</strong>
          <span style="font-size:16px; font-weight:800; color:#102c23;">${record.prediction}</span>
          <p style="margin:6px 0 0; font-size:12px; color:#4a5954; line-height:1.4;">${record.summary || 'Screening evaluated by TFLite model.'}</p>
        </div>
        <div style="background:#f9faf9; border:1px solid #e0e8e4; border-radius:12px; padding:14px;">
          <strong style="display:block; font-size:12px; color:#475752; margin-bottom:6px;">PROBABILITY SPREAD</strong>
          ${probBars}
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <strong style="display:block; font-size:13px; color:#2c3b36; margin-bottom:6px;">Recorded Symptoms:</strong>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">${symptomsList}</div>
      </div>

      ${record.notes ? `
        <div style="margin-bottom:16px; background:#fafcfb; border:1px solid #e2ece7; border-radius:10px; padding:12px;">
          <strong style="display:block; font-size:12px; color:#4a5a54; margin-bottom:3px;">Additional Observations:</strong>
          <span style="font-size:13px; color:#23312c; line-height:1.4;">${record.notes}</span>
        </div>
      ` : ''}

      <div style="background:#eaf4f0; border-radius:12px; padding:14px; font-size:13px; color:#174f3e; line-height:1.45; margin-bottom:18px;">
        <strong>Recommended Veterinary Action:</strong><br>
        <span>${record.action || 'Continue standard herd health monitoring and hydration.'}</span>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e5ece8; padding-top:16px; flex-wrap:wrap; gap:10px;">
        <span style="font-size:11px; color:#889691; max-width:55%;">⚠️ AI assistance only. Consult licensed veterinarian for definitive treatment.</span>
        <div style="display:flex; gap:10px;">
          <button class="btn-modal-print" id="printScreeningBtn" onclick="window.print()">
            <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span>Print Report</span>
          </button>
          <button class="btn-modal-close" id="closeInspectionBtn" onclick="document.getElementById('inspectionModal').classList.remove('open')">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span>Close</span>
          </button>
        </div>
      </div>
    `;

    modal.classList.add('open');
  },

  close() {
    const modal = document.getElementById('inspectionModal');
    if (modal) modal.classList.remove('open');
  }
};
