/**
 * AllerPure — Main Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initRTLToggle();
  initMobileDrawer();
  initHeaderScroll();
  initReveal();
  initCounters();
  initAccordion();
  initAllergyExplorer();
  initForms();
  initPasswordToggle();
});

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================================
   Theme Toggle (Dark / Light)
   ========================================================================== */
function initThemeToggle() {
  const themeToggles = document.querySelectorAll('.theme-toggle');

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  });
}

function setTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcons('moon');
  } else {
    document.documentElement.removeAttribute('data-theme');
    updateThemeIcons('sun');
  }
  localStorage.setItem('theme', theme);
}

function updateThemeIcons(activeIcon) {
  document.querySelectorAll('.theme-toggle').forEach(toggle => {
    if (activeIcon === 'moon') {
      toggle.innerHTML = '<i class="ph ph-sun"></i>';
      toggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
      toggle.innerHTML = '<i class="ph ph-moon"></i>';
      toggle.setAttribute('aria-label', 'Switch to dark mode');
    }
  });
}

/* ==========================================================================
   RTL Toggle
   ========================================================================== */
function initRTLToggle() {
  const rtlToggles = document.querySelectorAll('.rtl-toggle');

  if (localStorage.getItem('isRTL') === 'true') setRTL(true);

  rtlToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
      setRTL(!isRTL);
    });
  });
}

function setRTL(isRTL) {
  const html = document.documentElement;
  if (isRTL) {
    html.setAttribute('dir', 'rtl');
    html.classList.add('rtl');
  } else {
    html.setAttribute('dir', 'ltr');
    html.classList.remove('rtl');
  }
  localStorage.setItem('isRTL', isRTL);
}

/* ==========================================================================
   Mobile Drawer
   ========================================================================== */
function initMobileDrawer() {
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  const closeBtn = document.querySelector('.drawer-close');

  if (!hamburger || !drawer || !overlay) return;

  const openDrawer = () => {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Close when navigating to an in-page anchor
  drawer.querySelectorAll('.drawer-nav-link, .drawer-actions a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) closeDrawer();
  });
}

/* ==========================================================================
   Header — condense on scroll
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ==========================================================================
   Scroll Reveal
   ========================================================================== */
function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  items.forEach(el => observer.observe(el));
}

/* ==========================================================================
   Animated Counters
   ========================================================================== */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const render = (el, value) => {
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const shown = value >= 1000 && decimals === 0
      ? Math.round(value).toLocaleString()
      : value.toFixed(decimals);
    el.textContent = shown + suffix;
  };

  const run = el => {
    const target = parseFloat(el.dataset.count);
    if (prefersReducedMotion()) { render(el, target); return; }

    const duration = 1600;
    const start = performance.now();

    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      render(el, target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(run);
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ==========================================================================
   Accordion (FAQ)
   ========================================================================== */
function initAccordion() {
  const items = document.querySelectorAll('.accordion-item');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;

    trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close siblings within the same accordion
      item.closest('.accordion')?.querySelectorAll('.accordion-item.open').forEach(other => {
        if (other === item) return;
        other.classList.remove('open');
        other.querySelector('.accordion-panel').style.maxHeight = null;
        other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
      });

      item.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = isOpen ? null : panel.scrollHeight + 'px';
    });
  });
}

/* ==========================================================================
   Interactive Allergy Profile Explorer (home2)
   --------------------------------------------------------------------------
   Educational scoring model. Each answer contributes weight to five allergen
   categories; the side panel ranks them live and recommends a next step.
   ========================================================================== */
