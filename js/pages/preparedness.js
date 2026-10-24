import { READINESS_TASKS, SURVIVAL_BAG_ITEMS, EMERGENCY_CONTACTS } from '../data/readiness-tasks.js';

const CHECKLIST_STORAGE_KEY = 'kotatangguh:checklist';
const TSB_STORAGE_KEY = 'kotatangguh:tsb';

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupPrintButton();
  setupResetButton();
  renderTSBSection();
  renderChecklists();
  renderEmergencyContacts();
  updateTotalResilienceScore();
});

function setupMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
}

function setupPrintButton() {
  const btn = document.getElementById('btn-print');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.print();
  });
}

function setupResetButton() {
  const btn = document.getElementById('btn-reset');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh progres checklist dan Tas Siaga Bencana?')) {
      localStorage.removeItem(CHECKLIST_STORAGE_KEY);
      localStorage.removeItem(TSB_STORAGE_KEY);

      // Uncheck all inputs in DOM
      document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        const parentCard = cb.closest('.check-card');
        if (parentCard) parentCard.classList.remove('checked');
      });

      updateTotalResilienceScore();
    }
  });
}

function getSavedData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecklistData() {
  const data = {};
  document.querySelectorAll('.task-checkbox').forEach(cb => {
    data[cb.id] = cb.checked;
  });
  localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(data));
}

function saveTSBData() {
  const data = {};
  document.querySelectorAll('.tsb-checkbox').forEach(cb => {
    data[cb.id] = cb.checked;
  });
  localStorage.setItem(TSB_STORAGE_KEY, JSON.stringify(data));
}

function renderTSBSection() {
  const container = document.getElementById('tsb-items-container');
  if (!container) return;

  const saved = getSavedData(TSB_STORAGE_KEY);
  container.innerHTML = '';

  SURVIVAL_BAG_ITEMS.forEach(item => {
    const isChecked = Boolean(saved[item.id]);

    const card = document.createElement('label');
    card.className = `check-card ${isChecked ? 'checked' : ''}`;
    card.htmlFor = item.id;

    card.innerHTML = `
      <input type="checkbox" id="${item.id}" class="check-input tsb-checkbox" ${isChecked ? 'checked' : ''}>
      <div class="check-content">
        <div class="check-title">${item.name}</div>
        <div class="check-desc">Bobot kelangsungan hidup: <strong>${item.weight}%</strong></div>
      </div>
    `;

    const cb = card.querySelector('input');
    cb.addEventListener('change', () => {
      if (cb.checked) {
        card.classList.add('checked');
      } else {
        card.classList.remove('checked');
      }
      saveTSBData();
      updateTotalResilienceScore();
    });

    container.appendChild(card);
  });
}

function renderChecklists() {
  const saved = getSavedData(CHECKLIST_STORAGE_KEY);

  const categories = [
    { cat: 'before', containerId: 'checklist-before' },
    { cat: 'during', containerId: 'checklist-during' },
    { cat: 'travel', containerId: 'checklist-travel' },
    { cat: 'airquality', containerId: 'checklist-airquality' },
  ];

  categories.forEach(({ cat, containerId }) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const tasks = READINESS_TASKS.filter(t => t.category === cat);
    container.innerHTML = '';

    tasks.forEach(task => {
      const isChecked = Boolean(saved[task.id]);

      const card = document.createElement('label');
      card.className = `check-card ${isChecked ? 'checked' : ''}`;
      card.htmlFor = task.id;

      card.innerHTML = `
        <input type="checkbox" id="${task.id}" class="check-input task-checkbox" ${isChecked ? 'checked' : ''}>
        <div class="check-content">
          <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 6px;">
            <div class="check-title">${task.title}</div>
            <span class="badge ${task.priority === 'Kritis' ? 'status-danger' : task.priority === 'Tinggi' ? 'status-warning' : 'status-notice'}" style="font-size: 0.65rem;">
              ${task.priority}
            </span>
          </div>
          <div class="check-desc">${task.description}</div>
          ${task.sourceUrl ? `<a href="${task.sourceUrl}" target="_blank" rel="noopener" style="font-size: 0.75rem; color: var(--primary-light); display: inline-block; margin-top: 4px;">Info Resmi BMKG/BNPB →</a>` : ''}
        </div>
      `;

      const cb = card.querySelector('input');
      cb.addEventListener('change', () => {
        if (cb.checked) {
          card.classList.add('checked');
        } else {
          card.classList.remove('checked');
        }
        saveChecklistData();
        updateTotalResilienceScore();
      });

      container.appendChild(card);
    });
  });
}

