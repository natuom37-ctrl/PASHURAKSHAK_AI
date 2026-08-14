/**
 * PashuRakshak AI - Main Application Controller & Router
 * SPA Architecture with Hash-based Client-Side Routing
 */

import { ScreeningAPI } from './api/screeningApi.js';
import { HistoryAPI } from './api/historyApi.js';
import { AnalyticsAPI } from './api/analyticsApi.js';
import { VetAPI } from './api/vetApi.js';
import { NotificationsAPI } from './api/notificationsApi.js';
import { SettingsAPI } from './api/settingsApi.js';
import { ChartRenderer } from './components/charts.js';
import { DetailModal } from './components/modal.js';
import { Translations } from './i18n/translations.js';

// Application State
const AppState = {
  currentRoute: 'dashboard',
  currentLang: 'en',
  screeningWizard: {
    currentStep: 1,
    animalType: 'Cattle',
    imageFile: null,
    imageUrl: '',
    symptoms: [],
    notes: '',
    result: null
  }
};

/* ==========================================================================
   1. ROUTER & NAVIGATION
   ========================================================================== */
export function navigateTo(route) {
  window.location.hash = `#/${route}`;
}

function handleRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '') || 'dashboard';
  const cleanRoute = hash.split('?')[0].toLowerCase();
  
  const validRoutes = ['dashboard', 'new-screening', 'history', 'analytics', 'veterinary-help', 'notifications', 'settings'];
  const targetRoute = validRoutes.includes(cleanRoute) ? cleanRoute : 'dashboard';

  AppState.currentRoute = targetRoute;

  // Toggle active view
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.remove('active-view');
  });

  const activeView = document.getElementById(`view-${targetRoute}`);
  if (activeView) {
    activeView.classList.add('active-view');
  }

  // Update sidebar active buttons
  document.querySelectorAll('.nav button[data-route], .sidebottom button[data-route]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.route === targetRoute);
  });

  // Close mobile drawer on navigation
  const side = document.querySelector('.side');
  if (side) side.classList.remove('drawer-open');

  // Trigger view initializers
  if (targetRoute === 'dashboard') initDashboardView();
  else if (targetRoute === 'new-screening') initNewScreeningView();
  else if (targetRoute === 'history') initHistoryView();
  else if (targetRoute === 'analytics') initAnalyticsView();
  else if (targetRoute === 'veterinary-help') initVetHelpView();
  else if (targetRoute === 'notifications') initNotificationsView();
  else if (targetRoute === 'settings') initSettingsView();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================================
   2. DASHBOARD VIEW CONTROLLER
   ========================================================================== */
function initDashboardView() {
  updateGreeting();
  updateDashboardStats();
  renderDashboardRecentScreenings();
}

function updateGreeting() {
  const hour = new Date().getHours();
  let greet = 'Good evening, 👋';
  if (hour < 12) greet = 'Good morning, 👋';
  else if (hour < 17) greet = 'Good afternoon, 👋';

  const el = document.getElementById('dashGreeting');
  if (el) el.textContent = greet;
}

function updateDashboardStats() {
  const summary = AnalyticsAPI.getSummary();
  const totalEl = document.getElementById('statTotalScreenings');
  const healthyEl = document.getElementById('statHealthy');
  const attentionEl = document.getElementById('statAttention');

  if (totalEl) totalEl.textContent = summary.total;
  if (healthyEl) healthyEl.textContent = summary.healthy;
  if (attentionEl) attentionEl.textContent = summary.attention;
}

function renderDashboardRecentScreenings() {
  const tbody = document.getElementById('recentScreeningsTbody');
  if (!tbody) return;

  const records = HistoryAPI.getAll().slice(0, 5);
  if (records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#70817b;">No recent screenings. Start a new screening to see data.</td></tr>';
    return;
  }

  tbody.innerHTML = records.map(r => `
    <tr>
      <td><strong>${r.animalName || 'Cattle'}</strong><br><small style="color:#71807a;">${r.id}</small></td>
      <td>${r.animalType || 'Cattle'}</td>
      <td>${r.dateFormatted || 'Recently'}</td>
      <td><span class="status ${r.badgeClass}">${r.prediction}</span></td>
      <td><span class="status ${r.badgeClass}">${r.statusText}</span></td>
    </tr>
  `).join('');
}

