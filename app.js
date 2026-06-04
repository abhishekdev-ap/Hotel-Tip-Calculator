 // --- DOM Selection ---
const billInput = document.getElementById('input-bill');
const presetButtons = document.querySelectorAll('.btn-preset');
const customTipBox = document.getElementById('custom-tip-box');
const tipSlider = document.getElementById('input-tip-slider');
const sliderValDisplay = document.getElementById('slider-val-display');
const peopleInput = document.getElementById('input-people');
const btnDecrement = document.getElementById('btn-decrement');
const btnIncrement = document.getElementById('btn-increment');
const peopleSuffixTxt = document.getElementById('people-suffix-txt');

// Output DOM Elements
const valSplitShare = document.getElementById('val-split-share');
const valBaseShare = document.getElementById('val-base-share');
const valTipShare = document.getElementById('val-tip-share');
const valTotalTip = document.getElementById('val-total-tip');
const valGrandTotal = document.getElementById('val-grand-total');

// Action Buttons
const btnReset = document.getElementById('btn-reset');
const btnSave = document.getElementById('btn-save');
const btnShare = document.getElementById('btn-share');
const toast = document.getElementById('toast');

// History DOM Elements
const historyEmptyState = document.getElementById('history-empty-state');
const historyList = document.getElementById('history-list');
const btnClearHistory = document.getElementById('btn-clear-history');

// --- State Variables ---
let currentTipPercent = 10; // Default active preset is 10%
let isCustomTip = false;
let historyData = [];

// --- Helper Functions ---

// Formatting utilities
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Floating point safe calculation helper
const calculateSplit = (bill, tipPercent, people) => {
  // Use cents to avoid JS floating point issues where possible
  const billCents = Math.round(bill * 100);
  const tipFactor = tipPercent / 100;
  
  const totalTipCents = Math.round(billCents * tipFactor);
  const grandTotalCents = billCents + totalTipCents;
  
  // Calculate shares (per person)
  const totalTipShareCents = Math.round(totalTipCents / people);
  const baseShareCents = Math.round(billCents / people);
  const splitShareCents = Math.round(grandTotalCents / people);
  
  return {
    totalTip: totalTipCents / 100,
    grandTotal: grandTotalCents / 100,
    tipShare: totalTipShareCents / 100,
    baseShare: baseShareCents / 100,
    splitShare: splitShareCents / 100
  };
};

// Animated number counters for premium feel
const animateValue = (element, start, end, duration = 300) => {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    // Easing out quadratic function
    const easeProgress = progress * (2 - progress);
    const currentValue = start + easeProgress * (end - start);
    
    element.textContent = formatCurrency(currentValue);
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = formatCurrency(end);
    }
  };
  window.requestAnimationFrame(step);
};

// Quick map to track current values of targets for continuous animations
const animationTargets = new Map([
  [valSplitShare, 0],
  [valBaseShare, 0],
  [valTipShare, 0],
  [valTotalTip, 0],
  [valGrandTotal, 0]
]);

const updateResultsDisplay = (results, animate = true) => {
  for (const [element, key] of [
    [valSplitShare, 'splitShare'],
    [valBaseShare, 'baseShare'],
    [valTipShare, 'tipShare'],
    [valTotalTip, 'totalTip'],
    [valGrandTotal, 'grandTotal']
  ]) {
    const endVal = results[key];
    const startVal = animationTargets.get(element) || 0;
    
    if (animate && Math.abs(startVal - endVal) > 0.005) {
      animateValue(element, startVal, endVal, 250);
    } else {
      element.textContent = formatCurrency(endVal);
    }
    animationTargets.set(element, endVal);
  }
};

// Sync slider background fill progress for Webkit
const syncSliderProgress = () => {
  const min = parseInt(tipSlider.min) || 0;
  const max = parseInt(tipSlider.max) || 100;
  const val = parseInt(tipSlider.value) || 0;
  const percentage = ((val - min) / (max - min)) * 100;
  tipSlider.style.setProperty('--progress', `${percentage}%`);
};

