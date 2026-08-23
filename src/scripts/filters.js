// Drives FilterBar.astro against a `[data-filter-list]` of `[data-filterable]`
// items. AND across facets, OR within a facet (brief §1): an item must match
// at least one selected value in EVERY facet that has a selection. Filter
// state round-trips through the URL query string so filtered views are
// linkable and the back button works.
(function () {
  const bar = document.querySelector('[data-filter-bar]');
  const list = document.querySelector('[data-filter-list]');
  if (!bar || !list) return;

  const items = Array.from(list.querySelectorAll('[data-filterable]'));
  const chips = Array.from(bar.querySelectorAll('.chip'));
  const searchInput = bar.querySelector('[data-filter-search]');
  const clearBtn = bar.querySelector('[data-filter-clear]');
  const status = bar.querySelector('[data-filter-status]') || document.querySelector('[data-filter-status]');
  const facetKeys = Array.from(new Set(chips.map((c) => c.dataset.facet)));

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function getActive() {
    const active = {};
    for (const key of facetKeys) {
      active[key] = chips
        .filter((c) => c.dataset.facet === key && c.getAttribute('aria-pressed') === 'true')
        .map((c) => c.dataset.value);
    }
    return active;
  }

  function matches(item, active, query) {
    for (const key of facetKeys) {
      const wanted = active[key];
      if (!wanted || wanted.length === 0) continue;
      const itemValues = (item.dataset['facet' + capitalize(key)] || '').split(' ');
      if (!wanted.some((v) => itemValues.includes(v))) return false;
    }
    if (query) {
      const hay = item.dataset.search || '';
      if (!hay.includes(query)) return false;
    }
    return true;
  }

  function updateYearGroups() {
    document.querySelectorAll('[data-year-group]').forEach((group) => {
      const anyVisible = Array.from(group.querySelectorAll('[data-filterable]')).some((i) => !i.hidden);
      group.hidden = !anyVisible;
    });
  }

  function updateCounts(active, query) {
    chips.forEach((chip) => {
      const key = chip.dataset.facet;
      const testActive = {};
      for (const k of facetKeys) testActive[k] = k === key ? [chip.dataset.value] : active[k];
      const count = items.filter((item) => matches(item, testActive, query)).length;
      const countEl = chip.querySelector('[data-count]');
      if (countEl) countEl.textContent = String(count);
      chip.disabled = count === 0 && chip.getAttribute('aria-pressed') !== 'true';
    });
  }

  function updateURL(active, query, pushHistory) {
    const params = new URLSearchParams();
    for (const key of facetKeys) {
      for (const v of active[key]) params.append(key, v);
    }
    if (query) params.set('q', query);
    const newURL = params.toString() ? `?${params}` : location.pathname;
    if (pushHistory) {
      history.pushState(null, '', newURL);
    } else {
      history.replaceState(null, '', newURL);
    }
  }

  function applyFilters(pushHistory) {
    const active = getActive();
    const query = (searchInput && searchInput.value.trim().toLowerCase()) || '';
    let visible = 0;
    items.forEach((item) => {
      const ok = matches(item, active, query);
      item.hidden = !ok;
      if (ok) visible += 1;
    });
    updateCounts(active, query);
    updateURL(active, query, pushHistory);
    updateYearGroups();
    if (status) status.textContent = `${visible} of ${items.length} shown`;
  }

  function readURL() {
    const params = new URLSearchParams(location.search);
    chips.forEach((chip) => {
      const values = params.getAll(chip.dataset.facet);
      chip.setAttribute('aria-pressed', values.includes(chip.dataset.value) ? 'true' : 'false');
    });
    if (searchInput) searchInput.value = params.get('q') || '';
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const pressed = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', String(!pressed));
      applyFilters(true);
    });
  });

  let debounceTimer;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => applyFilters(false), 300);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
      if (searchInput) searchInput.value = '';
      applyFilters(true);
    });
  }

  window.addEventListener('popstate', () => {
    readURL();
    applyFilters(false);
  });

  readURL();
  applyFilters(false);
})();