/* ==========================================================================
   3. NEW SCREENING WIZARD CONTROLLER
   ========================================================================== */
function initNewScreeningView() {
  // If wizard is not on step 4, ensure active step is rendered
  setWizardStep(AppState.screeningWizard.currentStep || 1);
}

function setWizardStep(step) {
  AppState.screeningWizard.currentStep = step;

  // Update stepper indicator
  document.querySelectorAll('.step-item').forEach(item => {
    const s = parseInt(item.dataset.step);
    item.classList.remove('active', 'completed');
    if (s === step) item.classList.add('active');
    else if (s < step) item.classList.add('completed');
  });

  // Update panes
  document.querySelectorAll('.step-pane').forEach(pane => {
    pane.classList.remove('active-pane');
  });

  const currentPane = document.getElementById(`step-pane-${step}`);
  if (currentPane) currentPane.classList.add('active-pane');

  // Update buttons
  const backBtn = document.getElementById('wizardBackBtn');
  const nextBtn = document.getElementById('wizardNextBtn');
  const t = Translations[AppState.currentLang || 'en'] || Translations.en;

  if (backBtn) {
    backBtn.style.display = step === 1 ? 'none' : 'inline-flex';
    backBtn.textContent = t.backBtn || '← Back';
  }

  if (nextBtn) {
    if (step === 1) {
      nextBtn.textContent = t.continueToSymptoms || 'Continue to Symptoms →';
      nextBtn.disabled = !AppState.screeningWizard.imageFile;
      nextBtn.style.display = 'inline-flex';
    } else if (step === 2) {
      nextBtn.textContent = t.continueToReview || 'Continue to Review →';
      nextBtn.disabled = false;
      nextBtn.style.display = 'inline-flex';
    } else if (step >= 3) {
      nextBtn.style.display = 'none';
    }
  }

  if (step === 3) {
    renderStep3Summary();
  }
}

function handleImageSelected(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Please select a valid image file (JPG or PNG).');
    return;
  }

  AppState.screeningWizard.imageFile = file;
  AppState.screeningWizard.imageUrl = URL.createObjectURL(file);

  // Render preview
  const dropzone = document.getElementById('screeningDropzone');
  const previewBox = document.getElementById('screeningImagePreviewBox');
  const previewImg = document.getElementById('screeningPreviewImg');

  if (dropzone) dropzone.style.display = 'none';
  if (previewBox && previewImg) {
    previewImg.src = AppState.screeningWizard.imageUrl;
    previewBox.style.display = 'block';
  }

  const nextBtn = document.getElementById('wizardNextBtn');
  if (nextBtn && AppState.screeningWizard.currentStep === 1) {
    nextBtn.disabled = false;
  }
}

function removeSelectedImage() {
  AppState.screeningWizard.imageFile = null;
  AppState.screeningWizard.imageUrl = '';

  const dropzone = document.getElementById('screeningDropzone');
  const previewBox = document.getElementById('screeningImagePreviewBox');
  const fileInput = document.getElementById('wizardFileInput');
  const cameraInput = document.getElementById('wizardCameraInput');

  if (fileInput) fileInput.value = '';
  if (cameraInput) cameraInput.value = '';
  if (previewBox) previewBox.style.display = 'none';
  if (dropzone) dropzone.style.display = 'block';

  const nextBtn = document.getElementById('wizardNextBtn');
  if (nextBtn && AppState.screeningWizard.currentStep === 1) {
    nextBtn.disabled = true;
  }
}

function renderStep3Summary() {
  const summaryBox = document.getElementById('step3SummaryBox');
  if (!summaryBox) return;

  const w = AppState.screeningWizard;
  const symptomsHtml = (w.symptoms && w.symptoms.length > 0)
    ? w.symptoms.map(s => `<span class="symptom-tag">${s}</span>`).join(' ')
    : '<span style="color:#71807a; font-size:13px;">None reported</span>';

  summaryBox.innerHTML = `
    <div style="display:flex; gap:18px; align-items:center; margin-bottom:16px;">
      <img src="${w.imageUrl || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=300'}" alt="Preview" style="width:90px; height:90px; object-fit:cover; border-radius:12px; border:1px solid #c8dcd3;">
      <div>
        <span style="font-size:11px; font-weight:800; color:#187052; text-transform:uppercase;">READY FOR AI INFERENCE</span>
        <h3 style="margin:2px 0 4px; font-size:18px; color:#112920;">${w.animalType} Screening</h3>
        <span style="font-size:13px; color:#687570;">Image attached • ${w.symptoms.length} symptom(s) recorded</span>
      </div>
    </div>

    <div class="summary-row">
      <span>Animal Type:</span>
      <strong>${w.animalType}</strong>
    </div>
    <div class="summary-row" style="flex-direction:column; gap:6px;">
      <span>Recorded Symptoms:</span>
      <div class="summary-symptoms-wrap">${symptomsHtml}</div>
    </div>
    ${w.notes ? `
      <div class="summary-row" style="flex-direction:column; gap:4px;">
        <span>Additional Notes:</span>
        <span style="color:#2f4039; font-size:13px;">${w.notes}</span>
      </div>
    ` : ''}
  `;
}