// Input validation check
const validateInputs = () => {
  let isValid = true;
  
  // Validate Bill
  const billValStr = billInput.value.trim();
  const billVal = parseFloat(billValStr);
  const groupBill = document.getElementById('group-bill');
  
  if (billValStr === '' || isNaN(billVal) || billVal <= 0) {
    isValid = false;
    if (billValStr !== '') {
      billInput.classList.add('user-invalid');
      billInput.setAttribute('aria-invalid', 'true');
    }
  } else {
    billInput.classList.remove('user-invalid');
    billInput.removeAttribute('aria-invalid');
  }

  // Validate People
  const peopleValStr = peopleInput.value.trim();
  const peopleVal = parseInt(peopleValStr);
  const groupSplit = document.getElementById('group-split');
  
  if (peopleValStr === '' || isNaN(peopleVal) || peopleVal < 1) {
    isValid = false;
    if (peopleValStr !== '') {
      peopleInput.classList.add('user-invalid');
      peopleInput.setAttribute('aria-invalid', 'true');
    }
  } else {
    peopleInput.classList.remove('user-invalid');
    peopleInput.removeAttribute('aria-invalid');
  }

  // Handle action button states
  btnSave.disabled = !isValid;
  btnShare.disabled = !isValid;
  
  return isValid;
};

// Main trigger function
const performCalculation = (animate = true) => {
  if (!validateInputs()) {
    updateResultsDisplay({
      splitShare: 0,
      baseShare: 0,
      tipShare: 0,
      totalTip: 0,
      grandTotal: 0
    }, false);
    return;
  }
  
  const bill = parseFloat(billInput.value) || 0;
  const people = parseInt(peopleInput.value) || 1;
  const tip = isCustomTip ? parseInt(tipSlider.value) : currentTipPercent;
  
  const results = calculateSplit(bill, tip, people);
  updateResultsDisplay(results, animate);
};

