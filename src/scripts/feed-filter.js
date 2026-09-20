(function () {
  const root = document.querySelector('[data-feed-filter]');
  const list = document.querySelector('[data-feed-list]');
  if (!root || !list) return;

  const pills = Array.from(root.querySelectorAll('[data-filter-value]'));
  const items = Array.from(list.querySelectorAll('[data-type]'));
  const browseLinks = Array.from(document.querySelectorAll('[data-feed-browse]'));

  const ALLOW = {
    all: null,
    research: ['publication'],
    blog: ['blogpost'],
  };

  function apply(filter) {
    const allow = ALLOW[filter];
    items.forEach((item) => {
      item.hidden = allow
        ? !allow.includes(item.dataset.type) || item.dataset.typeRank === undefined
        : item.dataset.allRank === undefined && !item.classList.contains('feed-card--pinned');
    });
    browseLinks.forEach((link) => {
      link.hidden = link.dataset.feedBrowse !== filter;
    });
    pills.forEach((pill) => {
      pill.setAttribute('aria-pressed', String(pill.dataset.filterValue === filter));
    });
  }

  pills.forEach((pill) => {
    pill.setAttribute('role', 'button');
    pill.addEventListener('click', (event) => {
      event.preventDefault();
      apply(pill.dataset.filterValue);
    });
  });

  apply('all');
})();