function updateTotalResilienceScore() {
  const taskCheckboxes = document.querySelectorAll('.task-checkbox');
  const tsbCheckboxes = document.querySelectorAll('.tsb-checkbox');

  const totalTasks = taskCheckboxes.length;
  const checkedTasks = Array.from(taskCheckboxes).filter(cb => cb.checked).length;

  const totalTSB = tsbCheckboxes.length;
  const checkedTSB = Array.from(tsbCheckboxes).filter(cb => cb.checked).length;

  // TSB Percentage
  const tsbPct = totalTSB > 0 ? Math.round((checkedTSB / totalTSB) * 100) : 0;
  const tsbBadge = document.getElementById('tsb-progress-badge');
  if (tsbBadge) {
    tsbBadge.textContent = `Kelengkapan TSB: ${tsbPct}%`;
    tsbBadge.className = tsbPct === 100 ? 'badge status-normal' : tsbPct > 50 ? 'badge status-notice' : 'badge status-warning';
  }

  // Combined Household Score: 50% from tasks + 50% from TSB
  const taskPct = totalTasks > 0 ? (checkedTasks / totalTasks) : 0;
  const tsbRatio = totalTSB > 0 ? (checkedTSB / totalTSB) : 0;
  const overallPct = Math.round(((taskPct * 0.5) + (tsbRatio * 0.5)) * 100);

  // Update DOM Elements
  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  const percentText = document.getElementById('progress-percent');
  const scoreBig = document.getElementById('score-big');
  const rankBadge = document.getElementById('badge-rank');
  const statusDesc = document.getElementById('score-status-desc');

  if (fill) fill.style.width = `${overallPct}%`;
  if (text) text.textContent = `${checkedTasks + checkedTSB} / ${totalTasks + totalTSB} Langkah Terpenuhi`;
  if (percentText) percentText.textContent = `${overallPct}% Siaga`;
  if (scoreBig) scoreBig.textContent = `${overallPct}%`;

  if (rankBadge && statusDesc) {
    if (overallPct >= 90) {
      rankBadge.className = 'badge status-normal';
      rankBadge.textContent = 'Tingkat: Pahlawan Ketahanan Iklim';
      statusDesc.textContent = 'Hunian & Keluarga Anda Sangat Siap!';
    } else if (overallPct >= 60) {
      rankBadge.className = 'badge status-notice';
      rankBadge.textContent = 'Tingkat: Keluarga Tanggap Bencana';
      statusDesc.textContent = 'Kesiapan Baik, Lengkapi Sisanya!';
    } else if (overallPct >= 30) {
      rankBadge.className = 'badge status-warning';
      rankBadge.textContent = 'Tingkat: Warga Waspada Mula';
      statusDesc.textContent = 'Terus Lengkapi Tas Siaga Bencana!';
    } else {
      rankBadge.className = 'badge status-danger';
      rankBadge.textContent = 'Tingkat: Belum Terproteksi';
      statusDesc.textContent = 'Ayo Mulai Lengkapi Checklist!';
    }
  }
}

function renderEmergencyContacts() {
  const container = document.getElementById('emergency-contacts-grid');
  if (!container) return;

  container.innerHTML = '';

  EMERGENCY_CONTACTS.forEach(contact => {
    const card = document.createElement('a');
    card.href = `tel:${contact.number}`;
    card.className = 'hotline-card';
    card.style.textDecoration = 'none';

    card.innerHTML = `
      <div class="hotline-info">
        <h4>${contact.name}</h4>
        <p>${contact.desc}</p>
      </div>
      <div class="hotline-number">${contact.number}</div>
    `;

    container.appendChild(card);
  });
}