// Show a beautiful sliding toast
const showToast = (message) => {
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color:var(--emerald-primary)"><polyline points="20 6 9 17 4 12"/></svg>
    ${message}
  `;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
};

// --- LocalStorage History Actions ---

const loadHistory = () => {
  try {
    const data = localStorage.getItem('fareshare_history');
    historyData = data ? JSON.parse(data) : [];
  } catch (e) {
    historyData = [];
  }
  renderHistory();
};

const saveHistoryItem = () => {
  if (!validateInputs()) return;
  
  const bill = parseFloat(billInput.value) || 0;
  const people = parseInt(peopleInput.value) || 1;
  const tip = isCustomTip ? parseInt(tipSlider.value) : currentTipPercent;
  
  const results = calculateSplit(bill, tip, people);
  
  const newItem = {
    id: Date.now(),
    bill,
    tip,
    people,
    splitShare: results.splitShare,
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  };
  
  historyData.unshift(newItem); // Add to beginning
  if (historyData.length > 8) historyData.pop(); // Limit to 8 items
  
  localStorage.setItem('fareshare_history', JSON.stringify(historyData));
  renderHistory();
  showToast('Split calculation saved successfully');
};

const deleteHistoryItem = (id) => {
  historyData = historyData.filter(item => item.id !== id);
  localStorage.setItem('fareshare_history', JSON.stringify(historyData));
  renderHistory();
  showToast('Calculation removed');
};

const loadHistoryItem = (id) => {
  const item = historyData.find(i => i.id === id);
  if (!item) return;
  
  billInput.value = item.bill.toFixed(2);
  peopleInput.value = item.people;
  peopleSuffixTxt.textContent = item.people === 1 ? 'Person' : 'People';
  
  // Match Tip preset or custom
  const isPreset = [10, 12, 15, 20].includes(item.tip);
  
  presetButtons.forEach(btn => {
    const btnTip = btn.dataset.tip;
    if (isPreset && btnTip === String(item.tip)) {
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      isCustomTip = false;
      currentTipPercent = item.tip;
      customTipBox.classList.add('hidden');
    } else if (!isPreset && btnTip === 'custom') {
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      isCustomTip = true;
      tipSlider.value = item.tip;
      sliderValDisplay.textContent = `${item.tip}%`;
      customTipBox.classList.remove('hidden');
      syncSliderProgress();
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-checked', 'false');
    }
  });
  
  // Recalculate
  performCalculation(true);
  showToast('Split loaded into inputs');
};

const clearAllHistory = () => {
  if (historyData.length === 0) return;
  
  if (confirm('Are you sure you want to clear all saved splits?')) {
    historyData = [];
    localStorage.removeItem('fareshare_history');
    renderHistory();
    showToast('All saved splits cleared');
  }
};

const renderHistory = () => {
  if (historyData.length === 0) {
    historyEmptyState.style.display = 'block';
    historyList.innerHTML = '';
    return;
  }
  
  historyEmptyState.style.display = 'none';
  historyList.innerHTML = historyData.map(item => `
    <li class="history-item" data-id="${item.id}">
      <div class="history-icon-box" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <div class="history-details">
        <span class="history-bill-val">$${formatCurrency(item.bill)} &bull; ${item.tip}% Tip</span>
        <span class="history-meta-desc">${item.people} ${item.people === 1 ? 'person' : 'people'} &bull; ${item.date}</span>
      </div>
      <div class="history-actions">
        <button type="button" class="btn-history-load" data-action="load">Load</button>
        <button type="button" class="btn-history-del" data-action="delete" aria-label="Delete saved item">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>
    </li>
  `).join('');
};

// --- Event Listeners ---

// Sanitize & format total bill as currency typing
billInput.addEventListener('input', (e) => {
  let val = e.target.value;
  
  // Clean all characters except digits and single decimal point
  val = val.replace(/[^0-9.]/g, '');
  
  // Only allow one decimal point
  const dotIndex = val.indexOf('.');
  if (dotIndex !== -1) {
    val = val.substring(0, dotIndex + 1) + val.substring(dotIndex + 1).replace(/\./g, '');
    
    // Max 2 decimal digits
    const decimalParts = val.split('.');
    if (decimalParts[1].length > 2) {
      val = `${decimalParts[0]}.${decimalParts[1].substring(0, 2)}`;
    }
  }
  
  e.target.value = val;
  performCalculation(true);
});

billInput.addEventListener('blur', (e) => {
  const val = parseFloat(e.target.value);
  if (!isNaN(val) && val > 0) {
    // Standardize representation on blur
    e.target.value = val.toFixed(2);
  }
  validateInputs();
});

// Tip preset selector handlers
presetButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Update active class
    presetButtons.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-checked', 'true');
    
    const tipValue = btn.dataset.tip;
    if (tipValue === 'custom') {
      isCustomTip = true;
      customTipBox.classList.remove('hidden');
      syncSliderProgress();
    } else {
      isCustomTip = false;
      currentTipPercent = parseInt(tipValue);
      customTipBox.classList.add('hidden');
    }
    
    performCalculation(true);
  });
});

// Slider visual updates and calculations
tipSlider.addEventListener('input', (e) => {
  sliderValDisplay.textContent = `${e.target.value}%`;
  syncSliderProgress();
  performCalculation(true);
});

// People split counter and spinner logic
peopleInput.addEventListener('input', (e) => {
  let val = e.target.value;
  // Strip non-digits
  val = val.replace(/[^0-9]/g, '');
  e.target.value = val;
  
  const count = parseInt(val) || 0;
  peopleSuffixTxt.textContent = count === 1 ? 'Person' : 'People';
  
  performCalculation(true);
});

peopleInput.addEventListener('blur', () => {
  validateInputs();
});

btnDecrement.addEventListener('click', () => {
  const currentVal = parseInt(peopleInput.value) || 1;
  if (currentVal > 1) {
    peopleInput.value = currentVal - 1;
    peopleSuffixTxt.textContent = (currentVal - 1) === 1 ? 'Person' : 'People';
    performCalculation(true);
  }
});

btnIncrement.addEventListener('click', () => {
  const currentVal = parseInt(peopleInput.value) || 1;
  peopleInput.value = currentVal + 1;
  peopleSuffixTxt.textContent = 'People';
  performCalculation(true);
});

// Action triggers
btnReset.addEventListener('click', () => {
  // Clear Inputs
  billInput.value = '';
  billInput.classList.remove('user-invalid');
  billInput.removeAttribute('aria-invalid');
  
  peopleInput.value = '1';
  peopleInput.classList.remove('user-invalid');
  peopleInput.removeAttribute('aria-invalid');
  peopleSuffixTxt.textContent = 'Person';
  
  // Reset presets
  presetButtons.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-checked', 'false');
  });
  const defaultPreset = presetButtons[0];
  defaultPreset.classList.add('active');
  defaultPreset.setAttribute('aria-checked', 'true');
  
  isCustomTip = false;
  currentTipPercent = 10;
  customTipBox.classList.add('hidden');
  
  // Recalculate displays
  performCalculation(false);
  showToast('Reset completed');
});

btnSave.addEventListener('click', () => {
  saveHistoryItem();
});

// Delegate load / delete clicks in history
historyList.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  
  const itemEl = btn.closest('.history-item');
  const itemId = parseInt(itemEl.dataset.id);
  const action = btn.dataset.action;
  
  if (action === 'load') {
    loadHistoryItem(itemId);
  } else if (action === 'delete') {
    deleteHistoryItem(itemId);
  }
});

btnClearHistory.addEventListener('click', clearAllHistory);

btnShare.addEventListener('click', () => {
  if (!validateInputs()) return;
  
  const bill = parseFloat(billInput.value) || 0;
  const people = parseInt(peopleInput.value) || 1;
  const tip = isCustomTip ? parseInt(tipSlider.value) : currentTipPercent;
  const results = calculateSplit(bill, tip, people);
  
  const summaryText = `
FareShare — Split Bill Summary
---------------------------------------------
Date: ${new Date().toLocaleDateString()}
Subtotal Bill: $${formatCurrency(bill)}
Tip Percentage: ${tip}%
Total Tip: $${formatCurrency(results.totalTip)}
Total Bill with Tip: $${formatCurrency(results.grandTotal)}
Split between: ${people} ${people === 1 ? 'person' : 'people'}

=============================================
EACH PERSON PAYS: $${formatCurrency(results.splitShare)}
(Base: $${formatCurrency(results.baseShare)} + Tip: $${formatCurrency(results.tipShare)})
=============================================
Thank you for using FareShare!
`.trim();

  navigator.clipboard.writeText(summaryText)
    .then(() => {
      showToast('Summary copied to clipboard!');
    })
    .catch(() => {
      showToast('Failed to copy. Please try again.');
    });
});

// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');

const toggleTheme = (event) => {
  if (!document.startViewTransition) {
    // Normal transition if view transitions are not supported
    document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('fareshare_theme', document.documentElement.classList.contains('light-mode') ? 'light' : 'dark');
    return;
  }
  
  const x = event.clientX ?? window.innerWidth / 2;
  const y = event.clientY ?? window.innerHeight / 2;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );
  
  const transition = document.startViewTransition(() => {
    document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('fareshare_theme', document.documentElement.classList.contains('light-mode') ? 'light' : 'dark');
  });
  
  transition.ready.then(() => {
    const isLightMode = document.documentElement.classList.contains('light-mode');
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`
    ];
    document.documentElement.animate(
      {
        clipPath: clipPath
      },
      {
        duration: 450,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)'
      }
    );
  });
};

themeToggleBtn.addEventListener('click', toggleTheme);

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // Sync Saved Theme
  const savedTheme = localStorage.getItem('fareshare_theme');
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-mode');
  }
  
  syncSliderProgress();
  loadHistory();
  // Ensure default outputs are showing zero correctly without animations
  performCalculation(false);
});
