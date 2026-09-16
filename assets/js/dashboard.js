/**
 * AllerPure - Patient Dashboard Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initRTLToggle();
  initDashboardTabs();
  initSidebarDrawer();
  initUserShortcut();
});

/* Theme + RTL — the portal doesn't load main.js, but it shares its
   localStorage keys so the preference carries over from the site. */
function initThemeToggle() {
  const toggles = document.querySelectorAll('.theme-toggle');
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const setTheme = theme => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
    toggles.forEach(toggle => {
      toggle.innerHTML = theme === 'dark' ? '<i class="ph ph-sun"></i>' : '<i class="ph ph-moon"></i>';
      toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  };

  setTheme(saved || (prefersDark ? 'dark' : 'light'));

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  });
}

function initRTLToggle() {
  const toggles = document.querySelectorAll('.rtl-toggle');

  const setRTL = isRTL => {
    const html = document.documentElement;
    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    html.classList.toggle('rtl', isRTL);
    localStorage.setItem('isRTL', isRTL);
  };

  if (localStorage.getItem('isRTL') === 'true') setRTL(true);

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      setRTL(document.documentElement.getAttribute('dir') !== 'rtl');
    });
  });
}

/* The header avatar opens the Settings pane */
function initUserShortcut() {
  const user = document.querySelector('.dash-user');
  const settingsLink = document.querySelector('.dashboard-nav-link[href="#settings"]');

  if (!user || !settingsLink) return;

  user.addEventListener('click', e => {
    e.preventDefault();
    settingsLink.click();
  });
}

/**
 * Tablet & mobile (<= 1024px): the sidebar slides in from the header hamburger.
 */
function initSidebarDrawer() {
  const hamburger = document.querySelector('.dash-hamburger');
  const sidebar = document.querySelector('.dashboard-sidebar');
  const overlay = document.querySelector('.dash-drawer-overlay');
  const closeBtn = document.querySelector('.dash-drawer-close');

  if (!hamburger || !sidebar || !overlay) return;

  const isDrawerMode = () => window.matchMedia('(max-width: 1024px)').matches;

  const openDrawer = () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  // The drawer sits below the header, so the hamburger is the visible open
  // AND close control - clicking it again must dismiss the panel.
  hamburger.addEventListener('click', () => {
    if (sidebar.classList.contains('active')) closeDrawer();
    else openDrawer();
  });
  closeBtn?.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Picking a section closes the drawer so the pane is visible
  sidebar.querySelectorAll('.dashboard-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (isDrawerMode()) closeDrawer();
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) closeDrawer();
  });

  // Resizing back to desktop must not leave the page scroll-locked
  window.addEventListener('resize', () => {
    if (!isDrawerMode() && sidebar.classList.contains('active')) closeDrawer();
  });
}

function initDashboardTabs() {
  const tabLinks = document.querySelectorAll('.dashboard-nav-link');
  const tabPanes = document.querySelectorAll('.dashboard-pane');
  
  if (tabLinks.length === 0) return;
  
  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href').substring(1);
      if(targetId === 'logout') return; // Let actual logout link work if it navigates away
      
      // Remove active class from all links and panes
      tabLinks.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      // Add active class to clicked link and corresponding pane
      link.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}