async function executeAiScreening() {
  const runBtn = document.getElementById('runAiScreeningBtn');
  const loadingBox = document.getElementById('aiLoadingBox');
  const summaryBox = document.getElementById('step3SummaryBox');

  if (!AppState.screeningWizard.imageFile) {
    showToast('Please select an animal image first.');
    setWizardStep(1);
    return;
  }

  if (runBtn) runBtn.disabled = true;
  if (summaryBox) summaryBox.style.display = 'none';
  if (loadingBox) loadingBox.classList.add('active');

  try {
    const result = await ScreeningAPI.predict(AppState.screeningWizard.imageFile, {
      animalType: AppState.screeningWizard.animalType,
      symptoms: AppState.screeningWizard.symptoms,
      notes: AppState.screeningWizard.notes
    });

    AppState.screeningWizard.result = result;

    // Render Step 4 Results
    renderStep4Results(result);
    setWizardStep(4);

    // Trigger in-app notification
    NotificationsAPI.add({
      title: 'Screening Completed',
      message: `Screening for ${result.animalType} completed: ${result.prediction} (${result.confidence}%).`,
      type: result.isHealthy ? 'success' : 'warning',
      link: '#/history'
    });
    updateNotificationBadge();

    showToast(result.isHealthy ? 'Screening complete: Animal is healthy!' : `Alert: ${result.prediction} detected!`);
  } catch (err) {
    console.error('Screening failed:', err);
    showToast('AI analysis error. Please ensure backend is running or retry.');
  } finally {
    if (runBtn) runBtn.disabled = false;
    if (loadingBox) loadingBox.classList.remove('active');
    if (summaryBox) summaryBox.style.display = 'block';
  }
}

