function loadScript(src, onLoad) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    if (existing.dataset.loaded === 'true') {
      onLoad?.();
    } else {
      existing.addEventListener('load', onLoad, { once: true });
    }
    return existing;
  }

  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.addEventListener('load', () => {
    script.dataset.loaded = 'true';
    onLoad?.();
  }, { once: true });
  document.body.appendChild(script);
  return script;
}

function loadSupascribe() {
  loadScript('https://js.supascribe.com/v1/loader/k5O4c7irqNWwFEZKt9I0MjIidsf2.js');
}

window.addEventListener('load', () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => setTimeout(loadSupascribe, 300));
  } else {
    setTimeout(loadSupascribe, 1500);
  }
}, { once: true });

// Wait for DOM to load before running scripts
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScripts);
} else {
  initializeScripts();
}

function initializeScripts() {
  /* ── Year ── */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ── Nav scroll solidify ── */
  const nav = document.getElementById('nav');
  const scrolledClasses = ['bg-zinc-950/90', 'backdrop-blur-lg', 'border-zinc-800'];
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add(...scrolledClasses);
      nav.classList.remove('border-transparent');
    } else {
      nav.classList.remove(...scrolledClasses);
      nav.classList.add('border-transparent');
    }
  }, { passive: true });

  /* ── Mobile nav toggle ── */
  const toggle   = document.getElementById('navToggle');
  const menu     = document.getElementById('mobileMenu');

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── Scroll reveal ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  /* ── Skill bars ── */
  const skillSection = document.getElementById('skillBars');
  if (skillSection) {
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) {
        document.querySelectorAll('.skill-fill').forEach(fill => {
          fill.style.width = fill.dataset.width + '%';
        });
        obs.disconnect();
      }
    }, { threshold: 0.3 }).observe(skillSection);
  }

  /* ── Stat counters ── */
  new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el       = entry.target;
      const target   = +el.dataset.count;
      const duration = 1200;
      const start    = performance.now();
      const tick = (now) => {
        const t     = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * target);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 }).observe(document.querySelector('[data-count]'));

  /* ── Contact form ── */
  const EMAILJS_SERVICE_ID  = 'service_qkaf3vr';
  const EMAILJS_TEMPLATE_ID = 'template_1wd6cnb';
  const EMAILJS_PUBLIC_KEY  = 'kmSRuN9N-LzkejUy-';

  const form     = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');

  function ensureEmailJs() {
    return new Promise((resolve, reject) => {
      if (window.emailjs) {
        window.emailjs.init(EMAILJS_PUBLIC_KEY);
        resolve();
        return;
      }

      const script = loadScript('https://cdn.emailjs.com/dist/email.min.js', () => {
        if (window.emailjs) {
          window.emailjs.init(EMAILJS_PUBLIC_KEY);
          resolve();
        } else {
          reject(new Error('EmailJS failed to load.'));
        }
      });

      script.addEventListener('error', () => reject(new Error('EmailJS failed to load.')), { once: true });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) { showStatus('Please fill in all fields.', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showStatus('Please enter a valid email address.', 'error'); return; }

    ensureEmailJs().then(() => {
      emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
        .then(() => {
          showStatus("Message sent! I'll get back to you within 24 hours.", 'success');
          form.reset();
        }, (err) => {
          console.error('EmailJS error:', err);
          showStatus('Something went wrong. Please try again later.', 'error');
        });
    }).catch((err) => {
      console.error('EmailJS load error:', err);
      showStatus('Something went wrong. Please try again later.', 'error');
    });
  });

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = type === 'success'
      ? 'text-sm px-4 py-3 rounded-md bg-green-500/10 text-green-400 border border-green-500/20'
      : 'text-sm px-4 py-3 rounded-md bg-red-500/10 text-red-400 border border-red-500/20';
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
