// Positions margin notes next to their reference line on wide viewports,
// resolving overlaps by stacking; collapses to a tap-to-expand toggle below
// ~1100px. See src/plugins/rehype-margin-notes.mjs for the markup this
// operates on, and margin-notes.css for the two presentation modes.
(function () {
  var article = document.querySelector('.article-body');
  if (!article) return;

  var entries = Array.from(article.querySelectorAll('.margin-note'))
    .map(function (note) {
      var refId = note.getAttribute('data-ref-id');
      var ref = refId ? document.getElementById(refId) : null;
      // Footnote-derived notes have a clickable `<sup>` reference and collapse
      // on narrow viewports; author-placed <Aside> anchors are inert markers
      // with nothing to tap, so they just stay visible inline on mobile.
      var isFootnote = !!ref && ref.tagName === 'A' && ref.hasAttribute('data-footnote-ref');
      return { note: note, ref: ref, isFootnote: isFootnote };
    })
    .filter(function (e) {
      return e.ref;
    });

  if (!entries.length) return;

  var mq = window.matchMedia('(min-width: 1100px)');
  var GAP = 16;

  function positionDesktop() {
    var articleRect = article.getBoundingClientRect();
    var items = entries
      .map(function (e) {
        var refRect = e.ref.getBoundingClientRect();
        return { note: e.note, naturalTop: refRect.top - articleRect.top };
      })
      .sort(function (a, b) {
        return a.naturalTop - b.naturalTop;
      });

    var prevBottom = -Infinity;
    items.forEach(function (item) {
      var top = Math.max(item.naturalTop, prevBottom + GAP);
      item.note.style.top = top + 'px';
      item.note.hidden = false;
      item.note.setAttribute('data-positioned', '');
      prevBottom = top + item.note.offsetHeight;
    });
  }

  function collapseMobile() {
    entries.forEach(function (e) {
      if (e.isFootnote && !e.note.hasAttribute('data-mobile-init')) {
        e.note.hidden = true;
        e.note.setAttribute('data-mobile-init', '');
      }
      e.note.style.top = '';
      e.note.removeAttribute('data-positioned');
    });
  }

  function layout() {
    if (mq.matches) {
      positionDesktop();
    } else {
      collapseMobile();
    }
  }

  entries
    .filter(function (e) {
      return e.isFootnote;
    })
    .forEach(function (e) {
      e.ref.setAttribute('aria-expanded', 'false');
      e.ref.addEventListener('click', function (event) {
        if (mq.matches) return; // desktop: the note is already visible in the margin
        event.preventDefault();
        var willExpand = e.note.hidden;
        e.note.hidden = !willExpand;
        e.ref.setAttribute('aria-expanded', String(willExpand));
        e.ref.classList.toggle('is-active', willExpand);
      });
    });

  if (window.ResizeObserver) {
    new ResizeObserver(layout).observe(article);
  } else {
    window.addEventListener('resize', layout);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layout);
  }

  mq.addEventListener('change', layout);

  layout();
})();
