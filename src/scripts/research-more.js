(function () {
  const toggle = document.querySelector('[data-more-toggle]');
  const panel = document.querySelector('[data-more-panel]');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    const opening = !expanded;
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.setAttribute('aria-pressed', String(opening));
    panel.hidden = expanded;
    if (opening) {
      const clearBtn = document.querySelector('[data-filter-clear]');
      if (clearBtn) clearBtn.click();
    }
  });
})();