function initAllergyExplorer() {
  const root = document.getElementById('allergyExplorer');
  if (!root) return;

  const CATEGORIES = ['pollen', 'dust', 'pet', 'mould', 'food'];

  // weight maps: answer value -> per-category points
  const WEIGHTS = {
    symptom: {
      nasal:     { pollen: 3, dust: 3, pet: 2, mould: 2, food: 0 },
      eyes:      { pollen: 4, dust: 2, pet: 3, mould: 1, food: 0 },
      skin:      { pollen: 1, dust: 1, pet: 3, mould: 1, food: 4 },
      breathing: { pollen: 2, dust: 3, pet: 3, mould: 3, food: 2 },
      gut:       { pollen: 0, dust: 0, pet: 0, mould: 0, food: 6 },
      sinus:     { pollen: 2, dust: 3, pet: 1, mould: 3, food: 0 }
    },
    timing: {
      spring:    { pollen: 6, dust: 1, pet: 1, mould: 1, food: 0 },
      autumn:    { pollen: 3, dust: 2, pet: 1, mould: 5, food: 0 },
      yearround: { pollen: 1, dust: 5, pet: 4, mould: 3, food: 1 },
      meals:     { pollen: 0, dust: 0, pet: 0, mould: 0, food: 7 }
    },
    place: {
      indoors:   { pollen: 0, dust: 5, pet: 3, mould: 3, food: 0 },
      outdoors:  { pollen: 6, dust: 0, pet: 0, mould: 2, food: 0 },
      pets:      { pollen: 0, dust: 1, pet: 7, mould: 0, food: 0 },
      damp:      { pollen: 0, dust: 2, pet: 0, mould: 6, food: 0 }
    },
    otc: {
      'yes-nohelp': { pollen: 1, dust: 1, pet: 1, mould: 1, food: 2 },
      'yes-some':   { pollen: 1, dust: 1, pet: 1, mould: 1, food: 0 },
      no:           { pollen: 0, dust: 0, pet: 0, mould: 0, food: 0 }
    }
  };

  const SEVERITY_LABELS = ['Minimal', 'Mild', 'Moderate', 'Marked', 'Severe'];

  const RECOMMENDATIONS = {
    pollen: {
      badge: 'Seasonal profile',
      title: 'Environmental skin-prick panel',
      copy: 'Your pattern points to seasonal pollen. A skin-prick panel pinpoints the exact grasses, trees or weeds — and immunotherapy can retrain the response.'
    },
    dust: {
      badge: 'Perennial indoor profile',
      title: 'Indoor allergen panel',
      copy: 'Year-round indoor symptoms usually trace to dust mite. Testing confirms it, and a combined avoidance plus immunotherapy plan works well.'
    },
    pet: {
      badge: 'Animal dander profile',
      title: 'Dander-specific IgE testing',
      copy: 'Symptoms clustering around animals suggest dander sensitivity. Specific IgE testing tells you which species — and whether immunotherapy can help you keep your pet.'
    },
    mould: {
      badge: 'Mould-spore profile',
      title: 'Mould panel &amp; home assessment',
      copy: 'Damp-linked and autumn symptoms point toward mould spores. We combine a mould panel with practical guidance on the home environment.'
    },
    food: {
      badge: 'Food-related profile',
      title: 'Supervised food allergy workup',
      copy: 'Reactions tied to eating need a careful workup: specific IgE testing, and where appropriate a supervised oral challenge in clinic.'
    }
  };

  const state = { symptom: [], timing: [], place: [], otc: [], severity: 3 };
  let step = 1;
  const totalSteps = 3;

  // Element refs
  const stepEls = root.querySelectorAll('[data-ex-step]');
  const stepLabel = root.querySelector('[data-ex-step-label]');
  const progress = root.querySelector('[data-ex-progress]');
  const prevBtn = root.querySelector('[data-ex-prev]');
  const nextBtn = root.querySelector('[data-ex-next]');
  const resetBtn = root.querySelector('[data-ex-reset]');
  const idlePanel = root.querySelector('[data-ex-idle]');
  const livePanel = root.querySelector('[data-ex-live]');
  const sevLabel = root.querySelector('[data-ex-sev-label]');
  const severityInput = root.querySelector('[data-ex-severity]');
  const badgeEl = root.querySelector('[data-ex-badge]');
  const titleEl = root.querySelector('[data-ex-title]');
  const copyEl = root.querySelector('[data-ex-copy]');

  /* ---- Option selection ---- */
  root.querySelectorAll('[data-ex-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.exOpt;
      const value = btn.dataset.value;
      const isSingle = btn.hasAttribute('data-single');

      if (isSingle) {
        root.querySelectorAll(`[data-ex-opt="${group}"]`).forEach(sibling => {
          sibling.classList.toggle('selected', sibling === btn && !btn.classList.contains('selected'));
        });
        state[group] = btn.classList.contains('selected') ? [value] : [];
      } else {
        btn.classList.toggle('selected');
        state[group] = btn.classList.contains('selected')
          ? state[group].concat(value)
          : state[group].filter(v => v !== value);
      }

      update();
    });
  });

  /* ---- Severity slider ---- */
  severityInput?.addEventListener('input', () => {
    state.severity = parseInt(severityInput.value, 10);
    if (sevLabel) sevLabel.textContent = SEVERITY_LABELS[state.severity - 1];
    update();
  });

  /* ---- Step navigation ---- */
  const showStep = n => {
    step = Math.min(Math.max(n, 1), totalSteps);
    stepEls.forEach(el => el.classList.toggle('active', Number(el.dataset.exStep) === step));
    if (stepLabel) stepLabel.textContent = `Step ${step} of ${totalSteps}`;
    if (progress) progress.style.width = `${(step / totalSteps) * 100}%`;
    if (prevBtn) prevBtn.disabled = step === 1;
    if (nextBtn) {
      nextBtn.innerHTML = step === totalSteps
        ? 'See my profile <i class="ph ph-sparkle"></i>'
        : 'Next <i class="ph ph-arrow-right"></i>';
    }
  };

  prevBtn?.addEventListener('click', () => showStep(step - 1));

  nextBtn?.addEventListener('click', () => {
    if (step < totalSteps) {
      showStep(step + 1);
      return;
    }
    // Final step: make sure the result panel is in view on narrow screens
    update();
    if (window.innerWidth <= 1024) {
      root.querySelector('.explorer-side')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  resetBtn?.addEventListener('click', () => {
    ['symptom', 'timing', 'place', 'otc'].forEach(group => { state[group] = []; });
    state.severity = 3;
    root.querySelectorAll('[data-ex-opt]').forEach(b => b.classList.remove('selected'));
    if (severityInput) severityInput.value = 3;
    if (sevLabel) sevLabel.textContent = SEVERITY_LABELS[2];
    showStep(1);
    update();
  });

  /* ---- Scoring ---- */
  const score = () => {
    const totals = { pollen: 0, dust: 0, pet: 0, mould: 0, food: 0 };

    ['symptom', 'timing', 'place', 'otc'].forEach(group => {
      state[group].forEach(value => {
        const weights = WEIGHTS[group][value];
        if (!weights) return;
        CATEGORIES.forEach(cat => { totals[cat] += weights[cat]; });
      });
    });

    // Severity nudges every non-zero category upward
    const severityFactor = 0.85 + (state.severity - 1) * 0.075; // 0.85 → 1.15
    CATEGORIES.forEach(cat => { totals[cat] *= severityFactor; });

    const max = Math.max(...CATEGORIES.map(c => totals[c]));
    const percents = {};
    CATEGORIES.forEach(cat => {
      percents[cat] = max > 0 ? Math.round((totals[cat] / max) * 100) : 0;
    });

    return { totals, percents, max };
  };

  /* ---- Render ---- */
  const update = () => {
    const answered = ['symptom', 'timing', 'place', 'otc']
      .reduce((n, group) => n + state[group].length, 0);

    if (answered === 0) {
      idlePanel.hidden = false;
      idlePanel.style.display = '';
      livePanel.hidden = true;
      livePanel.style.display = 'none';
      return;
    }

    idlePanel.hidden = true;
    idlePanel.style.display = 'none';
    livePanel.hidden = false;
    livePanel.style.display = 'flex';

    const { percents, max } = score();

    // Rank so the strongest category reads first
    const ranked = CATEGORIES.slice().sort((a, b) => percents[b] - percents[a]);

    ranked.forEach((cat, index) => {
      const bar = root.querySelector(`[data-ex-bar="${cat}"]`);
      const val = root.querySelector(`[data-ex-val="${cat}"]`);
      const row = bar?.closest('.readout-row');
      if (bar) bar.style.width = percents[cat] + '%';
      if (val) val.textContent = percents[cat] + '%';
      if (row) row.style.order = index;
    });


    // Recommendation from the leading category
    const leader = ranked[0];
    const confident = answered >= 2 && max > 0;

    if (confident && RECOMMENDATIONS[leader]) {
      const rec = RECOMMENDATIONS[leader];
      badgeEl.textContent = rec.badge;
      titleEl.innerHTML = rec.title;
      copyEl.innerHTML = rec.copy;
    } else {
      badgeEl.textContent = 'Gathering answers';
      titleEl.textContent = 'Keep going';
      copyEl.textContent = 'Answer a couple more questions for a suggested next step.';
    }
  };

  showStep(1);
  update();
}

/* ==========================================================================
   Form Validation
   ========================================================================== */
function initForms() {
  const forms = document.querySelectorAll('.validate-form');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      form.querySelectorAll('.form-control[required]').forEach(input => {
        if (!validateInput(input)) isValid = false;
      });

      const checkbox = form.querySelector('input[type="checkbox"][required]');
      if (checkbox) {
        const group = checkbox.closest('.checkbox-group') || checkbox.parentElement;
        group.classList.toggle('error', !checkbox.checked);
        if (!checkbox.checked) isValid = false;
      }

      // Password match check for register
      const pwd = form.querySelector('input[name="password"]');
      const confirmPwd = form.querySelector('input[name="confirmPassword"]');
      if (pwd && confirmPwd && pwd.value !== confirmPwd.value) {
        setError(confirmPwd, 'Passwords do not match');
        isValid = false;
      }

      if (!isValid) return;

      const btn = form.querySelector('button[type="submit"]');
      if (!btn) { form.reset(); return; }

      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Processing…';
      btn.disabled = true;

      setTimeout(() => {
        form.reset();
        form.querySelectorAll('.form-group').forEach(g => g.classList.remove('success', 'error'));
        btn.innerHTML = '<i class="ph ph-check-circle"></i> Request sent';

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }, 2200);
      }, 1400);
    });

    // Real-time validation
    form.querySelectorAll('.form-control[required]').forEach(input => {
      input.addEventListener('blur', () => validateInput(input));
      input.addEventListener('input', () => {
        input.closest('.form-group')?.classList.remove('error', 'success');
      });
    });
  });
}