function renderStep4Results(result) {
  const container = document.getElementById('step4ResultContainer');
  if (!container || !result) return;

  const isHealthy = result.isHealthy;
  const badgeCls = isHealthy ? 'ok' : 'warn';
  const badgeBg = isHealthy ? '#146b4d' : '#b3392f';

  const isOnline = result.inferenceEngine === 'online_ai';
  const engineBadgeHtml = isOnline
    ? `<span class="engine-badge online" title="Processed via Google Gemini 2.5 Flash Multimodal Vision">☁️ Analyzed by Gemini Cloud Vision AI</span>`
    : `<span class="engine-badge offline" title="Processed via on-device TFLite edge model">⚡ Analyzed by Local Edge TFLite (Offline Fallback)</span>`;

  const probBars = result.probabilities ? Object.entries(result.probabilities).map(([key, val]) => {
    const pName = key === 'healthy' ? 'Healthy' : key.includes('foot') ? 'Foot & Mouth (FMD)' : 'Lumpy Skin (LSD)';
    const pColor = key === 'healthy' ? '#187052' : key.includes('foot') ? '#d9534f' : '#e09f3e';
    const numVal = typeof val === 'number' ? (val > 1 ? val : val * 100).toFixed(1) : '0.0';
    return `
      <div style="margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; color:#4a5954;">
          <span>${pName}</span>
          <strong>${numVal}%</strong>
        </div>
        <div style="background:#e0ebe6; height:8px; border-radius:4px; overflow:hidden;">
          <div style="background:${pColor}; width:${Math.min(numVal, 100)}%; height:100%; border-radius:4px; transition:width .6s ease;"></div>
        </div>
      </div>
    `;
  }).join('') : '';

  container.innerHTML = `
    <div class="result-card-container">
      <div class="result-header">
        <div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
            <span style="font-size:11px; font-weight:800; color:#187052; text-transform:uppercase; letter-spacing:0.8px;">AI SCREENING RESULT</span>
            ${engineBadgeHtml}
          </div>
          <h2 style="margin:4px 0 0; font-size:24px; color:#102c23;">${result.title}</h2>
          <span style="color:#687570; font-size:13px;">${result.animalType} • ${result.statusText}</span>
        </div>
        <span class="result-badge ${badgeCls}" style="background:${badgeBg};">
          ${result.confidence}% Confidence
        </span>
      </div>


      <div style="margin-bottom:18px;">
        <strong style="display:block; font-size:13px; color:#1b382d; margin-bottom:4px;">AI Clinical Assessment:</strong>
        <p style="margin:0; font-size:14px; color:#3d4e47; line-height:1.5;">${result.summary}</p>
      </div>

      <div style="background:#fff; border:1px solid #c9ded5; border-radius:14px; padding:16px; margin-bottom:18px;">
        <strong style="display:block; font-size:12px; color:#233d32; margin-bottom:10px; text-transform:uppercase;">Disease Probability Breakdown</strong>
        ${probBars}
      </div>

      <div style="background:#e8f4ef; border-radius:12px; padding:16px; font-size:13px; color:#154f3e; line-height:1.5;">
        <strong style="font-size:14px;">Recommended Next Steps:</strong><br>
        <span style="margin-top:4px; display:block;">${result.action}</span>
      </div>

      <div class="disclaimer-box">
        <span style="font-size:18px;">⚠️</span>
        <span>This AI screening is for preliminary assistance only and should not replace professional veterinary diagnosis.</span>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px;">
      <button class="secondary-btn" id="saveScreeningBtn">💾 Save to History</button>
      <div style="display:flex; gap:10px;">
        <button class="secondary-btn" onclick="window.location.hash='#/history'">View Screening History</button>
        <button class="analyze-btn" id="startNewScreeningBtn">Start New Screening</button>
      </div>
    </div>
  `;

  // Bind Step 4 buttons
  const saveBtn = document.getElementById('saveScreeningBtn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      HistoryAPI.add({
        animalName: `${result.animalType} #${Math.floor(1000 + Math.random() * 9000)}`,
        animalType: result.animalType,
        prediction: result.prediction,
        rawClass: result.rawClass,
        confidence: result.confidence,
        statusText: result.statusText,
        badgeClass: result.badgeClass,
        symptoms: result.symptoms,
        notes: result.notes,
        imageUrl: AppState.screeningWizard.imageUrl,
        title: result.title,
        summary: result.summary,
        action: result.action,
        probabilities: result.probabilities
      });
      showToast('Screening successfully saved to History!');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saved ✓';
    };
  }

  const newBtn = document.getElementById('startNewScreeningBtn');
  if (newBtn) {
    newBtn.onclick = resetScreeningWizard;
  }
}

function resetScreeningWizard() {
  removeSelectedImage();
  AppState.screeningWizard = {
    currentStep: 1,
    animalType: 'Cattle',
    imageFile: null,
    imageUrl: '',
    symptoms: [],
    notes: '',
    result: null
  };

  // Reset checkboxes and textareas
  document.querySelectorAll('#view-new-screening input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.closest('.symptom-toggle')?.classList.remove('checked');
  });

  const notesEl = document.getElementById('screeningNotes');
  if (notesEl) notesEl.value = '';

  setWizardStep(1);
}

/* ==========================================================================
   4. SCREENING HISTORY CONTROLLER
   ========================================================================== */
function initHistoryView() {
  renderHistoryTable();
}