function validateInput(input) {
  const type = input.type;
  const val = input.value.trim();
  let isValid = true;
  let errorMsg = 'This field is required';

  if (!val) {
    isValid = false;
  } else if (type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      isValid = false;
      errorMsg = 'Please enter a valid email address';
    }
  } else if (type === 'password') {
    if (val.length < 8) {
      isValid = false;
      errorMsg = 'Password must be at least 8 characters';
    }
  }

  isValid ? setSuccess(input) : setError(input, errorMsg);
  return isValid;
}

function setError(input, message) {
  const group = input.closest('.form-group');
  if (!group) return;
  group.classList.add('error');
  group.classList.remove('success');
  const errorElement = group.querySelector('.error-message');
  if (errorElement) errorElement.textContent = message;
}

function setSuccess(input) {
  const group = input.closest('.form-group');
  if (!group) return;
  group.classList.remove('error');
  group.classList.add('success');
}

function initPasswordToggle() {
  document.querySelectorAll('.toggle-password-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrap = btn.closest('.password-input-wrap') || btn.parentElement;
      const input = wrap.querySelector('input');
      const icon = btn.querySelector('i');
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.className = 'ph ph-eye-slash';
      } else {
        input.type = 'password';
        if (icon) icon.className = 'ph ph-eye';
      }
    });
  });
}