function renderHistoryTable() {
  const tbody = document.getElementById('historyTableTbody');
  if (!tbody) return;

  const search = document.getElementById('historySearch')?.value || '';
  const animalType = document.getElementById('historyAnimalFilter')?.value || 'all';
  const disease = document.getElementById('historyDiseaseFilter')?.value || 'all';
  const status = document.getElementById('historyStatusFilter')?.value || 'all';
  const dateRange = document.getElementById('historyDateFilter')?.value || 'all';

  const records = HistoryAPI.filter({ search, animalType, disease, status, dateRange });

  if (records.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3 style="margin:0 0 6px; color:#1f332c;">No matching screenings found</h3>
            <p style="margin:0; font-size:13px;">Try adjusting your filters or start a new screening.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = records.map(r => `
    <tr>
      <td>
        <strong>${r.animalName}</strong><br>
        <span style="font-size:11px; color:#788882;">${r.id}</span>
      </td>
      <td>${r.animalType}</td>
      <td>${r.dateFormatted || 'Recently'}</td>
      <td>
        <span class="status ${r.badgeClass}">${r.prediction}</span>
      </td>
      <td><strong>${r.confidence}%</strong></td>
      <td>
        <span class="status ${r.badgeClass}">${r.statusText}</span>
      </td>
      <td>
        <button class="btn-view-details view-detail-btn" data-id="${r.id}">
          <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span>View Details</span>
        </button>
      </td>
    </tr>
  `).join('');


  // Bind view details buttons
  tbody.querySelectorAll('.view-detail-btn').forEach(btn => {
    btn.onclick = () => {
      const rec = HistoryAPI.getById(btn.dataset.id);
      if (rec) DetailModal.open(rec);
    };
  });
}

/* ==========================================================================
   5. ANALYTICS VIEW CONTROLLER
   ========================================================================== */
function initAnalyticsView() {
  const summary = AnalyticsAPI.getSummary();

  const totalEl = document.getElementById('anTotalScreenings');
  const healthyEl = document.getElementById('anHealthyCount');
  const attentionEl = document.getElementById('anAttentionCount');
  const confEl = document.getElementById('anAvgConfidence');

  if (totalEl) totalEl.textContent = summary.total;
  if (healthyEl) healthyEl.textContent = summary.healthy;
  if (attentionEl) attentionEl.textContent = summary.attention;
  if (confEl) confEl.textContent = summary.avgConfidence;

  // Render Charts
  const activityData = AnalyticsAPI.getActivityTrend();
  ChartRenderer.renderActivityChart('activityTrendChart', activityData);

  const diseaseData = AnalyticsAPI.getDiseaseDistribution();
  ChartRenderer.renderDonutChart('diseaseDonutChartContainer', diseaseData);

  ChartRenderer.renderComparisonBar('healthyVsAttentionBarContainer', summary.healthy, summary.attention);

  const animalData = AnalyticsAPI.getAnimalDistribution();
  ChartRenderer.renderAnimalBreakdown('animalBreakdownContainer', animalData);
}

/* ==========================================================================
   6. VETERINARY HELP CONTROLLER
   ========================================================================== */
function initVetHelpView() {
  const currentLang = AppState.currentLang || 'en';
  const emergency = VetAPI.getEmergencyContact();
  const vets = VetAPI.getNearbyVets();
  const careGuides = VetAPI.getCareGuidelines(currentLang);

  // Render Emergency banner
  const emerTitle = document.getElementById('vetEmergencyTitle');
  const emerPhone = document.getElementById('vetEmergencyPhone');
  if (emerTitle) emerTitle.textContent = emergency.title;
  if (emerPhone) emerPhone.textContent = `Call: ${emergency.tollFree}`;

  // Render Vet directory cards
  const vetList = document.getElementById('vetDirectoryGrid');
  if (vetList) {
    vetList.innerHTML = vets.map(v => `
      <div class="vet-card">
        <div class="vet-card-header">
          <div>
            <h3 style="margin:0 0 4px; font-size:16px; color:#122a22;">${v.name}</h3>
            <span style="font-size:13px; color:#687570;">${v.clinic}</span>
          </div>
          <span style="background:#eaf3ee; color:#155f46; font-size:12px; font-weight:700; padding:4px 9px; border-radius:12px;">
            ★ ${v.rating} (${v.reviewsCount})
          </span>
        </div>
        <p style="margin:0 0 12px; font-size:13px; color:#495852; line-height:1.4;">
          📍 ${v.location} • <strong>${v.distance}</strong><br>
          🩺 ${v.specialization}<br>
          🕒 <span style="color:#187052; font-weight:600;">${v.availability}</span>
        </p>
        <div style="margin-top:auto; display:flex; justify-content:space-between; align-items:center; border-top:1px solid #edf4f0; padding-top:12px;">
          <span style="font-size:12px; color:#788681;">${v.status}</span>
          <div style="display:flex; gap:8px;">
            <a href="tel:${v.phone.replace(/[^0-9+]/g, '')}" class="vet-call-btn">📞 Call</a>
            <button class="vet-details-btn" onclick="alert('👨‍⚕️ ${v.name}\\n🏥 Clinic: ${v.clinic}\\n📍 Address: ${v.address}\\n📞 Phone: ${v.phone}\\n🩺 Specialization: ${v.specialization}\\n🕒 Hours: ${v.availability}')">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render Care Guides
  const guidesContainer = document.getElementById('careGuidesAccordion');
  if (guidesContainer) {
    guidesContainer.innerHTML = careGuides.map((g, idx) => `
      <div class="care-guide-card">
        <div class="care-guide-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
          <span>🩺 ${g.disease} Care Protocol</span>
          <span>▼</span>
        </div>
        <div class="care-guide-body" style="${idx === 0 ? 'display:block;' : 'display:none;'}">
          <div style="background:#eaf5f0; border-radius:10px; padding:10px 14px; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
            <span style="font-size:16px;">🔍</span>
            <div>
              <strong style="color:#187052; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Key Symptoms to Monitor:</strong>
              <div style="color:#334a41; font-size:13px; margin-top:2px;">${g.symptoms.join(' • ')}</div>
            </div>
          </div>
          
          <div class="protocol-grid">
            <!-- DO'S CARD -->
            <div class="protocol-callout dos">
              <div class="callout-header">
                <span class="callout-badge dos">✓ RECOMMENDED CARE (DO'S)</span>
              </div>
              <ul class="callout-list dos">
                ${g.dos.map(d => `<li><span class="bullet dos">✓</span><span>${d}</span></li>`).join('')}
              </ul>
            </div>

            <!-- DON'TS CARD -->
            <div class="protocol-callout donts">
              <div class="callout-header">
                <span class="callout-badge donts">✕ CRITICAL RESTRICTIONS (DON'TS)</span>
              </div>
              <ul class="callout-list donts">
                ${g.donts.map(d => `<li><span class="bullet donts">✕</span><span>${d}</span></li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
}

/* ==========================================================================
   7. NOTIFICATIONS VIEW CONTROLLER
   ========================================================================== */
function initNotificationsView() {
  renderNotificationsList();
  updateNotificationBadge();
}

function renderNotificationsList(filter = 'all') {
  const container = document.getElementById('notificationsListContainer');
  if (!container) return;

  let list = NotificationsAPI.getAll();
  if (filter === 'unread') list = list.filter(n => !n.isRead);
  if (filter === 'alerts') list = list.filter(n => n.type === 'warning');

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔔</div>
        <h3 style="margin:0 0 6px; color:#1b332b;">No notifications</h3>
        <p style="margin:0; font-size:13px;">You're all caught up with your livestock alerts.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(n => `
    <div class="notif-item ${!n.isRead ? 'unread' : ''}" data-id="${n.id}" data-link="${n.link}">
      <div class="notif-dot"></div>
      <div class="notif-icon ${n.type}">
        ${n.type === 'warning' ? '⚠️' : n.type === 'success' ? '✓' : 'ℹ️'}
      </div>
      <div style="flex:1;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:3px;">
          <strong style="font-size:14px; color:#142921;">${n.title}</strong>
          <span style="font-size:11px; color:#788882;">${n.dateFormatted || 'Recently'}</span>
        </div>
        <p style="margin:0; font-size:13px; color:#495852; line-height:1.45;">${n.message}</p>
      </div>
    </div>
  `).join('');

  // Bind notification click
  container.querySelectorAll('.notif-item').forEach(item => {
    item.onclick = () => {
      NotificationsAPI.markAsRead(item.dataset.id);
      updateNotificationBadge();
      const link = item.dataset.link;
      if (link) window.location.hash = link;
    };
  });
}

function updateNotificationBadge() {
  const count = NotificationsAPI.getUnreadCount();
  const badges = document.querySelectorAll('.badge-count');
  badges.forEach(b => {
    if (count > 0) {
      b.textContent = count;
      b.style.display = 'inline-block';
    } else {
      b.style.display = 'none';
    }
  });
}

/* ==========================================================================
   8. SETTINGS VIEW CONTROLLER
   ========================================================================== */
function initSettingsView() {
  const settings = SettingsAPI.getSettings();

  // Populate profile fields
  const nameInput = document.getElementById('setFullName');
  const farmInput = document.getElementById('setFarmName');
  const locInput = document.getElementById('setLocation');
  const phoneInput = document.getElementById('setPhone');
  const emailInput = document.getElementById('setEmail');
  const herdInput = document.getElementById('setHerdSize');

  if (nameInput && settings.profile) nameInput.value = settings.profile.fullName || '';
  if (farmInput && settings.profile) farmInput.value = settings.profile.farmName || '';
  if (locInput && settings.profile) locInput.value = settings.profile.location || '';
  if (phoneInput && settings.profile) phoneInput.value = settings.profile.contactNumber || '';
  if (emailInput && settings.profile) emailInput.value = settings.profile.email || '';
  if (herdInput && settings.profile) herdInput.value = settings.profile.herdSize || '';

  // Populate settings tabs
  bindSettingsNav();
}

function bindSettingsNav() {
  document.querySelectorAll('.settings-nav-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.settings-nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.settings-content-section').forEach(s => s.classList.remove('active-section'));

      btn.classList.add('active');
      const section = document.getElementById(`settings-sec-${btn.dataset.section}`);
      if (section) section.classList.add('active-section');
    };
  });

  // Profile Save
  const saveProfBtn = document.getElementById('saveProfileBtn');
  if (saveProfBtn) {
    saveProfBtn.onclick = () => {
      SettingsAPI.updateSection('profile', {
        fullName: document.getElementById('setFullName')?.value || '',
        farmName: document.getElementById('setFarmName')?.value || '',
        location: document.getElementById('setLocation')?.value || '',
        contactNumber: document.getElementById('setPhone')?.value || '',
        email: document.getElementById('setEmail')?.value || '',
        herdSize: document.getElementById('setHerdSize')?.value || ''
      });
      showToast('Profile settings saved successfully!');
    };
  }

  // Export Data
  const exportBtn = document.getElementById('exportHistoryJsonBtn');
  if (exportBtn) {
    exportBtn.onclick = () => {
      const data = HistoryAPI.getAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pashurakshak_screenings_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      showToast('Screening history exported as JSON!');
    };
  }
}

/* ==========================================================================
   9. MULTILINGUAL TRANSLATION HANDLER
   ========================================================================== */
export function applyLanguage(lang) {
  const selectedLang = Translations[lang] ? lang : 'en';
  AppState.currentLang = selectedLang;
  const t = Translations[selectedLang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) el.textContent = t[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key]) el.placeholder = t[key];
  });

  document.documentElement.lang = selectedLang;
  localStorage.setItem('pashurakshak_language', selectedLang);

  const langSelect = document.getElementById('lang');
  if (langSelect) langSelect.value = selectedLang;

  // Refresh wizard step buttons in active language
  if (AppState.screeningWizard) {
    const nextBtn = document.getElementById('wizardNextBtn');
    const backBtn = document.getElementById('wizardBackBtn');
    const step = AppState.screeningWizard.currentStep;
    if (backBtn) backBtn.textContent = t.backBtn || '← Back';
    if (nextBtn) {
      if (step === 1) nextBtn.textContent = t.continueToSymptoms || 'Continue to Symptoms →';
      else if (step === 2) nextBtn.textContent = t.continueToReview || 'Continue to Review →';
    }
  }

  // Refresh veterinary care protocols if on vet page
  if (AppState.currentRoute === 'veterinary-help') {
    initVetHelpView();
  }
}

/* ==========================================================================
   10. TOAST NOTIFICATION HELPER
   ========================================================================== */
export function showToast(msg, duration = 3200) {
  const toast = document.getElementById('appToast');
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* ==========================================================================
   11. INITIALIZATION & GLOBAL EVENT BINDING
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Listen for hash route changes
  window.addEventListener('hashchange', handleRoute);

  // Initialize router
  handleRoute();

  // Load saved language
  const savedLang = localStorage.getItem('pashurakshak_language') || 'en';
  applyLanguage(savedLang);

  // Language dropdown event
  const langDropdown = document.getElementById('lang');
  if (langDropdown) {
    langDropdown.addEventListener('change', e => {
      applyLanguage(e.target.value);
      showToast(e.target.value === 'hi' ? 'भाषा बदल दी गई (Hindi applied)' : e.target.value === 'mr' ? 'भाषा बदलली आहे (Marathi applied)' : 'Language updated to English');
    });
  }

  // Navigation click delegates
  document.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.dataset.route);
    });
  });

  // Mobile Hamburger & Backdrop Drawer Toggle
  const hamburger = document.getElementById('mobileHamburgerBtn');
  const side = document.querySelector('.side');
  const backdrop = document.getElementById('sidebarBackdrop');

  function openDrawer() {
    side?.classList.add('drawer-open');
    backdrop?.classList.add('active');
  }

  function closeDrawer() {
    side?.classList.remove('drawer-open');
    backdrop?.classList.remove('active');
  }

  if (hamburger) {
    hamburger.onclick = () => {
      if (side?.classList.contains('drawer-open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    };
  }

  if (backdrop) {
    backdrop.onclick = closeDrawer;
  }

  // Auto-close mobile drawer when navigating
  document.querySelectorAll('.side button, .side a, [data-route]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeDrawer();
      }
    });
  });

  // Bind New Screening Wizard Controls
  initWizardEvents();

  // Bind History Filter Events
  initHistoryFilterEvents();

  // Update notification badge
  updateNotificationBadge();
});


function initWizardEvents() {
  // Animal chip selection
  document.querySelectorAll('.animal-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.animal-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      AppState.screeningWizard.animalType = chip.dataset.animal || 'Cattle';
    });
  });

  // Dropzone drag & drop
  const dropzone = document.getElementById('screeningDropzone');
  const fileInput = document.getElementById('wizardFileInput');
  const cameraInput = document.getElementById('wizardCameraInput');

  if (dropzone && fileInput) {
    dropzone.onclick = () => fileInput.click();

    dropzone.addEventListener('dragover', e => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageSelected(e.dataTransfer.files[0]);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) handleImageSelected(e.target.files[0]);
    });
  }

  if (cameraInput) {
    cameraInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) handleImageSelected(e.target.files[0]);
    });
  }

  // Camera trigger button
  const camBtn = document.getElementById('wizardCameraBtn');
  if (camBtn && cameraInput) {
    camBtn.onclick = (e) => {
      e.stopPropagation();
      cameraInput.click();
    };
  }

  // Remove photo button
  const removeBtn = document.getElementById('removePhotoBtn');
  if (removeBtn) removeBtn.onclick = removeSelectedImage;

  // Symptom Checkbox Toggles
  document.querySelectorAll('#view-new-screening input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('.symptom-toggle')?.classList.toggle('checked', cb.checked);
      const selected = Array.from(document.querySelectorAll('#view-new-screening input[type="checkbox"]:checked'))
        .map(i => i.value);
      AppState.screeningWizard.symptoms = selected;
    });
  });

  // Notes textarea
  const notesArea = document.getElementById('screeningNotes');
  if (notesArea) {
    notesArea.addEventListener('input', e => {
      AppState.screeningWizard.notes = e.target.value;
    });
  }

  // Wizard Next & Back Buttons
  const nextBtn = document.getElementById('wizardNextBtn');
  const backBtn = document.getElementById('wizardBackBtn');

  if (nextBtn) {
    nextBtn.onclick = () => {
      const step = AppState.screeningWizard.currentStep;
      if (step === 1) {
        if (!AppState.screeningWizard.imageFile) {
          showToast('Please upload an animal photo first.');
          return;
        }
        setWizardStep(2);
      } else if (step === 2) {
        setWizardStep(3);
      }
    };
  }

  if (backBtn) {
    backBtn.onclick = () => {
      const step = AppState.screeningWizard.currentStep;
      if (step > 1) setWizardStep(step - 1);
    };
  }

  // Run AI Screening Action
  const runAiBtn = document.getElementById('runAiScreeningBtn');
  if (runAiBtn) {
    runAiBtn.onclick = executeAiScreening;
  }
}

function initHistoryFilterEvents() {
  ['historySearch', 'historyAnimalFilter', 'historyDiseaseFilter', 'historyStatusFilter', 'historyDateFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', renderHistoryTable);
      el.addEventListener('change', renderHistoryTable);
    }
  });

  // Notification Filter Buttons
  document.querySelectorAll('.notif-tab-pill, .notif-filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.notif-tab-pill, .notif-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderNotificationsList(btn.dataset.filter);
    };
  });

  // Mark all read button
  const markAllBtn = document.getElementById('markAllReadBtn');
  if (markAllBtn) {
    markAllBtn.onclick = () => {
      NotificationsAPI.markAllAsRead();
      renderNotificationsList();
      updateNotificationBadge();
      showToast('All notifications marked as read.');
    };
  }
}

